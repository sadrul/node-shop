import { Request, Response } from 'express';
import Product from '../models/Product';
import User from '../models/User';
import Cart, { ICart } from '../models/Cart';
import Order from '../models/Order';
import jwt from 'jsonwebtoken';
import { stripe } from '../config/stripe';
import { Document } from 'mongoose';

interface AuthRequest extends Request {
  user?: {
    _id: string;
    name: string;
    email: string;
  };
}

interface PopulatedCartItem {
  product: {
    _id: string;
    name: string;
    price: number;
    image: string;
  };
  quantity: number;
}

interface PopulatedCart extends Omit<ICart, 'items'> {
  items: PopulatedCartItem[];
}

export const homePage = async (req: AuthRequest, res: Response) => {
  const products = await Product.find({});
  res.render('home', { title: 'Home', products, user: req.user });
};

export const productPage = async (req: AuthRequest, res: Response) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).render('error', {
        message: 'Product not found',
        error: {},
        user: req.user
      });
    }
    res.render('product', {
      title: product.name,
      product,
      user: req.user
    });
  } catch (error) {
    console.error('Product page error:', error);
    res.status(500).render('error', {
      message: 'Error loading product',
      error: {},
      user: req.user
    });
  }
};

export const cartPage = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      return res.redirect('/login');
    }

    const cart = await Cart.findOne({ user: userId }).populate('items.product');
    res.render('cart', { 
      title: 'Cart',
      cart: cart || { items: [] },
      user: req.user
    });
  } catch (error) {
    console.error('Cart page error:', error);
    res.status(500).render('error', { 
      message: 'Error loading cart',
      error: {},
      user: req.user
    });
  }
};

export const loginPage = (req: AuthRequest, res: Response) => {
  if (req.user) {
    return res.redirect('/');
  }
  res.render('login', { title: 'Login', user: req.user });
};

export const registerPage = (req: AuthRequest, res: Response) => {
  if (req.user) {
    return res.redirect('/');
  }
  res.render('register', { title: 'Register', user: req.user });
};

export const checkoutPage = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      return res.redirect('/login');
    }

    const cart = await Cart.findOne({ user: userId }).populate('items.product');
    res.render('checkout', { 
      title: 'Checkout',
      cart: cart || { items: [] },
      user: req.user,
      stripePublicKey: process.env.STRIPE_PUBLIC_KEY
    });
  } catch (error) {
    console.error('Checkout page error:', error);
    res.status(500).render('error', { 
      message: 'Error loading checkout',
      error: {},
      user: req.user
    });
  }
};

export const processCheckout = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { paymentMethodId, name, email, address, city, zipCode } = req.body;

    // Get cart with populated product details
    const cart = await Cart.findOne({ user: userId })
      .populate({
        path: 'items.product',
        select: 'name price'
      });

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ error: 'Cart is empty' });
    }

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(cart.total * 100), // Convert to cents
      currency: 'usd',
      payment_method: paymentMethodId,
      confirm: true,
      return_url: `${req.protocol}://${req.get('host')}/order/success`,
    });

    // Create order with product details
    const order = new Order({
      user: userId,
      items: cart.items.map(item => ({
        product: item.product._id,
        quantity: item.quantity,
        price: (item.product as any).price // Type assertion since we know it's populated
      })),
      total: cart.total,
      shippingAddress: {
        name,
        email,
        address,
        city,
        zipCode
      },
      paymentStatus: 'completed',
      stripePaymentId: paymentIntent.id
    });

    await order.save();

    // Clear cart
    await Cart.findOneAndDelete({ user: userId });

    res.json({ success: true });
  } catch (error) {
    console.error('Checkout error:', error);
    res.status(500).json({ error: 'Error processing payment' });
  }
};

export const orderSuccess = async (req: AuthRequest, res: Response) => {
  try {
    res.render('order-success', {
      title: 'Order Successful',
      user: req.user
    });
  } catch (error) {
    console.error('Order success page error:', error);
    res.status(500).render('error', {
      message: 'Error loading order success page',
      error: {},
      user: req.user
    });
  }
};

