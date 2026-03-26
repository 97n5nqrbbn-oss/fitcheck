import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/auth';
import { prisma } from '../lib/prisma';

const router = Router();

// GET /api/users/me - Get current user profile
router.get('/me', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        username: true,
        avatarUrl: true,
        bio: true,
        createdAt: true,
        _count: {
          select: {
            outfits: true,
            garments: true,
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/users/me - Update current user profile
router.put('/me', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { name, username, bio, avatarUrl } = req.body;

    // Check username uniqueness if provided
    if (username) {
      const existing = await prisma.user.findFirst({
        where: { username, NOT: { id: userId } },
      });
      if (existing) {
        return res.status(400).json({ error: 'Username already taken' });
      }
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(name && { name }),
        ...(username && { username }),
        ...(bio !== undefined && { bio }),
        ...(avatarUrl && { avatarUrl }),
      },
      select: {
        id: true,
        email: true,
        name: true,
        username: true,
        avatarUrl: true,
        bio: true,
        updatedAt: true,
      },
    });

    res.json({ user });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/users/me - Delete current user account
router.delete('/me', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;

    await prisma.user.delete({
      where: { id: userId },
    });

    res.status(204).send();
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/users/me/stats - Get user statistics
router.get('/me/stats', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;

    const [outfitCount, garmentCount, avgScore] = await Promise.all([
      prisma.outfit.count({ where: { userId } }),
      prisma.garment.count({ where: { userId } }),
      prisma.outfit.aggregate({
        where: { userId },
        _avg: { confidenceScore: true },
      }),
    ]);

    res.json({
      stats: {
        totalOutfits: outfitCount,
        totalGarments: garmentCount,
        averageConfidenceScore: Math.round(avgScore._avg.confidenceScore ?? 0),
      },
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
