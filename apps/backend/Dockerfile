# ---- Build stage ----
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build TypeScript
RUN npm run build

# Prune dev dependencies
RUN npm prune --production

# ---- Runtime stage ----
FROM node:20-alpine AS runner

RUN addgroup -g 1001 -S nodejs && adduser -S fitcheck -u 1001

WORKDIR /app

# Copy built files and production node_modules
COPY --from=builder --chown=fitcheck:nodejs /app/dist ./dist
COPY --from=builder --chown=fitcheck:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=fitcheck:nodejs /app/package.json ./package.json
COPY --from=builder --chown=fitcheck:nodejs /app/prisma ./prisma

USER fitcheck

EXPOSE 3000

ENV NODE_ENV=production

# Run migrations and start server
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/server.js"]
