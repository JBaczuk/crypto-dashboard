import Gdax from 'gdax'
import Poloniex from 'poloniex.js'
import bittrex from 'node-bittrex-api'
import coinbase from 'coinbase'
import regeneratorRuntime from 'regenerator-runtime' // required for es6 async functions

export default class {
    constructor(exchange) {
        this.exchange = exchange
        this.btc_value = 0
        this.usd_value = 0
        this.coin_accounts = []
        this.transactions = []
        this.api = this.getApi()
    }
    /**
     * getApi
     * Returns an api object for the exchange on which to do api calls
     */
    getApi() {
        if (this.exchange === 'GDAX') {
            return new Gdax.AuthenticatedClient(process.env.GDAX_KEY, process.env.GDAX_SECRET, process.env.GDAX_PASSPHRASE, 'https://api.gdax.com') // 'https://api-public.sandbox.gdax.com'
        }
        if (this.exchange === 'POLONIEX') {
            return new Poloniex(process.env.POLONIEX_KEY, process.env.POLONIEX_SECRET)
        }
        if (this.exchange === 'BITTREX') {
            bittrex.options({ 'apikey': process.env.BITTREX_KEY, 'apisecret': process.env.BITTREX_SECRET })
            return bittrex
        }
        if (this.exchange === 'COINBASE') {
            var Client = coinbase.Client
            return new Client({ 'apiKey': process.env.COINBASE_KEY, 'apiSecret': process.env.COINBASE_SECRET })
        }
    }
    /**
    * getPrice
    * Returns a price object of the form:
    * 
    * price = {
    *   "BTC-USD": 9502.22
    * }
    * 
    * @param {*} product 
    */
    // TODO: REFACTOR: returning a promise in async functions not necessary
    async getPrice(product) {
        return new Promise(function (resolve, reject) {
            if (this.exchange == 'GDAX') {
                const gdaxPublicClient = new Gdax.PublicClient(product)
                gdaxPublicClient.getProductTicker((error, response, data) => {
                    if (error) {
                        reject(Error(error))
                    } else {
                        var price_obj = {}
                        var price = data['price']
                        price_obj[product] = price
                        resolve(price_obj)
                    }
                })
            }

            if (this.exchange == 'POLONIEX') {
                this.api.returnTicker(function (err, data) {
                    if (err) {
                        reject(Error(error))
                    } else {
                        var price_obj = {}
                        var price = data[product]['last']
                        price_obj[product] = price
                        resolve(price_obj)
                    }
                })
            }

            if (this.exchange == 'BITTREX') {
                this.api.getticker({ market: product }, function (data, err) {
                    if (err) {
                        reject(Error(JSON.stringify(err + " " + product)))
                    } else {
                        var price_obj = {}
                        var price = data['result']['Last']
                        price_obj[product] = price
                        resolve(price_obj)
                    }
                })
            }

            if (this.exchange == 'COINBASE') {
                this.api.getBuyPrice({ 'currencyPair': product }, function (error, obj) {
                    if (error) {
                        reject(Error(error))
                    } else {
                        var price_obj = {}
                        var price = obj.data.amount
                        price_obj[product] = price
                        resolve(price_obj)
                    }
                })
            }
        }.bind(this))
    }

