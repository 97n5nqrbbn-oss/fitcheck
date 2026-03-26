import { perplexity, SONAR_PRO } from '../lib/perplexity';

export interface GarmentAnalysis {
  name: string; category: string; color: string;
  formality: string; season: string[]; tags: string[];
}

export interface OutfitSuggestion {
  garmentIds: string[]; occasion: string; reasoning: string; tip: string;
}

function parseJson<T>(raw: string, fallback: T): T {
  try { return JSON.parse(raw.replace(/```json|```/g, '').trim()); }
  catch { return fallback; }
}

export async function analyzeGarmentImage(imageUrl: string, notes?: string): Promise<GarmentAnalysis> {
  const prompt = `You are a fashion analyst. Analyze this clothing image and return ONLY valid JSON (no markdown):
{"name":"descriptive name","category":"top|bottom|shoes|outerwear|accessory","color":"primary color","formality":"casual|business_casual|formal","season":["spring","summer","fall","winter"],"tags":["style","tags"]}
${notes ? 'User notes: ' + notes : ''}`;

  const res = await perplexity.chat.completions.create({
    model: SONAR_PRO,
    messages: [{
      role: 'user',
      content: [
        { type: 'text', text: prompt },
        { type: 'image_url', image_url: { url: imageUrl } },
      ] as any,
    }],
    max_tokens: 400,
  });
  return parseJson<GarmentAnalysis>(res.choices[0].message.content || '{}', {
    name: 'Clothing Item', category: 'top', color: 'unknown',
    formality: 'casual', season: ['spring','summer','fall','winter'], tags: [],
  });
}

export async function generateOutfitSuggestions(p: {
  garments: any[]; occasion: string; season: string;
  userProfile: { styleGoals: string[]; lifestyle: string[]; confidencePainPoints: string[] };
  count?: number;
}): Promise<OutfitSuggestion[]> {
  const list = p.garments.map(g =>
    `ID:${g.id}|${g.name}|${g.category}|${g.color}|${g.formality}|tags:${g.tags.join(',')}`
  ).join('\n');
  const prompt = `You are FitCheck, a personal AI stylist.
USER: styleGoals=${p.userProfile.styleGoals.join(',')}, lifestyle=${p.userProfile.lifestyle.join(',')}, painPoints=${p.userProfile.confidencePainPoints.join(',')}
WARDROBE:\n${list}
Create ${p.count||3} outfit combinations for occasion=${p.occasion} season=${p.season}.
Return ONLY a valid JSON array (no markdown):
[{"garmentIds":["id1","id2"],"occasion":"${p.occasion}","reasoning":"why this works for confidence","tip":"one actionable tip"}]`;
  const res = await perplexity.chat.completions.create({
    model: SONAR_PRO,
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 1200,
  });
  return parseJson<OutfitSuggestion[]>(res.choices[0].message.content || '[]', []);
}

export async function getStyleCoach(outfitDesc: string, feedback: string, painPoints: string[]): Promise<string> {
  const res = await perplexity.chat.completions.create({
    model: SONAR_PRO,
    messages: [{ role: 'user', content: `You are a warm personal stylist. Outfit: ${outfitDesc}. User feedback: "${feedback}". Pain points: ${painPoints.join(',')}. Give 2-3 sentences of specific encouraging advice.` }],
    max_tokens: 300,
  });
  return res.choices[0].message.content || 'You look great!';
}

export async function getWardrobeGapAnalysis(garments: any[], lifestyle: string[], styleGoals: string[]): Promise<string> {
  const list = garments.map(g => `${g.name} (${g.category}, ${g.color}, ${g.formality})`).join('\n');
  const res = await perplexity.chat.completions.create({
    model: SONAR_PRO,
    messages: [{ role: 'user', content: `Wardrobe consultant: find top 3 missing pieces.\nWardrobe:\n${list}\nLifestyle: ${lifestyle.join(',')}\nGoals: ${styleGoals.join(',')}\nReturn numbered list. Be specific (e.g. "white Oxford shirt").` }],
    max_tokens: 400,
  });
  return res.choices[0].message.content || '';
}
