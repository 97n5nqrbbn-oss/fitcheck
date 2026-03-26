import { Router, Request, Response } from 'express';
import { registerUser, loginUser, refreshAccessToken, getUserById, updateUserProfile } from '../services/authService';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

router.post('/register', async (req: Request, res: Response) => {
  try {
    const tokens = await registerUser(req.body);
    res.status(201).json(tokens);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

router.post('/login', async (req: Request, res: Response) => {
  try {
    const tokens = await loginUser(req.body.email, req.body.password);
    res.json(tokens);
  } catch (e: any) {
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
