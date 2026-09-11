## RUNNER
FROM node:24.12.0-alpine AS base

WORKDIR /app

## BUILDER
FROM base AS builder

RUN --mount=type=cache,target=/root/.npm \
    --mount=type=bind,source=package.json,target=package.json \
    --mount=type=bind,source=package-lock.json,target=package-lock.json \
    npm ci

COPY . .
RUN npm run build

## RUNNER
FROM base AS runner

RUN --mount=type=cache,target=/root/.npm \
    --mount=type=bind,source=package.json,target=package.json \
    --mount=type=bind,source=package-lock.json,target=package-lock.json \
    npm ci --omit=dev

COPY --from=builder /app/build ./build

CMD ["node", "build/src/index.js"]
EXPOSE 3009