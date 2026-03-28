import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma';
import { env } from '../config/env';

export async function registerUser(data: {
  email: string; password: string; name: string;
  styleGoals?: string[]; lifestyle?: string[]; confidencePainPoints?: string[];
}) {
  const existing = await prisma.user.findUnique({ where: { email: data.email } });
  if (existing) throw new Error('Email already in use');
  const passwordHash = await bcrypt.hash(data.password, 12);
  const user = await prisma.user.create({
    data: {
      email: data.email, passwordHash, name: data.name,
      styleGoals: data.styleGoals || [],
      lifestyle: data.lifestyle || [],
      confidencePainPoints: data.confidencePainPoints || [],
    },
  });
  return generateTokens(user.id);
}

export async function loginUser(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new Error('Invalid credentials');
  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) throw new Error('Invalid credentials');
  return generateTokens(user.id);
}

export async function refreshAccessToken(refreshToken: string) {
  const stored = await prisma.refreshToken.findUnique({ where: { token: refreshToken } });
  if (!stored || stored.expiresAt < new Date()) throw new Error('Invalid refresh token');
  await prisma.refreshToken.delete({ where: { token: refreshToken } });
  return generateTokens(stored.userId);
}

export async function generateTokens(userId: string) {
  const accessToken = jwt.sign({ userId }, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN as any });
  const refreshToken = jwt.sign({ userId }, env.JWT_REFRESH_SECRET, { expiresIn: env.JWT_REFRESH_EXPIRES_IN as any });
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);
  await prisma.refreshToken.create({ data: { token: refreshToken, userId, expiresAt } });
  return { accessToken, refreshToken };
}

export async function getUserById(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, name: true, styleGoals: true, lifestyle: true, confidencePainPoints: true, bodyType: true, createdAt: true },
  });
}

export async function updateUserProfile(userId: string, data: Partial<{
  name: string; styleGoals: string[]; lifestyle: string[]; bodyType: string; confidencePainPoints: string[];
}>) {
  return prisma.user.update({ where: { id: userId }, data });
}

export async function logoutUser(refreshToken: string) {
  await prisma.refreshToken.deleteMany({ where: { token: refreshToken } });
}

export async function deleteAccount(userId: string) {
  await prisma.refreshToken.deleteMany({ where: { userId } });
  await prisma.user.delete({ where: { id: userId } });
}
