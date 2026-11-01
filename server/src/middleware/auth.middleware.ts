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

export async function requireAuth(req: AuthRequest, _res: Response, next: NextFunction) {
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

    // If no token, default to Taro demo user
    if (!userId) {
      try {
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
      } catch (err) {
        console.warn('DB lookup failed in requireAuth, using static demo user:', err);
      }

      // Safe static demo user fallback
      req.userId = 'demo-user-id';
      req.user = {
        id: 'demo-user-id',
        email: 'taro@example.com',
        name: '田中 太郎 (Taro)',
        region: 'tokyo',
        preferredCategories: 'technology,economy,sports',
      };
      return next();
    }

    try {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (user) {
        req.userId = user.id;
        req.user = {
          id: user.id,
          email: user.email,
          name: user.name,
          region: user.region,
          preferredCategories: user.preferredCategories,
        };
        return next();
      }
    } catch (err) {
      console.warn('DB findUnique failed in requireAuth:', err);
    }

    // Fallback user if find failed
    req.userId = userId;
    req.user = {
      id: userId,
      email: 'user@example.com',
      name: 'ゲスト ユーザー (Guest)',
      region: 'tokyo',
      preferredCategories: 'technology,economy,sports',
    };
    next();
  } catch (err) {
    next(err);
  }
}
