FROM node:24-bookworm-slim
ENV NODE_ENV=production HOST=0.0.0.0 PORT=3000
WORKDIR /app/server
COPY server/package.json server/package-lock.json server/.npmrc ./
RUN npm ci --omit=dev && npm cache clean --force
COPY --chown=node:node server/server.js ./
COPY --chown=node:node server/src ./src
COPY --chown=node:node client /app/client
RUN mkdir -p /app/server/uploads && chown node:node /app/server/uploads
USER node
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=15s --start-period=30s --retries=3 CMD ["node", "-e", "fetch('http://127.0.0.1:3000/health').then(r=>{if(!r.ok)process.exit(1)}).catch(()=>process.exit(1))"]
CMD ["node", "server.js"]
