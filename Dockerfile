FROM node:19.0.0-alpine3.16 as build

WORKDIR /usr/src/app

COPY package.json yarn.lock ./

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

RUN yarn

COPY . .

RUN yarn run build

RUN wget https://gobinaries.com/tj/node-prune --output-document - | /bin/sh && node-prune

RUN rm -rf node_modules/rxjs/src/
RUN rm -rf node_modules/rxjs/bundles/
RUN rm -rf node_modules/rxjs/_esm5/
RUN rm -rf node_modules/rxjs_esm2015/
RUN rm -rf node_modules/swagger-ui-dist/*.map

FROM gcr.io/distroless/nodejs18-debian11 as deploy

WORKDIR /usr/src/app

COPY --from=build /usr/src/app/dist ./dist
COPY --from=build /usr/src/app/node_modules ./node_modules

ENV NODE_ENV=production

CMD ["dist/main.js"]
