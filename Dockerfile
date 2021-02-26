FROM node:lts-alpine3.10

WORKDIR /home/node
COPY ./ ./
RUN npm ci

EXPOSE 3000

CMD [ "node", "index.js" ]
