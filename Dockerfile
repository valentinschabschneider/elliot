FROM node:24-alpine AS base

WORKDIR /usr/src/app

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

COPY . .

FROM base AS prod-deps

ENV PUPPETEER_SKIP_DOWNLOAD=true

RUN --mount=type=cache,id=s/a9650354-4631-43f2-a069-a098c18071b9-pnpm,target=/pnpm/store pnpm install --prod --frozen-lockfile

RUN wget https://gobinaries.com/tj/node-prune --output-document - | /bin/sh && node-prune

RUN rm -rf node_modules/rxjs/src/
RUN rm -rf node_modules/rxjs/bundles/
RUN rm -rf node_modules/rxjs/_esm5/
RUN rm -rf node_modules/rxjs_esm2015/
RUN rm -rf node_modules/swagger-ui-dist/*.map

FROM base AS build

ENV PUPPETEER_SKIP_DOWNLOAD=true

RUN --mount=type=cache,id=s/a9650354-4631-43f2-a069-a098c18071b9-pnpm,target=/pnpm/store pnpm install --frozen-lockfile
RUN pnpm run build

FROM gcr.io/distroless/nodejs24-debian12 AS deploy

WORKDIR /usr/src/app

COPY --from=prod-deps /usr/src/app/node_modules ./node_modules
COPY --from=build /usr/src/app/dist ./dist

ENV NODE_ENV=production

CMD ["dist/main"]
