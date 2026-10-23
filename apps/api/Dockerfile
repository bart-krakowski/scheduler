FROM node:24-alpine AS base
RUN npm install -g pnpm@11.1.0
WORKDIR /repo

FROM base AS build
COPY . .
RUN pnpm install --frozen-lockfile
RUN pnpm exec turbo run build --filter=api
RUN pnpm --filter api deploy --prod /out

FROM node:24-alpine AS runtime
ENV NODE_ENV=production
WORKDIR /app
COPY --from=build /out/node_modules ./node_modules
COPY --from=build /out/package.json ./package.json
COPY --from=build /repo/apps/api/dist ./dist
USER node
EXPOSE 3001
CMD ["node", "dist/main.js"]
