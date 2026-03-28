# AGENTS.md - FitCheck AI Context

> This file is the single source of truth for AI coding assistants working on FitCheck.
> Read this FIRST before modifying any code.

## PROJECT OVERVIEW

- **Name:** FitCheck
- **Type:** AI-powered personal stylist mobile app
- **Stack:** TypeScript monorepo (Turborepo)
- **Backend:** Express.js + Prisma ORM + PostgreSQL
- **Mobile:** React Native (Expo)
- **AI Models:** OpenAI gpt-4o (vision/images), Perplexity Sonar Pro (text generation)
- **Image Storage:** Cloudinary
- **Auth:** JWT access + refresh token pattern
- **Deadline:** December 2026

## REPO STRUCTURE

```
fitcheck/
  apps/
    backend/               # Express API server
      prisma/
        schema.prisma      # Database schema (PostgreSQL)
      src/
        config/
          env.ts           # Environment variable validation
        lib/
          prisma.ts        # Prisma client singleton
          perplexity.ts    # Perplexity/OpenAI client (SONAR_PRO)
          cloudinary.ts    # Cloudinary upload/delete
        middleware/
          auth.ts          # JWT auth middleware (exports: authMiddleware, authenticate)
          errorHandler.ts  # Global error handler
          validate.ts      # Zod request validation
        routes/
          auth.ts          # POST /register, /login, /refresh | GET /me | PATCH /me
          wardrobe.ts      # Garment CRUD endpoints
          outfits.ts       # Outfit generation + CRUD
          users.ts         # Profile, avatar, stats
        services/
          authService.ts           # register, login, refresh, logout, deleteAccount, tokens
          aiService.ts             # Image analysis (gpt-4o), outfit suggestions (Sonar Pro)
          wardrobeService.ts       # addGarment (Cloudinary + AI tag), getWardrobe
          outfitService.ts         # generateOutfits (AI pipeline), CRUD
          userService.ts           # getProfile, updateProfile, uploadAvatar, getUserStats
          styleProfileService.ts   # Style quiz: save/get profile, body type, color season
          outfitHistoryService.ts  # Outfit history: save, rate, stats, top-rated
        types/
          express.d.ts     # Request augmentation: user?: {id, email, username}
        app.ts             # Express app with all routes wired
        server.ts          # Server startup + DB connection check
      .env.example         # All required env vars documented
      Dockerfile
      package.json
      tsconfig.json
    mobile/                # React Native (Expo) - not yet built
  docker-compose.yml
  package.json             # Turborepo root
```

## DATABASE SCHEMA (Prisma)

### Models

| Model | Key Fields | Relations |
|-------|-----------|----------|
| User | id, email, passwordHash, name, username, avatarUrl, bio, bodyType, colorSeason, styleGoals[], lifestyle[], confidencePainPoints[] | has many: Garment, Outfit, Feedback, RefreshToken |
| Garment | id, userId, name, category, color, formality, season[], tags[], imageUrl | belongs to: User; has many: OutfitItem |
| Outfit | id, userId, occasion, season, wornCount, lastWornAt | belongs to: User; has many: OutfitItem, Feedback |
| OutfitItem | id, outfitId, garmentId | belongs to: Outfit, Garment |
| Feedback | id, userId, outfitId, rating (1-5), notes | belongs to: User, Outfit |
| RefreshToken | id, token, userId, expiresAt | belongs to: User |

## API ROUTES

### Auth (public)
| Method | Path | Handler | Description |
|--------|------|---------|-------------|
| POST | /api/auth/register | authService.registerUser | Create account + return tokens |
| POST | /api/auth/login | authService.loginUser | Validate credentials + return tokens |
| POST | /api/auth/refresh | authService.refreshAccessToken | Rotate refresh token |
| POST | /api/auth/logout | authService.logoutUser | Invalidate refresh token |

### Auth (protected - requires JWT)
| Method | Path | Handler | Description |
|--------|------|---------|-------------|
| GET | /api/auth/me | authService.getUserById | Get current user profile |
| PATCH | /api/auth/me | authService.updateUserProfile | Update profile fields |

### Wardrobe (protected)
| Method | Path | Handler | Description |
|--------|------|---------|-------------|
| POST | /api/wardrobe | wardrobeService.addGarment | Upload image + AI auto-tag |
| GET | /api/wardrobe | wardrobeService.getWardrobe | List garments with filters |

### Outfits (protected)
| Method | Path | Handler | Description |
|--------|------|---------|-------------|
| POST | /api/outfits/generate | outfitService.generateOutfits | AI outfit generation |
| GET | /api/outfits | outfitService.getSavedOutfits | List saved outfits |
| POST | /api/outfits/:id/save | outfitService.saveOutfit | Save an outfit |
| DELETE | /api/outfits/:id | outfitService.deleteOutfit | Delete outfit |