// Authentication controllers
export const register = async (req: AuthRequest, res: Response) => {
  try {
    const { name, email, password } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.render('register', { 
        title: 'Register', 
        error: 'Email already exists',
        user: req.user
      });
    }

    const user = new User({ name, email, password });
    await user.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'your-secret-key');
    res.cookie('token', token, { httpOnly: true });
    res.redirect('/');
  } catch (error) {
    res.render('register', { 
      title: 'Register', 
      error: 'Error registering user',
      user: req.user
    });
  }
};

export const login = async (req: AuthRequest, res: Response) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.render('login', { 
        title: 'Login', 
        error: 'Invalid email or password',
        user: req.user
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.render('login', { 
        title: 'Login', 
        error: 'Invalid email or password',
        user: req.user
      });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'your-secret-key');
    res.cookie('token', token, { httpOnly: true });
    res.redirect('/');
  } catch (error) {
    res.render('login', { 
      title: 'Login', 
      error: 'Error logging in',
      user: req.user
    });
  }
};

export const logout = (req: AuthRequest, res: Response) => {
  res.clearCookie('token');
  res.redirect('/');
};

// Cart controllers
export const addToCart = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { productId, quantity } = req.body;
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    let cart = await Cart.findOne({ user: userId });

    if (!cart) {
      cart = new Cart({ user: userId, items: [] });
    }

    const existingItem = cart.items.find(item => item.product.toString() === productId);

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.items.push({ product: productId, quantity });
    }

    await cart.save();

    // Populate items after saving to calculate total
    const populatedCart = await Cart.findById(cart._id).populate<{ items: PopulatedCartItem[] }>('items.product') as (Document & PopulatedCart) | null;
    
    if (!populatedCart) {
      return res.status(404).json({ error: 'Cart not found after save' });
    }

    // Recalculate total after populating items
    populatedCart.total = populatedCart.items.reduce((sum, item) => {
      return sum + (item.product.price * item.quantity);
    }, 0);

    await populatedCart.save();
    res.json({ success: true, cart: populatedCart });
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({ error: 'Error adding to cart' });
  }
};

export const updateCart = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { productId, quantity } = req.body;
    const cart = await Cart.findOne({ user: userId }).populate<{ items: PopulatedCartItem[] }>('items.product');

    if (!cart) {
      return res.status(404).json({ error: 'Cart not found' });
    }

    const item = cart.items.find(item => item.product._id.toString() === productId);
    if (!item) {
      return res.status(404).json({ error: 'Item not found in cart' });
    }

    item.quantity = quantity;
    
    // Recalculate total
    cart.total = cart.items.reduce((sum, item) => {
      return sum + (item.product.price * item.quantity);
    }, 0);

    await cart.save();
    res.json({ success: true, cart });
  } catch (error) {
    console.error('Update cart error:', error);
    res.status(500).json({ error: 'Error updating cart' });
  }
};

export const removeFromCart = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { productId } = req.params;
    const cart = await Cart.findOne({ user: userId }).populate<{ items: PopulatedCartItem[] }>('items.product');

    if (!cart) {
      return res.status(404).json({ error: 'Cart not found' });
    }

    cart.items = cart.items.filter(item => item.product._id.toString() !== productId);
    
    // Recalculate total
    cart.total = cart.items.reduce((sum, item) => {
      return sum + (item.product.price * item.quantity);
    }, 0);

    await cart.save();
    res.json({ success: true, cart });
  } catch (error) {
    console.error('Remove from cart error:', error);
    res.status(500).json({ error: 'Error removing from cart' });
  }
};

export const ordersPage = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      return res.redirect('/login');
    }

    const orders = await Order.find({ user: userId })
      .populate('items.product')
      .sort({ createdAt: -1 });

    res.render('orders', {
      title: 'My Orders',
      orders,
      user: req.user
    });
  } catch (error) {
    console.error('Orders page error:', error);
    res.status(500).render('error', {
      message: 'Error loading orders',
      error: {},
      user: req.user
    });
  }
};