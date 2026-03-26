# FitCheck

> AI-powered outfit confidence app — snap your fit, get an instant score and style breakdown powered by Perplexity sonar-pro.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Mobile | Expo (React Native) — iOS & Android |
| Backend | Node.js + Express + TypeScript |
| Database | PostgreSQL via Prisma ORM |
| Image Storage | Cloudinary |
| AI | Perplexity API (`sonar-pro` with vision) |
| Auth | JWT + bcrypt |
| State | Zustand |

## Project Structure

```
fitcheck/
  apps/
    backend/          # Express API server
      src/
        config/       # Environment config
        lib/          # Prisma, Cloudinary, Perplexity clients
        middleware/   # Auth, error handling
        routes/       # auth, wardrobe
        services/     # AI analysis, auth, wardrobe, outfit logic
      prisma/         # Database schema
    mobile/           # Expo React Native app
      app/
        (auth)/       # Login & Register screens
        (tabs)/       # Main tab screens
      src/
        lib/          # Axios API client
        store/        # Zustand auth store
```

## Features

- **AI Outfit Analysis** — Upload or photograph your outfit; Perplexity sonar-pro returns a 0-100 confidence score, strengths, improvements, occasion fit, and style notes
- **Digital Wardrobe** — Store and browse all your garments with AI-generated categories and color detection
- **Outfit History** — Browse all previous analyses with scores
- **Auth** — Secure JWT-based register/login flow
- **Dark Theme** — Full dark UI with purple accent

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL database
- Cloudinary account
- Perplexity API key

### Backend Setup

```bash
cd apps/backend
npm install
cp .env.example .env
# Fill in your .env values
npx prisma migrate dev
npm run dev
```

### Mobile Setup

```bash
cd apps/mobile
npm install
# Set EXPO_PUBLIC_API_URL in your environment or app.json extra
npx expo start
```

## Environment Variables (Backend)

```
DATABASE_URL=postgresql://...
JWT_SECRET=your_secret_here
PERPLEXITY_API_KEY=pplx-...
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
PORT=3000
```

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | /api/auth/register | Create account |
| POST | /api/auth/login | Sign in |
| GET | /api/auth/me | Current user |
| GET | /api/wardrobe | List garments |
| POST | /api/wardrobe | Upload garment |
| PATCH | /api/wardrobe/:id | Update garment |
| DELETE | /api/wardrobe/:id | Remove garment |
| GET | /api/outfits | Outfit history |
| POST | /api/outfits/analyze | AI analyze outfit |
| DELETE | /api/outfits/:id | Delete entry |

## License

MIT
