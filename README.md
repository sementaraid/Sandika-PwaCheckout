# Sandika PWA Checkout

Ini adalah pwa checkout CSR yang di built menggunakan ReactJS untuk Magento Swift <br/>
Sandika PWA Checkout sendiri terdiri dari beberapa komponen

- Graphql
- Frontend (React)

Konsep kerja dari Sandika PWA Checkout itu sendiri menggunakan prinsip monorepo <br/>
yang di dalam nya kemudian di atur dengan Lerna

<img src="https://miro.medium.com/max/960/1*obV0EGRGtftMYtM4_DTTQA.png"/> <br/>

`packages/backend`<br/>
<b>Backend</b>
Lingkup kerja backend sesuai dengan struktur lerna ada di folder yang sudah di sebut di atas

`packages/frontend`<br/>
<b>Frontend</b>
Sedangkan lingkup kerja frontend ada di folder `packages/frontend`

<br/><br/>

## Script atau Command
#### Install Lerna
```yarn global add lerna``` <br/>
#### Siapkan Environment
Salin `PwaCheckout/lerna-checkout/.env.example` menjadi `.env`, lalu isi nilainya. File `.env` tidak di-commit.<br/>
```cp .env.example .env```<br/>
#### Install Lerna Project Packages Dependencies
```lerna bootstrap```<br/>
#### Run Lerna Project (Sandika PWA Checkout)
```yarn dev```

<br/>

## Portfolio demo (mock data)

This branch can run the checkout without Magento or the GraphQL backend. In demo mode every request from `GQLClientRequest` is answered by a mock server in the browser, using sample data that follows the Swift/Magento GraphQL response shapes.

- `packages/frontend/src/mock/data.js`: sample store config, customer, cart items, shipping and payment methods, pickup stores, regions and cities
- `packages/frontend/src/mock/server.js`: an in-memory cart that answers each query and mutation by its root field (`cart`, `setShippingMethodsOnCart`, `applyRewardPointsToCart`, ...) and recalculates the totals
- `packages/frontend/src/helper/demo.js`: turns demo mode on when `REACT_APP_MOCK=true`

In demo mode the visitor is a logged-in customer with two saved addresses, reward points and store credit. Everything works: changing addresses or adding a new one, home delivery or store pickup, shipping and payment methods, extra fees, quantity changes and Place Order. Midtrans and Google Maps are skipped, and no order is created. The cart resets on reload.

### Run the demo locally

Needs Node.js 18 or newer.

```bash
cd PwaCheckout/lerna-checkout/packages/frontend
yarn install --ignore-engines
yarn demo
```

Then open http://localhost:3000.

### Run the demo with Docker

```bash
docker build -t sandika-checkout-demo .
docker run -d -p 8080:80 sandika-checkout-demo
```

Then open http://localhost:8080. `compose.yaml` runs the same image on the shared `web` network for a Caddy reverse proxy.
