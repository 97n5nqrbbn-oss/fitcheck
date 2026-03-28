import { Router, Request, Response } from 'express';
import multer from 'multer';
import { outfitService } from '../services/outfit.service';
import { saveOutfitToHistory, rateOutfit, getOutfitHistory, getUserOutfitStats } from '../services/outfitHistoryService';
import { z } from 'zod';

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

const RateOutfitSchema = z.object({
  rating: z.number().min(1).max(5),
  notes: z.string().optional(),
});

// GET /api/outfits - list user's outfit analyses
router.get('/', async (req: Request, res: Response) => {
  try {
    const outfits = await outfitService.getAll(req.user!.id);
    res.json(outfits);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch outfit history' });
  }
});

// GET /api/outfits/history - get outfit wear history (before :id)
router.get('/history', async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 20;
    const history = await getOutfitHistory(req.user!.id, limit);
    res.json(history);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch history' });
  }
});

// GET /api/outfits/stats - get user outfit statistics (before :id)
router.get('/stats', async (req: Request, res: Response) => {
  try {
    const stats = await getUserOutfitStats(req.user!.id);
    res.json(stats);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch stats' });
  }
});

// POST /api/outfits/analyze - analyze outfit image with Perplexity AI
router.post('/analyze', upload.single('image'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Image file is required' });
    }
    const result = await outfitService.analyze(req.user!.id, req.file);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Analysis failed' });
  }
});

// GET /api/outfits/:id - get single outfit analysis
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const outfit = await outfitService.getOne(req.params.id, req.user!.id);
    if (!outfit) return res.status(404).json({ error: 'Not found' });
    res.json(outfit);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch outfit' });
  }
});

// DELETE /api/outfits/:id - delete outfit analysis
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    await outfitService.delete(req.params.id, req.user!.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete outfit' });
  }
});

// POST /api/outfits/:id/wear - mark outfit as worn today
router.post('/:id/wear', async (req: Request, res: Response) => {
  try {
    const result = await saveOutfitToHistory(req.user!.id, req.params.id);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to save outfit wear' });
  }
});

// POST /api/outfits/:id/rate - rate an outfit
router.post('/:id/rate', async (req: Request, res: Response) => {
  try {
    const parsed = RateOutfitSchema.parse(req.body);
    const result = await rateOutfit(req.user!.id, req.params.id, parsed.rating, parsed.notes);
    res.json(result);
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation failed', details: err.errors });
    }
    res.status(500).json({ error: err.message || 'Failed to rate outfit' });
  }
});

export default router;
