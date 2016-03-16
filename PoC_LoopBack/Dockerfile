# Official Node image for fat version
# FROM node:argon
# Awesome tiny node image
FROM alpine
RUN apk update && apk upgrade
RUN apk add nodejs

WORKDIR /app
ADD . /app
RUN npm install
ENTRYPOINT [ "node", "server/server.js" ]
