FROM node:10.15.0-alpine

WORKDIR /app

COPY package.json /app
RUN npm install

COPY . /app

CMD node app.js

EXPOSE 1000
