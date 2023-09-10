FROM node:18

RUN apt-get update

RUN apt-get install -y rsync

ENV PORT=8080
EXPOSE 8080

# ! These files should be copied before others because of docker cache
COPY package.json .
COPY package-lock.json .

RUN npm ci

COPY . .

RUN npm run build

CMD ["npm", "start"]
