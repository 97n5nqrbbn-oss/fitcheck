import { Router, Response } from 'express';
import multer from 'multer';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { addGarment, getWardrobe, deleteGarment, updateGarment } from '../services/wardrobeService';

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

router.use(authMiddleware);

router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const garments = await getWardrobe(req.userId!, req.query as any);
    res.json(garments);
  } catch (e: any) { res.status(400).json({ error: e.message }); }
});

router.post('/', upload.single('image'), async (req: AuthRequest, res: Response) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Image required' });
    const garment = await addGarment(req.userId!, req.file.buffer, req.body.notes);
    res.status(201).json(garment);
  } catch (e: any) { res.status(400).json({ error: e.message }); }
});

router.patch('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const garment = await updateGarment(req.userId!, req.params.id, req.body);
    res.json(garment);
  } catch (e: any) { res.status(400).json({ error: e.message }); }
});

router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    await deleteGarment(req.userId!, req.params.id);
    res.json({ success: true });
  } catch (e: any) { res.status(400).json({ error: e.message }); }
});

export default router;
