# Build the React app
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Serve the built app with nginx
FROM nginx:alpine AS production
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
# Regenerate config.js from container env vars at startup (local Docker flow).
# nginx:alpine runs scripts from /docker-entrypoint.d/ automatically before starting.
RUN printf '#!/bin/sh\necho "window.__CONFIG__ = { BFF_HOST: \\"${REACT_APP_BFF_HOST:-}\\" };" > /usr/share/nginx/html/config.js\n' \
    > /docker-entrypoint.d/40-config-js.sh \
    && chmod +x /docker-entrypoint.d/40-config-js.sh
EXPOSE 80
