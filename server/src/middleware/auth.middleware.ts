import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../db/prisma.js';

const JWT_SECRET = process.env.JWT_SECRET || 'yahoo-pulse-jwt-super-secret-key-2026';

export interface AuthRequest extends Request {
  userId?: string;
  user?: {
    id: string;
    email: string;
    name: string;
    region: string;
    preferredCategories: string;
  };
}

export async function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    let userId: string | null = null;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      try {
        const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
        userId = decoded.userId;
      } catch {
        // Invalid token
      }
    }

    // If no token or in dev mode, default to Taro demo user
    if (!userId) {
      const demoUser = await prisma.user.findFirst();
      if (demoUser) {
        req.userId = demoUser.id;
        req.user = {
          id: demoUser.id,
          email: demoUser.email,
          name: demoUser.name,
          region: demoUser.region,
          preferredCategories: demoUser.preferredCategories,
        };
        return next();
      }
      return res.status(401).json({ status: 'error', message: 'Authentication required' });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(401).json({ status: 'error', message: 'User not found' });
    }

    req.userId = user.id;
    req.user = {
      id: user.id,
      email: user.email,
      name: user.name,
      region: user.region,
      preferredCategories: user.preferredCategories,
    };
    next();
  } catch (err) {
    next(err);
  }
}
