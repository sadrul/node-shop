import express from 'express';
import {
  homePage,
  productPage,
  cartPage,
  checkoutPage,
  processCheckout,
  orderSuccess,
  addToCart,
  updateCart,
  removeFromCart,
  registerPage,
  loginPage,
  ordersPage
} from '../controllers/pageController';
import { isAuthenticated, checkAuth } from '../middleware/auth';

const router = express.Router();

// Public routes with auth check
router.get('/', checkAuth, homePage);
router.get('/product/:id', checkAuth, productPage);
router.get('/register', registerPage);
router.get('/login', loginPage);

// Protected routes
router.get('/cart', isAuthenticated, cartPage);
router.get('/checkout', isAuthenticated, checkoutPage);
router.post('/checkout', isAuthenticated, processCheckout);
router.get('/order/success', isAuthenticated, orderSuccess);
router.get('/orders', isAuthenticated, ordersPage);

// Cart actions
router.post('/cart/add', isAuthenticated, addToCart);
router.post('/cart/update', isAuthenticated, updateCart);
router.delete('/cart/remove/:productId', isAuthenticated, removeFromCart);

export default router;