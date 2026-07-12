FROM node:22-bookworm-slim

WORKDIR /app

COPY package.json package-lock.json ./
COPY backend/package.json backend/package.json
COPY frontend/package.json frontend/package.json

# Vite / Tailwind ship platform-specific optional natives. Hosts that lock
# Windows bindings need the Linux packages installed explicitly for Docker.
ARG TARGETARCH
RUN npm ci \
  && if [ "$TARGETARCH" = "arm64" ]; then \
       npm install --no-save \
         @rolldown/binding-linux-arm64-gnu@1.0.3 \
         lightningcss-linux-arm64-gnu@1.32.0 \
         @tailwindcss/oxide-linux-arm64-gnu@4.3.0; \
     else \
       npm install --no-save \
         @rolldown/binding-linux-x64-gnu@1.0.3 \
         lightningcss-linux-x64-gnu@1.32.0 \
         @tailwindcss/oxide-linux-x64-gnu@4.3.0; \
     fi

COPY frontend frontend

WORKDIR /app/frontend

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5173"]
