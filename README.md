# Crypto Dashboard

> This is an open source project for managing your cryptocurrency portfolio.

## Components
This project has 2 parts:
1. Self-hosted API Server (this repo)
2. [Single Page Dashboard Application](https://github.com/JBaczuk/crypto-dashboard-spa)

## Run---

```bash
# clone the project
git clone https://github.com/JBaczuk/crypto-dashboard
cd crypto-dashboard
# Credentials
# Important: Generate Read Only keys!  This application does not require anything more.
export GDAX_SECRET=
export GDAX_KEY=
export GDAX_PASSPHRASE=
export POLONIEX_KEY=
export POLONIEX_SECRET=
export BITTREX_KEY=
export BITTREX_SECRET=
export COINBASE_KEY=
export COINBASE_SECRET=

# Install dependencies
yarn

# Start api server:
PORT=8000 npm start
```

### Dashboard App
See instructions at [Single Page Dashboard Application](https://github.com/JBaczuk/crypto-dashboard-spa)

## Development

### Set Up
(same as above)  

```bash
# Start development live-reload server
PORT=8000 npm run dev
```

## Release
### v1.0.0
- Currently supports Coinbase, GDAX, Poloniex, and Bittrex

## Future
- Add support for other exchanges
- Add history of deposits and withdrawals
- Add trade ability
- Add bot dashboard
- create docker containers

## Development
- Please submit pull requests to the dev branch.
- This repository has a pre-commit script that will check for api keys and prevent that from being submitted, to protect your account.  To enable it, you must run:

`ln -s ../../pre-commit.sh .git/hooks/pre-commit`

## Thanks to:
- [GDAX node.js](https://github.com/coinbase/gdax-node)
- [Coinbase node.js](https://github.com/coinbase/coinbase-node)
- [poloniex.js](https://github.com/premasagar/poloniex.js)
- [Express ES6 API Starter](https://github.com/developit/express-es6-rest-api)
- ES6 support via [babel](https://babeljs.io)
- REST resources as middleware via [resource-router-middleware](https://github.com/developit/resource-router-middleware)
- CORS support via [cors](https://github.com/troygoode/node-cors)
- Body Parsing via [body-parser](https://github.com/expressjs/body-parser)

## License
-------

[MIT](https://github.com/JBaczuk/crypto-dashboard/blob/master/LICENSE)
