import OpenAI from 'openai';
import { env } from '../config/env';

// Perplexity is OpenAI-API-compatible
export const perplexity = new OpenAI({
  apiKey: env.PERPLEXITY_API_KEY,
  baseURL: 'https://api.perplexity.ai',
});

export const SONAR_PRO = 'sonar-pro';
