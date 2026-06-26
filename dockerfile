# ---------- Frontend ----------
FROM node:20-alpine AS frontend-builder

WORKDIR /app

COPY ./Frontend /app

RUN npm install
RUN npm run build

# ---------- Backend ----------
FROM node:20-alpine

WORKDIR /app

COPY ./backend /app

RUN npm install

COPY --from=frontend-builder /app/dist /app/public

EXPOSE 5000

CMD ["node", "server.js"]