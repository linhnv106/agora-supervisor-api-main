FROM node:18.17.1-alpine

RUN apk add --no-cache bash
RUN npm i -g @nestjs/cli typescript ts-node

COPY package*.json /tmp/app/
RUN cd /tmp/app && npm ci

COPY . /usr/src/app
RUN cp -a /tmp/app/node_modules /usr/src/app
COPY ./startup.sh /opt/startup.sh
RUN sed -i 's/\r//g' /opt/startup.sh

WORKDIR /usr/src/app
RUN if [ ! -f .env ]; then cp env-example .env; fi
RUN npm run build

CMD ["/opt/startup.sh"]
