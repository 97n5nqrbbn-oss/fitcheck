import { prisma } from '../lib/prisma';
import { generateOutfitSuggestions } from './aiService';

export async function generateOutfits(userId: string, occasion: string, season: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { styleGoals: true, lifestyle: true, confidencePainPoints: true },
  });
  if (!user) throw new Error('User not found');
  const garments = await prisma.garment.findMany({ where: { userId, season: { has: season } } });
  if (garments.length < 2) throw new Error('Add more garments for this season first');
  const suggestions = await generateOutfitSuggestions({ garments, occasion, season, userProfile: user, count: 3 });
  return Promise.all(suggestions.map(async (s) =>
    prisma.outfit.create({
      data: {
        userId, occasion: s.occasion, season,
        aiReasoning: s.reasoning, aiTip: s.tip,
        items: { create: s.garmentIds.map((garmentId) => ({ garmentId })) },
      },
      include: { items: { include: { garment: true } } },
    })
  ));
}

export async function getOutfits(userId: string, occasion?: string) {
  return prisma.outfit.findMany({
    where: { userId, ...(occasion ? { occasion } : {}) },
    include: { items: { include: { garment: true } }, feedbacks: true },
    orderBy: { createdAt: 'desc' },
    take: 20,
  });
}

export async function submitFeedback(userId: string, outfitId: string, data: {
  rating: string; formality?: number; vibe?: number;
}) {
  const outfit = await prisma.outfit.findFirst({ where: { id: outfitId, userId } });
  if (!outfit) throw new Error('Outfit not found');
  return prisma.feedback.upsert({
    where: { id: `${userId}_${outfitId}` },
    create: { userId, outfitId, ...data },
    update: data,
  });
}

export async function deleteOutfit(userId: string, outfitId: string) {
  const outfit = await prisma.outfit.findFirst({ where: { id: outfitId, userId } });
  if (!outfit) throw new Error('Outfit not found');
  await prisma.outfit.delete({ where: { id: outfitId } });
}
