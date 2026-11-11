# Portfolio demo of the checkout: runs on mock GraphQL data, no Magento needed.

# Stage 1: build the React app in demo mode
FROM node:18-alpine AS build
WORKDIR /app

COPY PwaCheckout/lerna-checkout/packages/frontend/package.json PwaCheckout/lerna-checkout/packages/frontend/yarn.lock ./
RUN yarn install --frozen-lockfile --ignore-engines --network-timeout 300000

COPY PwaCheckout/lerna-checkout/packages/frontend/ ./
RUN SKIP_PREFLIGHT_CHECK=true yarn build:demo

# Stage 2: serve the static build with nginx
FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/build /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
