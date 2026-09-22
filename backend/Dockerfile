FROM node:24-alpine

RUN mkdir -p /usr/src/node-app && chown -R node:node /usr/src/node-app

WORKDIR /usr/src/node-app

COPY package.json package-lock.json ./

USER node

RUN npm ci --omit=dev || npm install --omit=dev

COPY --chown=node:node . .

EXPOSE 3000

CMD ["node", "src/index.js"]
