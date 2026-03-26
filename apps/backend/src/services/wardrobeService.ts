import { prisma } from '../lib/prisma';
import { uploadImage, deleteImage } from '../lib/cloudinary';
import { analyzeGarmentImage } from './aiService';

export async function addGarment(userId: string, imageBuffer: Buffer, notes?: string) {
  const { url, publicId } = await uploadImage(imageBuffer);
  const analysis = await analyzeGarmentImage(url, notes);
  return prisma.garment.create({
    data: {
      userId, name: analysis.name, category: analysis.category,
      color: analysis.color, formality: analysis.formality,
      season: analysis.season, tags: analysis.tags,
      imageUrl: url, imagePublicId: publicId, notes: notes || null,
    },
  });
}

export async function getWardrobe(userId: string, filters?: { category?: string; season?: string; formality?: string }) {
  const where: any = { userId };
  if (filters?.category) where.category = filters.category;
  if (filters?.formality) where.formality = filters.formality;
  if (filters?.season) where.season = { has: filters.season };
  return prisma.garment.findMany({ where, orderBy: { createdAt: 'desc' } });
}

export async function deleteGarment(userId: string, garmentId: string) {
  const garment = await prisma.garment.findFirst({ where: { id: garmentId, userId } });
  if (!garment) throw new Error('Garment not found');
  await deleteImage(garment.imagePublicId);
  await prisma.garment.delete({ where: { id: garmentId } });
}

export async function updateGarment(userId: string, garmentId: string, data: Partial<{
  name: string; category: string; color: string; formality: string;
  season: string[]; tags: string[]; notes: string;
}>) {
  const garment = await prisma.garment.findFirst({ where: { id: garmentId, userId } });
  if (!garment) throw new Error('Garment not found');
  return prisma.garment.update({ where: { id: garmentId }, data });
}
