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
