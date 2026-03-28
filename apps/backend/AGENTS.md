# Backend AGENTS.md - FitCheck API Server

> Backend-specific context for AI coding assistants.
> For project-wide context, see /AGENTS.md at repo root.

## QUICK REFERENCE

### Start the server
```bash
cd apps/backend
cp .env.example .env   # Fill in real values
npx prisma generate
npx prisma db push
npm run dev
```

### Run on port
Default: 3001 (configurable via PORT env var)

## FILE DEPENDENCY GRAPH

```
server.ts
  -> app.ts
       -> routes/auth.ts      -> services/authService.ts     -> lib/prisma.ts, config/env.ts
       -> routes/wardrobe.ts   -> services/wardrobeService.ts -> lib/prisma.ts, lib/cloudinary.ts, services/aiService.ts
       -> routes/outfits.ts    -> services/outfitService.ts   -> lib/prisma.ts, services/aiService.ts
       -> routes/users.ts      -> services/userService.ts     -> lib/prisma.ts, lib/cloudinary.ts
       -> middleware/auth.ts   -> config/env.ts (JWT_SECRET)
       -> middleware/errorHandler.ts
       -> middleware/validate.ts
```

## SERVICE FUNCTION SIGNATURES

### authService.ts
```typescript
registerUser(data: { email: string; password: string; name: string; styleGoals?: string[]; lifestyle?: string[]; confidencePainPoints?: string[] }): Promise<{ accessToken: string; refreshToken: string }>
loginUser(email: string, password: string): Promise<{ accessToken: string; refreshToken: string }>
refreshAccessToken(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }>
generateTokens(userId: string): Promise<{ accessToken: string; refreshToken: string }>
getUserById(userId: string): Promise<User | null>
updateUserProfile(userId: string, data: Partial<{ name; styleGoals; lifestyle; bodyType; confidencePainPoints }>): Promise<User>
logoutUser(refreshToken: string): Promise<void>
deleteAccount(userId: string): Promise<void>
```

### aiService.ts
```typescript
// VISION - uses OpenAI gpt-4o (NOT Perplexity)
analyzeGarmentImage(imageUrl: string, notes?: string): Promise<GarmentAnalysis>

// TEXT GENERATION - uses Perplexity sonar-pro with SYSTEM_PROMPT
generateOutfitSuggestions(p: { garments: any[]; occasion: string; season: string; userProfile: { styleGoals: string[]; lifestyle: string[]; confidencePainPoints: string[] }; count?: number }): Promise<OutfitSuggestion[]>
getStyleCoach(outfitDesc: string, feedback: string, painPoints: string[]): Promise<string>
getWardrobeGapAnalysis(garments: any[], lifestyle: string[], styleGoals: string[]): Promise<string>
```

### wardrobeService.ts
```typescript
addGarment(userId: string, file: Express.Multer.File, notes?: string): Promise<Garment>
getWardrobe(userId: string, filters?: { category?: string; season?: string; color?: string }): Promise<Garment[]>
```

### outfitService.ts
```typescript
generateOutfits(userId: string, occasion: string, season: string, count?: number): Promise<OutfitSuggestion[]>
getSavedOutfits(userId: string): Promise<Outfit[]>
saveOutfit(userId: string, suggestion: OutfitSuggestion): Promise<Outfit>
deleteOutfit(outfitId: string): Promise<void>
```

### styleProfileService.ts
```typescript
saveStyleProfile(userId: string, answers: StyleQuizAnswers): Promise<User>
getStyleProfile(userId: string): Promise<User | null>
hasCompletedStyleQuiz(userId: string): Promise<boolean>
updateColorSeason(userId: string, colorSeason: string): Promise<User>
updateBodyType(userId: string, bodyType: string): Promise<User>
```

### outfitHistoryService.ts
```typescript
saveOutfitToHistory(userId: string, outfitId: string): Promise<Outfit>
rateOutfit(userId: string, outfitId: string, rating: number, notes?: string): Promise<Feedback>
getOutfitHistory(userId: string, limit?: number): Promise<Outfit[]>
getUserOutfitStats(userId: string): Promise<{ totalOutfits; totalWorn; averageRating; favoriteOutfit }>
getTopRatedOutfits(userId: string, limit?: number): Promise<Outfit[]>
```

### userService.ts
```typescript
getProfile(userId: string): Promise<User>
updateProfile(userId: string, data: Partial<User>): Promise<User>
uploadAvatar(userId: string, file: Express.Multer.File): Promise<{ avatarUrl: string }>
getUserStats(userId: string): Promise<{ garmentCount; outfitCount; avgRating }>
```

## PRISMA SCHEMA (exact field names)

```prisma
model User {
  id                    String    @id @default(cuid())
  email                 String    @unique
  passwordHash          String
  name                  String
  username              String    @unique
  avatarUrl             String?
  bio                   String?
  bodyType              String?
  colorSeason           String?
  styleGoals            String[]
  lifestyle             String[]
  confidencePainPoints  String[]
  createdAt             DateTime  @default(now())
  updatedAt             DateTime  @updatedAt
  garments              Garment[]
  outfits               Outfit[]
  feedbacks             Feedback[]
  refreshTokens         RefreshToken[]
}

model Garment {
  id         String       @id @default(cuid())
  userId     String
  name       String
  category   String       // top|bottom|shoes|outerwear|accessory
  color      String
  formality  String       // casual|business_casual|formal
  season     String[]     // ["spring","summer","fall","winter"]
  tags       String[]
  imageUrl   String
  createdAt  DateTime     @default(now())
  user       User         @relation(fields: [userId], references: [id])
  outfitItems OutfitItem[]
}

model Outfit {
  id         String       @id @default(cuid())
  userId     String
  occasion   String
  season     String
  wornCount  Int          @default(0)
  lastWornAt DateTime?
  createdAt  DateTime     @default(now())
  user       User         @relation(fields: [userId], references: [id])
  items      OutfitItem[]
  feedbacks  Feedback[]
}

model OutfitItem {
  id        String  @id @default(cuid())
  outfitId  String
  garmentId String
  outfit    Outfit  @relation(fields: [outfitId], references: [id])
  garment   Garment @relation(fields: [garmentId], references: [id])
}

model Feedback {
  id        String   @id @default(cuid())
  userId    String
  outfitId  String
  rating    Int      // 1-5
  notes     String   @default("")
  createdAt DateTime @default(now())
  user      User     @relation(fields: [userId], references: [id])
  outfit    Outfit   @relation(fields: [outfitId], references: [id])
}

model RefreshToken {
  id        String   @id @default(cuid())
  token     String   @unique
  userId    String
  expiresAt DateTime
  createdAt DateTime @default(now())
  user      User     @relation(fields: [userId], references: [id])
}
```

## WHAT NEEDS TO BE BUILT NEXT

1. **Routes for new services** - styleProfileService and outfitHistoryService need route files wired in app.ts
2. **Mobile app** - React Native (Expo) in apps/mobile/ - not started
3. **Auth routes for logout** - POST /api/auth/logout needs to be added to routes/auth.ts
4. **Style quiz route** - POST /api/style-profile, GET /api/style-profile
5. **Outfit history routes** - POST /api/outfits/:id/wear, POST /api/outfits/:id/rate, GET /api/outfits/history, GET /api/outfits/stats
