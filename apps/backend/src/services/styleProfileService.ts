import { prisma } from '../lib/prisma';

export interface StyleQuizAnswers {
  bodyType?: string;
  colorSeason?: string;
  styleGoals: string[];
  lifestyle: string[];
  confidencePainPoints: string[];
  budget?: string;
  preferredOccasions?: string[];
}

export async function saveStyleProfile(userId: string, answers: StyleQuizAnswers) {
  return prisma.user.update({
    where: { id: userId },
    data: {
      bodyType: answers.bodyType,
      colorSeason: answers.colorSeason,
      styleGoals: answers.styleGoals,
      lifestyle: answers.lifestyle,
      confidencePainPoints: answers.confidencePainPoints,
    },
  });
}

export async function getStyleProfile(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      username: true,
      avatarUrl: true,
      bio: true,
      bodyType: true,
      colorSeason: true,
      styleGoals: true,
      lifestyle: true,
      confidencePainPoints: true,
    },
  });
}

export async function hasCompletedStyleQuiz(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { styleGoals: true, lifestyle: true },
  });
  return !!user && user.styleGoals.length > 0 && user.lifestyle.length > 0;
}

export async function updateColorSeason(userId: string, colorSeason: string) {
  return prisma.user.update({
    where: { id: userId },
    data: { colorSeason },
  });
}

export async function updateBodyType(userId: string, bodyType: string) {
  return prisma.user.update({
    where: { id: userId },
    data: { bodyType },
  });
}
