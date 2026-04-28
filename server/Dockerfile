# Build stage
FROM node:24-alpine AS builder

WORKDIR /app

RUN apk add --no-cache openssl

# Copy package files
COPY package.json pnpm-lock.yaml ./
COPY tsconfig.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm install -g pnpm@10 && pnpm install --frozen-lockfile

# Copy source
COPY src ./src

# Build application
RUN npm run build

# Generate Prisma client
RUN npm run prisma:generate

# Production stage
FROM node:24-alpine

WORKDIR /app

# Install runtime packages
RUN apk add --no-cache dumb-init openssl

# Copy package files
COPY package.json pnpm-lock.yaml ./
COPY prisma ./prisma/

# Install dependencies, generate Prisma client, then keep production dependencies only
RUN npm install -g pnpm@10 && \
    pnpm install --frozen-lockfile && \
    pnpm run prisma:generate && \
    pnpm prune --prod --ignore-scripts && \
    pnpm store prune && \
    pnpm cache clean --force

# Copy built application from builder
COPY --from=builder /app/dist ./dist

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001

USER nestjs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Run application
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/main.js"]
