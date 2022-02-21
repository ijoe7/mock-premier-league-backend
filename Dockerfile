FROM node:14.16-alpine3.13
ENV NODE_ENV=production
WORKDIR /usr/src/app
COPY package*.json .
RUN npm install
COPY . .
EXPOSE 1200
CMD ["npm", "start"]