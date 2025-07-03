FROM node:22
WORKDIR /app

COPY . .
RUN npm install

RUN node deploy-commands.js

CMD ["node", "index.js"]
