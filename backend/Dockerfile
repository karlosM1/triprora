FROM node:22-alpine

RUN apk add --no-cache openssl

WORKDIR /app

COPY package.json package-lock.json ./
COPY backend/package.json backend/package.json
COPY frontend/package.json frontend/package.json

RUN npm ci

COPY backend backend

WORKDIR /app/backend

# prisma.config.ts requires these at generate time; no DB connection is made
ENV DATABASE_URL=postgresql://triprora:triprora@postgres:5432/triprora?schema=public
ENV DIRECT_URL=postgresql://triprora:triprora@postgres:5432/triprora?schema=public

RUN npx prisma generate

RUN sed -i 's/\r$//' docker-entrypoint.sh && chmod +x docker-entrypoint.sh

EXPOSE 3001

ENTRYPOINT ["./docker-entrypoint.sh"]
