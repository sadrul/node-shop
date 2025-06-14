import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';

interface AuthRequest extends Request {
  user?: {
    _id: string;
    name: string;
    email: string;
  };
}

export const isAuthenticated = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.redirect('/login');
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as { id: string };
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.redirect('/login');
    }

    req.user = {
      _id: user._id.toString(),
      name: user.name,
      email: user.email
    };

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.redirect('/login');
  }
};

// Middleware to check auth state without redirecting
export const checkAuth = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      req.user = undefined;
      return next();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as { id: string };
    const user = await User.findById(decoded.id);

    if (!user) {
      req.user = undefined;
      return next();
    }

    req.user = {
      _id: user._id.toString(),
      name: user.name,
      email: user.email
    };

    next();
  } catch (error) {
    console.error('Auth check error:', error);
    req.user = undefined;
    next();
  }
}; 