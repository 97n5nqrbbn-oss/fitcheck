import { Router, Request, Response } from 'express';
import multer from 'multer';
import { outfitService } from '../services/outfit.service';

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

// GET /api/outfits — list user's outfit analyses
router.get('/', async (req: Request, res: Response) => {
  try {
    const outfits = await outfitService.getAll(req.user!.id);
    res.json(outfits);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch outfit history' });
  }
});

// POST /api/outfits/analyze — analyze outfit image with Perplexity AI
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

// GET /api/outfits/:id — get single outfit analysis
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const outfit = await outfitService.getOne(req.params.id, req.user!.id);
    if (!outfit) return res.status(404).json({ error: 'Not found' });
    res.json(outfit);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch outfit' });
  }
});

// DELETE /api/outfits/:id — delete outfit analysis
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    await outfitService.delete(req.params.id, req.user!.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete outfit' });
  }
});

export default router;