    // TODO: return balance in BTC, then calculate the USD value based on Coinbase prices
    async getExchangeBalance() {
        return new Promise(function (resolve, reject) {
            if (this.exchange == 'GDAX') {
                this.api.getAccounts(function (error, response, data) {
                    if (error) {
                        reject(Error(error))
                    } else {
                        // FIXME: Handle bad api keys in data.error
                        var exchangeBalance = {}
                        var currencyBalances = []
                        var priceFunctionCalls = []
                        data.forEach(function (wallet) {
                            var currency = wallet['currency']
                            var balance_amount = parseFloat(wallet['balance'])
                            var balance = {}
                            var balance_obj = {}
                            // Create array of function calls for promise.all
                            if (currency !== 'USD' && balance_amount > 0.0) {
                                priceFunctionCalls.push(this.getPrice(currency + '-USD'))
                            } else {
                                var usd_value = balance_amount
                                balance_obj['usd_value'] = usd_value
                            }
                            balance_obj['amount'] = balance_amount
                            balance[currency] = balance_obj
                            currencyBalances.push(balance)
                        }.bind(this))
                        Promise.all(priceFunctionCalls).then(function (prices) {
                            return prices
                        })
                            .then(prices => {
                                prices.forEach(function (price) {
                                    currencyBalances.forEach(function (balance) {
                                        var key = Object.keys(price)[0].split("-")[0]
                                        if (balance[key] != undefined) {
                                            var usd_value = balance[key]['amount'] * price[Object.keys(price)[0]]
                                            balance[key]['usd_value'] = usd_value
                                        }
                                    })
                                })
                                exchangeBalance[this.exchange] = currencyBalances
                                resolve(exchangeBalance)
                            })
                    }
                }.bind(this))
            }
            if (this.exchange == 'POLONIEX') {
                this.api.returnCompleteBalances(function (err, data) {
                    if (err) {
                        reject(Error(error))
                    } else {
                        // FIXME: Handle bad api keys in data.error
                        var exchangeBalance = {}
                        var currencyBalances = []
                        // TODO: implement this:
                        var btc_usd = this.getPrice('USDT_BTC')
                            .then(price => {
                                for (var currency in data) {
                                    var balance_amount = parseFloat(data[currency]['available']) + parseFloat(data[currency]['onOrders'])
                                    var balance_obj = {}
                                    if (currency === "USDT") {
                                        var usd_value = balance_amount
                                    } else {
                                        var btc_value = parseFloat(data[currency]['btcValue'])
                                        var usd_value = btc_value * price[Object.keys(price)[0]]
                                    }
                                    if (balance_amount > 0.0) {
                                        var balance = {}
                                        balance_obj['amount'] = balance_amount
                                        balance_obj['usd_value'] = usd_value
                                        balance[currency] = balance_obj
                                        currencyBalances.push(balance)
                                    }
                                }
                                exchangeBalance[this.exchange] = currencyBalances
                                resolve(exchangeBalance)
                            })
                    }
                }.bind(this))
            }
            if (this.exchange == 'BITTREX') {
                this.api.getbalances(function (data, err) {
                    if (err) {
                        reject(Error(err))
                    } else {
                        // FIXME: Handle bad api keys in data.error
                        var exchangeBalance = {}
                        var currencyBalances = []
                        var btc_usd = this.getPrice('USDT-BTC')
                            .then(price => {
                                var btc_usd = parseFloat(price[Object.keys(price)[0]])
                                var functionCalls = []
                                for (var currency in data.result) {
                                    var balance_amount = parseFloat(data.result[currency]['Balance'])
                                    var balance_obj = {}
                                    if (balance_amount > 0.0) {
                                        var ticker = data.result[currency]['Currency']
                                        var functionCall
                                        if (ticker !== "USDT" && ticker !== "BTC") {
                                            var balance = {}
                                            balance_obj['amount'] = balance_amount
                                            balance[ticker] = balance_obj
                                            currencyBalances.push(balance)
                                            functionCall = this.getPrice('BTC-' + ticker)
                                            functionCalls.push(functionCall)
                                        } else {
                                            // TODO: add USDT and BTC
                                            var usd_value
                                            if (ticker === "USDT") {
                                                usd_value = balance_amount
                                            }
                                            else if (ticker === "BTC") {
                                                usd_value = balance_amount * btc_usd
                                            }
                                            var balance = {}
                                            balance_obj['amount'] = balance_amount
                                            balance_obj['usd_value'] = usd_value
                                            balance[ticker] = balance_obj
                                            currencyBalances.push(balance)
                                        }
                                    }
                                }
                                Promise.all(functionCalls).then(function (prices) {
                                    for (var price in prices) {
                                        var key = Object.keys(prices[price])[0].split("-")[1]
                                        currencyBalances.forEach(function (balance) {
                                            if(Object.keys(balance)[0] === key) {
                                                var btc_value = parseFloat(balance[key].amount) * parseFloat(prices[price][Object.keys(prices[price])[0]])
                                                var usd_value = btc_value * btc_usd
                                                balance[key]['usd_value'] = usd_value
                                            }
                                        })
                                    }
                                    exchangeBalance[this.exchange] = currencyBalances
                                    resolve(exchangeBalance)
                                }.bind(this))
                            })
                    }
                }.bind(this))
            }
            if (this.exchange == 'COINBASE') {
                this.api.getAccounts({}, function (error, data) {
                    if (error) {
                        reject(Error(error))
                    } else {
                        // FIXME: Handle bad api keys in data.error
                        var exchangeBalance = {}
                        var currencyBalances = []
                        var priceFunctionCalls = []
                        data.forEach(function (acct) {
                            var currency = acct.balance.currency
                            var balance_amount = parseFloat(acct.balance.amount)
                            var balance = {}
                            var balance_obj = {}
                            // Create array of function calls for promise.all
                            if (currency !== 'USD' && balance_amount > 0.0) {
                                priceFunctionCalls.push(this.getPrice(currency + '-USD'))
                            } else {
                                var usd_value = balance_amount
                                balance_obj['usd_value'] = usd_value
                            }
                            balance_obj['amount'] = balance_amount
                            balance[currency] = balance_obj
                            currencyBalances.push(balance)
                        }.bind(this))
                        Promise.all(priceFunctionCalls).then(function (prices) {
                            return prices
                        })
                            .then(prices => {
                                prices.forEach(function (price) {
                                    currencyBalances.forEach(function (balance) {
                                        var key = Object.keys(price)[0].split("-")[0]
                                        if (balance[key] != undefined) {
                                            var usd_value = balance[key]['amount'] * price[Object.keys(price)[0]]
                                            balance[key]['usd_value'] = usd_value
                                        }
                                    })
                                })
                                exchangeBalance[this.exchange] = currencyBalances
                                resolve(exchangeBalance)
                            })
                    }
                }.bind(this))
            }
        }.bind(this))
    }
    /**
     * getFiatTransactions
     * Returns array of transactions (deposits and withdrawals but not trades)
     */
    async getFiatTransactions() {
        if (this.exchange === 'COINBASE') {
            let accounts = await this.api.getAccounts({})
            var accountTransactionsCalls = []
            accounts[0].forEach(async function (acct) {
                if (acct != undefined) {
                    accountTransactionsCalls.push(acct.getTransactions({}))
                }
            })
            let accountTransactions = await Promise.all(accountTransactionsCalls)
            return accountTransactions
        }
    }


