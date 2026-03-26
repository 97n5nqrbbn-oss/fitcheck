import { prisma } from '../lib/prisma';
import { cloudinary } from '../lib/cloudinary';

export interface UpdateProfileData {
  displayName?: string;
  username?: string;
  bio?: string;
}

export const userService = {
  async getProfile(userId: string) {
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
      throw new Error('User not found');
    }

    return user;
  },

  async updateProfile(userId: string, data: UpdateProfileData) {
    if (data.username) {
      const existing = await prisma.user.findFirst({
        where: { username: data.username, NOT: { id: userId } },
      });
      if (existing) {
        throw new Error('Username already taken');
      }
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        name: data.displayName,
        username: data.username,
        bio: data.bio,
      },
      select: {
        id: true,
        email: true,
        name: true,
        username: true,
        avatarUrl: true,
        bio: true,
        createdAt: true,
      },
    });

    return user;
  },

  async updateAvatar(userId: string, imageBuffer: Buffer, mimetype: string) {
    const result = await cloudinary.uploadBuffer(imageBuffer, {
      folder: 'fitcheck/avatars',
      public_id: `avatar_${userId}`,
      overwrite: true,
      resource_type: 'image',
    });

    const user = await prisma.user.update({
      where: { id: userId },
      data: { avatarUrl: result.secure_url },
      select: {
        id: true,
        avatarUrl: true,
      },
    });

    return user;
  },

  async getStats(userId: string) {
    const [outfitCount, garmentCount, recentOutfits] = await Promise.all([
      prisma.outfit.count({ where: { userId } }),
      prisma.garment.count({ where: { userId } }),
      prisma.outfit.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true,
          confidenceScore: true,
          createdAt: true,
        },
      }),
    ]);

    const avgScore =
      recentOutfits.length > 0
        ? recentOutfits.reduce((sum, o) => sum + (o.confidenceScore || 0), 0) /
          recentOutfits.length
        : 0;

    return {
      totalOutfits: outfitCount,
      totalGarments: garmentCount,
      averageConfidenceScore: Math.round(avgScore),
      recentOutfits,
    };
  },

  async deleteAccount(userId: string) {
    await prisma.user.delete({ where: { id: userId } });
  },
};
