import { Router, Request, Response } from 'express';
import { saveStyleProfile, getStyleProfile, hasCompletedStyleQuiz } from '../services/styleProfileService';
import { z } from 'zod';

const router = Router();

const StyleQuizSchema = z.object({
  bodyType: z.string().optional(),
  colorSeason: z.string().optional(),
  styleGoals: z.array(z.string()).min(1, 'At least one style goal required'),
  lifestyle: z.array(z.string()).min(1, 'At least one lifestyle required'),
  confidencePainPoints: z.array(z.string()).default([]),
  budget: z.string().optional(),
  preferredOccasions: z.array(z.string()).optional(),
});

// POST /api/style-profile - Save style quiz answers
router.post('/', async (req: Request, res: Response) => {
  try {
    const parsed = StyleQuizSchema.parse(req.body);
    const profile = await saveStyleProfile(req.user!.id, parsed);
    res.json(profile);
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation failed', details: err.errors });
    }
    res.status(500).json({ error: err.message || 'Failed to save style profile' });
  }
});

// GET /api/style-profile - Get current user's style profile
router.get('/', async (req: Request, res: Response) => {
  try {
    const profile = await getStyleProfile(req.user!.id);
    if (!profile) return res.status(404).json({ error: 'Profile not found' });
    const quizCompleted = await hasCompletedStyleQuiz(req.user!.id);
    res.json({ ...profile, quizCompleted });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch style profile' });
  }
});

export default router;
