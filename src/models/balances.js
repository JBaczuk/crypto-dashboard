import ExchangeAuth from './exchange_auth.js'
import Gdax from 'gdax'
import regeneratorRuntime from 'regenerator-runtime' // required for es6 async functions

export default class {
    constructor() {
        this.exchange_auth = new ExchangeAuth()
        this.exchanges = this.exchange_auth.exchanges
    }
    /**
    * getPrice
    * Returns a price object of the form:
    * 
    * price = {
    *   "BTC-USD": 9502.22
    * }
    * 
    * @param {*} exchange 
    * @param {*} product 
    */
    getPrice(exchange, product) {
        return new Promise(function (resolve, reject) {
            if (exchange == 'GDAX') {
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

            if (exchange == 'POLONIEX') {
                this.exchange_auth.poloniex.returnTicker(function (err, data) {
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

            if (exchange == 'BITTREX') {
                this.exchange_auth.bittrex.getticker({ market: product }, function (data, err) {
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

            if (exchange == 'COINBASE') {
                this.exchange_auth.coinbase.getBuyPrice({'currencyPair': product}, function (error, obj){
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

    async getBalances() {
        var getBalanceCalls = []
        return new Promise(function (resolve, reject) {
            this.exchanges.forEach(function (exchange) {
                var functionCall = this.getExchangeBalance(exchange)
                getBalanceCalls.push(functionCall)
            }.bind(this))
            Promise.all(getBalanceCalls).then(function (balances) {
                resolve(balances)
            }, function (err) { // TODO: err is not defined
                reject(Error(err))
            })
        }.bind(this)) // Required in order to access "this" from Balance class
    }

    async getExchangeBalance(exchange) {
        return new Promise(function (resolve, reject) {
            if (exchange == 'GDAX') {
                this.exchange_auth.gdaxAuthedClient.getAccounts(function (error, response, data) {
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
                                priceFunctionCalls.push(this.getPrice(exchange, currency + '-USD'))
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
                                exchangeBalance[exchange] = currencyBalances
                                resolve(exchangeBalance)
                            })
                    }
                }.bind(this))
            }
            if (exchange == 'POLONIEX') {
                this.exchange_auth.poloniex.returnCompleteBalances(function (err, data) {
                    if (err) {
                        reject(Error(error))
                    } else {
                        // FIXME: Handle bad api keys in data.error
                        var exchangeBalance = {}
                        var currencyBalances = []
                        // TODO: implement this:
                        var btc_usd = this.getPrice(exchange, 'USDT_BTC')
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
                                exchangeBalance[exchange] = currencyBalances
                                resolve(exchangeBalance)
                            })
                    }
                }.bind(this))
            }
            if (exchange == 'BITTREX') {
                this.exchange_auth.bittrex.getbalances(function (data, err) {
                    if (err) {
                        reject(Error(err))
                    } else {
                        // FIXME: Handle bad api keys in data.error
                        var exchangeBalance = {}
                        var currencyBalances = []
                        var btc_usd = this.getPrice(exchange, 'USDT-BTC')
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
                                            functionCall = this.getPrice(exchange, 'BTC-' + ticker)
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
                                    for (var btc_price in prices) {
                                        var balance_obj = {}
                                        var key = Object.keys(prices[btc_price])[0].split("-")[1]
                                        var btc_value = balance_amount * parseFloat(prices[btc_price][Object.keys(prices[btc_price])[0]])
                                        var usd_value = btc_value * parseFloat(price[Object.keys(price)[0]])
                                        var balance = {}
                                        balance_obj['amount'] = balance_amount
                                        balance_obj['usd_value'] = usd_value
                                        balance[key] = balance_obj
                                        currencyBalances.push(balance)
                                    }
                                    exchangeBalance[exchange] = currencyBalances
                                    resolve(exchangeBalance)
                                })
                            })
                    }
                }.bind(this))
            }
            if (exchange == 'COINBASE') {
                this.exchange_auth.coinbase.getAccounts({}, function (error, data) {
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
                                priceFunctionCalls.push(this.getPrice(exchange, currency + '-USD'))
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
                                exchangeBalance[exchange] = currencyBalances
                                resolve(exchangeBalance)
                            })
                    }
                }.bind(this))
            }
        }.bind(this))
    }
}