FROM node:24.12.0-alpine
WORKDIR /app
COPY . .
RUN npm ci
RUN npm run build
CMD ["node", "build/src/index.js"]
EXPOSE 3009