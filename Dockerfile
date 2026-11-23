FROM node:22-alpine

WORKDIR /app

COPY app/package.json ./
COPY app/server.js ./

RUN addgroup -S appgroup && adduser -S appuser -G appgroup \
    && chown -R appuser:appgroup /app

USER appuser

ENV NODE_ENV=production
ENV PORT=3000
ENV LOG_LEVEL=info
ENV FAIL_MODE=false

EXPOSE 3000

CMD ["node", "server.js"]
