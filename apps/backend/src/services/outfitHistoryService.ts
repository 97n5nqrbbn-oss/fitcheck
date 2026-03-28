import { prisma } from '../lib/prisma';

export async function saveOutfitToHistory(userId: string, outfitId: string) {
  // Mark outfit as worn today
  return prisma.outfit.update({
    where: { id: outfitId },
    data: { wornCount: { increment: 1 }, lastWornAt: new Date() },
  });
}

export async function rateOutfit(userId: string, outfitId: string, rating: number, notes?: string) {
  if (rating < 1 || rating > 5) throw new Error('Rating must be between 1 and 5');
  return prisma.feedback.create({
    data: {
      userId,
      outfitId,
      rating,
      notes: notes || '',
    },
  });
}

export async function getOutfitHistory(userId: string, limit = 20) {
  return prisma.outfit.findMany({
    where: { userId, wornCount: { gt: 0 } },
    orderBy: { lastWornAt: 'desc' },
    take: limit,
    include: {
      items: {
        include: { garment: true },
      },
      feedbacks: {
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
    },
  });
}

export async function getUserOutfitStats(userId: string) {
  const [totalOutfits, totalWorn, avgRating] = await Promise.all([
    prisma.outfit.count({ where: { userId } }),
    prisma.outfit.count({ where: { userId, wornCount: { gt: 0 } } }),
    prisma.feedback.aggregate({
      where: { userId },
      _avg: { rating: true },
    }),
  ]);

  const favoriteOutfit = await prisma.outfit.findFirst({
    where: { userId },
    orderBy: { wornCount: 'desc' },
    include: { items: { include: { garment: true } } },
  });

  return {
    totalOutfits,
    totalWorn,
    averageRating: avgRating._avg.rating ?? 0,
    favoriteOutfit,
  };
}

export async function getTopRatedOutfits(userId: string, limit = 5) {
  const topRated = await prisma.feedback.groupBy({
    by: ['outfitId'],
    where: { userId },
    _avg: { rating: true },
    orderBy: { _avg: { rating: 'desc' } },
    take: limit,
  });

  const outfitIds = topRated.map(r => r.outfitId).filter(Boolean) as string[];
  return prisma.outfit.findMany({
    where: { id: { in: outfitIds } },
    include: { items: { include: { garment: true } } },
  });
}
