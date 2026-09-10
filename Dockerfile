FROM node:22-alpine

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY db.js index.js websocket.js ./
COPY schema.sql ./
COPY events ./events
COPY middleware ./middleware
COPY routes ./routes
COPY scripts ./scripts
COPY utils ./utils

EXPOSE 3000

CMD ["npm", "start"]
