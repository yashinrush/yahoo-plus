import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { prisma } from '../db/prisma.js';
import { requireAuth, AuthRequest } from '../middleware/auth.middleware.js';
import { authRateLimiter } from '../middleware/rateLimiter.js';

const JWT_SECRET = process.env.JWT_SECRET || 'yahoo-pulse-jwt-super-secret-key-2026';

export const authRouter = Router();

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(2),
  region: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

/**
 * POST /api/auth/register
 */
authRouter.post('/register', authRateLimiter, async (req: Request, res: Response) => {
  try {
    const parse = registerSchema.safeParse(req.body);
    if (!parse.success) {
      return res.status(400).json({ status: 'error', errors: parse.error.format() });
    }

    const { email, password, name, region } = parse.data;
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ status: 'error', message: 'Email already registered' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        name,
        region: region || 'tokyo',
      },
    });

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      status: 'ok',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        region: user.region,
        preferredCategories: user.preferredCategories,
        points: user.points,
      },
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ status: 'error', message: 'Registration failed' });
  }
});

/**
 * POST /api/auth/login
 */
authRouter.post('/login', authRateLimiter, async (req: Request, res: Response) => {
  try {
    const parse = loginSchema.safeParse(req.body);
    if (!parse.success) {
      return res.status(400).json({ status: 'error', errors: parse.error.format() });
    }

    const { email, password } = parse.data;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ status: 'error', message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ status: 'error', message: 'Invalid email or password' });
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });

    res.status(200).json({
      status: 'ok',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        region: user.region,
        preferredCategories: user.preferredCategories,
        points: user.points,
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ status: 'error', message: 'Login failed' });
  }
});

/**
 * GET /api/auth/me
 */
authRouter.get('/me', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        region: true,
        preferredCategories: true,
        points: true,
        createdAt: true,
      },
    });

    res.status(200).json({ status: 'ok', user });
  } catch (err) {
    console.error('Fetch me error:', err);
    res.status(500).json({ status: 'error', message: 'Failed to fetch user profile' });
  }
});
