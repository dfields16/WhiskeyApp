# --- Build the React/Vite client ---
FROM node:20-alpine AS client-build
WORKDIR /app/client
COPY client/package*.json ./
RUN npm install
COPY client/ ./
RUN npm run build

# --- Assemble the production server (API + static client) ---
FROM node:20-alpine AS server
WORKDIR /app/server

# better-sqlite3 needs build tools to compile its native binding
RUN apk add --no-cache python3 make g++

COPY server/package*.json ./
RUN npm install --omit=dev
COPY server/ ./
# vite's outDir (../server/public, set in client/vite.config.js) lands at
# /app/server/public within the client-build stage's own filesystem.
COPY --from=client-build /app/server/public ./public

ENV NODE_ENV=production
ENV PORT=3001
ENV DB_PATH=/data/whiskey.db

VOLUME ["/data"]
EXPOSE 3001

CMD ["node", "index.js"]
