FROM node:24.12.0-alpine
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build
CMD ["node", "build/src/index.js"]
EXPOSE 3009