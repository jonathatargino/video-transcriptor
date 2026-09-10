## RUNNER
FROM node:24.12.0-alpine AS base

WORKDIR /app

## BUILDER
FROM base AS builder

COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

## RUNNER
FROM base AS runner

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/build ./build

CMD ["node", "build/src/index.js"]
EXPOSE 3009