    /**
     * parseHistories
     * returns trade history.  Provides a uniform trade history format across exchanges.
     * @param {*} histories 
     */
    parseHistories(histories, currency) {
        var trades = []
        if (this.exchange === 'GDAX') {
            histories.forEach(function (history) {
                var trade = {}
                if (history.type === 'match' || history.type === 'transfer') {
                    trade.datetime = Date.parse(history.created_at)
                    trade.product = history.details.product_id
                    if (history.details.product_id != undefined) {
                        trade.product = history.details.product_id
                    }
                    trade.currency = currency
                    trade.amount = history.amount
                    trade.balance = history.balance
                    trade.type = history.type
                    trades.push(trade)
                }
            })
        }
        return trades
    }
    /**
     * getTrades
     * Returns an array of trade history from the specified exchange
     */
    // TODO: need to get full history using pagination: https://docs.gdax.com/#pagination
    async getTrades() {
        var exchangeHistoricTrades = {}
        if (this.exchange === 'GDAX') {
            let accounts = await this.api.getAccounts()
            var accountHistoryCalls = []
            accounts.forEach(function (account) {
                accountHistoryCalls.push(this.api.getAccountHistory(account.id)
                    .then(function (histories) {
                        return this.parseHistories(histories, account.currency)
                    }.bind(this))
                    .catch(function (error) {
                        throw new Error(error)
                    }))
            }.bind(this))

            return Promise.all(accountHistoryCalls)
                .then(parsed_histories => {
                    exchangeHistoricTrades[this.exchange] = parsed_histories
                    return exchangeHistoricTrades
                })
                .catch(error => {
                    throw new Error(error)
                })
        }
        else {
            exchangeHistoricTrades[this.exchange] = this.exchange + ' not implemented yet'
            return exchangeHistoricTrades
        }
    }
}