## AI SERVICE ARCHITECTURE

### Image Analysis (Vision)
- **Model:** OpenAI `gpt-4o`
- **Function:** `analyzeGarmentImage(imageUrl, notes?)`
- **Input:** Cloudinary image URL + optional user notes
- **Output:** `GarmentAnalysis { name, category, color, formality, season[], tags[] }`
- **Why gpt-4o:** Perplexity Sonar Pro does NOT support vision/image input

### Outfit Generation (Text)
- **Model:** Perplexity `sonar-pro`
- **Function:** `generateOutfitSuggestions(garments, occasion, season, userProfile)`
- **System Prompt:** SYSTEM_PROMPT constant with Styling Brain knowledge baked in
- **Output:** `OutfitSuggestion[] { garmentIds[], occasion, reasoning, tip }`

### Style Coach (Text)
- **Model:** Perplexity `sonar-pro`
- **Function:** `getStyleCoach(outfitDesc, feedback, painPoints)`
- **Output:** 2-3 sentences of encouraging style advice

### Wardrobe Gap Analysis (Text)
- **Model:** Perplexity `sonar-pro`
- **Function:** `getWardrobeGapAnalysis(garments, lifestyle, styleGoals)`
- **Output:** Top 3 specific missing wardrobe pieces

## STYLING BRAIN (Domain Knowledge)

All AI text-generation functions use SYSTEM_PROMPT containing:

### Body Types
- **Hourglass:** balanced shoulders/hips, defined waist -> belts, fitted styles
- **Pear:** narrower shoulders, wider hips -> A-line, structured shoulders, dark bottoms
- **Apple:** fuller midsection -> empire waists, V-necks, flowy tops, straight-leg pants
- **Rectangle:** balanced, few curves -> peplum, ruffles, layering for shape
- **Inverted Triangle:** broad shoulders, narrow hips -> wide-leg pants, A-line skirts

### Color Seasons
- **Spring:** warm, light, clear - ivory, peach, coral, warm greens
- **Summer:** cool, muted, soft - lavender, dusty rose, soft blue, grey
- **Autumn:** warm, deep, muted - rust, olive, mustard, burgundy, camel
- **Winter:** cool, deep, clear - black, white, navy, jewel tones, icy pastels

### Proportion Rules
- Balance volume: fitted top + full bottom OR loose top + slim bottom
- 1/3 - 2/3 rule: break outfit into unequal visual parts
- Vertical lines elongate; horizontal lines widen

## ENVIRONMENT VARIABLES

| Variable | Purpose | Example |
|----------|---------|--------|
| DATABASE_URL | PostgreSQL connection | postgresql://user:pass@localhost:5432/fitcheck |
| JWT_SECRET | Access token signing (min 32 chars) | openssl rand -hex 32 |
| JWT_REFRESH_SECRET | Refresh token signing | openssl rand -hex 32 |
| JWT_EXPIRES_IN | Access token TTL | 15m |
| JWT_REFRESH_EXPIRES_IN | Refresh token TTL | 7d |
| PERPLEXITY_API_KEY | Sonar Pro text generation | pplx-xxxx |
| OPENAI_API_KEY | gpt-4o vision/image analysis | sk-xxxx |
| CLOUDINARY_CLOUD_NAME | Image storage cloud name | your-cloud |
| CLOUDINARY_API_KEY | Cloudinary API key | 123456 |
| CLOUDINARY_API_SECRET | Cloudinary API secret | abc123 |
| PORT | Server port | 3001 |
| NODE_ENV | Environment | development |

## CODING CONVENTIONS

- **Language:** TypeScript (strict mode)
- **ORM:** Always use `prisma` singleton from `lib/prisma.ts` - never create new PrismaClient
- **Validation:** Use Zod schemas with `validate.ts` middleware on routes
- **Auth:** Protected routes use `authenticate` middleware (alias for `authMiddleware`)
- **Errors:** Throw standard Error objects - `errorHandler.ts` catches globally
- **Services:** Business logic in `services/` - routes are thin wrappers
- **AI calls:** Image analysis -> OpenAI gpt-4o; text generation -> Perplexity Sonar Pro
- **File uploads:** Always go through Cloudinary (`lib/cloudinary.ts`)

## DO NOT

- Do NOT rebuild existing services - they are tested and working
- Do NOT use Perplexity Sonar Pro for image/vision tasks (it doesn't support it)
- Do NOT create new PrismaClient instances - use the singleton
- Do NOT store secrets in code - use env vars via `config/env.ts`
- Do NOT add routes without auth middleware on protected endpoints
- Do NOT skip Zod validation on request bodies
