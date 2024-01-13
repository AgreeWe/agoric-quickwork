FROM node:18.18-alpine
RUN apk add git make py3-pip build-base \
  && yarn global add agoric
