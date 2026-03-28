import { Router, Request, Response } from 'express';
import { registerUser, loginUser, refreshAccessToken, getUserById, updateUserProfile, logoutUser } from '../services/authService';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { z } from 'zod';

const router = Router();

const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(1),
  styleGoals: z.array(z.string()).optional(),
  lifestyle: z.array(z.string()).optional(),
  confidencePainPoints: z.array(z.string()).optional(),
});

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

router.post('/register', async (req: Request, res: Response) => {
  try {
    const parsed = RegisterSchema.parse(req.body);
    const tokens = await registerUser(parsed);
    res.status(201).json(tokens);
  } catch (e: any) {
    if (e instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation failed', details: e.errors });
    }
    res.status(400).json({ error: e.message });
  }
});

router.post('/login', async (req: Request, res: Response) => {
  try {
    const parsed = LoginSchema.parse(req.body);
    const tokens = await loginUser(parsed.email, parsed.password);
    res.json(tokens);
  } catch (e: any) {
    if (e instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation failed', details: e.errors });
    }
    res.status(401).json({ error: e.message });
  }
});

router.post('/refresh', async (req: Request, res: Response) => {
  try {
    const tokens = await refreshAccessToken(req.body.refreshToken);
    res.json(tokens);
  } catch (e: any) {
    res.status(401).json({ error: e.message });
  }
});

router.post('/logout', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    await logoutUser(req.body.refreshToken);
    res.json({ success: true });
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

router.get('/me', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const user = await getUserById(req.userId!);
    res.json(user);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

router.patch('/me', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const user = await updateUserProfile(req.userId!, req.body);
    res.json(user);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

export default router;
