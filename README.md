# Crypto Dashboard
==================================

> This is an open source project for managing your cryptocurrency portfolio.

## Getting Started
---------------

```sh
# clone it
git clone https://github.com/JBaczuk/crypto-dashboard
cd crypto-dashboard

# Credentials
export GDAX_SECRET=
export GDAX_KEY=
export GDAX_PASSPHRASE=
export POLONIEX_KEY=
export POLONIEX_SECRET=
export BITTREX_KEY=
export BITTREX_SECRET=

# Install dependencies
yarn install

# Start development live-reload server
PORT=8000 npm run dev

# Start production server:
PORT=8000 npm start
```
Docker Support
------
```sh
cd crypto-dashboard

# Build your docker
docker build -t crypto-dashboard .
#            ^      ^           ^
#          tag  tag name      Dockerfile location

# run your docker
docker run -p 8080:8080 crypto-dashboard
#                 ^            ^
#          bind the port    container tag
#          to your host
#          machine port   

```
## Release
### v1.0.0
> In progress
- Currently supports GDAX and Poloniex
- Add support for Bittrex and coinbase

## Future
- Add support for other exchanges
- Add history of deposits and withdrawals
- Calculate profit
- Chart trade and price history
- Add trade ability
- Add bot dashboard

## Development
This repository has a pre-commit script that will check for api keys and prevent that from being submitted, to protect your account.  To enable it, you must run:

`ln -s ../../pre-commit.sh .git/hooks/pre-commit`

## Package Info
- [GDAX node.js](https://github.com/coinbase/gdax-node)
- [poloniex.js](https://github.com/premasagar/poloniex.js)
- [Express ES6 API Starter](https://github.com/developit/express-es6-rest-api)
- ES6 support via [babel](https://babeljs.io)
- REST resources as middleware via [resource-router-middleware](https://github.com/developit/resource-router-middleware)
- CORS support via [cors](https://github.com/troygoode/node-cors)
- Body Parsing via [body-parser](https://github.com/expressjs/body-parser)
- [Chartkick](https://github.com/ankane/vue-chartkick)
- [CoreUI Vue](https://github.com/mrholek/CoreUI-Vue)

## License
-------

[MIT](https://github.com/JBaczuk/crypto-dashboard/blob/master/LICENSE)
