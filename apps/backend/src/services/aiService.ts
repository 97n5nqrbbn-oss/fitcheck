import { perplexity, SONAR_PRO } from '../lib/perplexity';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const SYSTEM_PROMPT = `You are FitCheck, an expert AI personal stylist with deep knowledge of:

BODY TYPES & PROPORTIONS:
- Hourglass: balanced shoulders/hips, defined waist - highlight waist with belts, fitted styles
- Pear: narrower shoulders, wider hips - A-line skirts, structured shoulders, dark bottoms
- Apple: fuller midsection - empire waists, V-necks, flowy tops, straight leg pants
- Rectangle: balanced but few curves - peplum, ruffles, layering to create shape
- Inverted Triangle: broad shoulders, narrow hips - wide-leg pants, A-line skirts, avoid shoulder details

COLOR SEASONS:
- Spring: warm, light, clear - ivory, peach, coral, warm greens
- Summer: cool, muted, soft - lavender, dusty rose, soft blue, grey
- Autumn: warm, deep, muted - rust, olive, mustard, burgundy, camel
- Winter: cool, deep, clear - black, white, navy, jewel tones, icy pastels

OCCASION DRESSING:
- Casual: comfort + personality, relaxed fits, fun textures
- Business Casual: polished but approachable, blazers, chinos, clean silhouettes
- Formal: elegant, tailored, classic - suits, gowns, structured pieces
- Date Night: confident, attractive, personal style elevated
- Weekend: relaxed, layered, effortless

PROPORTION RULES:
- Balance volume: fitted top + full skirt OR loose top + slim pants
- Create visual interest with texture, color blocking, or layering
- The 1/3 - 2/3 rule: break outfit into unequal parts for visual interest
- Vertical lines elongate, horizontal lines widen
`;

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

  const res = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [{
      role: 'user',
      content: [
        { type: 'text', text: prompt },
        { type: 'image_url', image_url: { url: imageUrl } },
      ],
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
  const prompt = `USER: styleGoals=${p.userProfile.styleGoals.join(',')}, lifestyle=${p.userProfile.lifestyle.join(',')}, painPoints=${p.userProfile.confidencePainPoints.join(',')}
WARDROBE:\n${list}
Create ${p.count||3} outfit combinations for occasion=${p.occasion} season=${p.season}.
Return ONLY a valid JSON array (no markdown): [{"garmentIds":["id1","id2"],"occasion":"${p.occasion}","reasoning":"why this works for confidence","tip":"one actionable tip"}]`;

  const res = await perplexity.chat.completions.create({
    model: SONAR_PRO,
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: prompt },
    ],
    max_tokens: 1200,
  });
  return parseJson<OutfitSuggestion[]>(res.choices[0].message.content || '[]', []);
}

export async function getStyleCoach(outfitDesc: string, feedback: string, painPoints: string[]): Promise<string> {
  const res = await perplexity.chat.completions.create({
    model: SONAR_PRO,
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: `Outfit: ${outfitDesc}. User feedback: "${feedback}". Pain points: ${painPoints.join(',')}. Give 2-3 sentences of specific encouraging advice.` },
    ],
    max_tokens: 300,
  });
  return res.choices[0].message.content || 'You look great!';
}

export async function getWardrobeGapAnalysis(garments: any[], lifestyle: string[], styleGoals: string[]): Promise<string> {
  const list = garments.map(g => `${g.name} (${g.category}, ${g.color}, ${g.formality})`).join('\n');
  const res = await perplexity.chat.completions.create({
    model: SONAR_PRO,
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: `Find top 3 missing wardrobe pieces.\nWardrobe:\n${list}\nLifestyle: ${lifestyle.join(',')}\nGoals: ${styleGoals.join(',')}\nReturn numbered list. Be specific (e.g. "white Oxford shirt").` },
    ],
    max_tokens: 400,
  });
  return res.choices[0].message.content || '';
}
