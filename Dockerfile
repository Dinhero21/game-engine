# syntax=docker/dockerfile:1

ARG NODE_VERSION=18.17.1

FROM node:${NODE_VERSION}-alpine

WORKDIR /usr/src/app

EXPOSE 8080

# Install Dependencies

## NPM

# ! Copy package[-lock].json first
COPY package.json      .
COPY package-lock.json .

RUN npm ci

## Packages

RUN apk update

RUN apk add rsync


# Finalize

COPY . .

CMD ["npm", "run", "build-start"]