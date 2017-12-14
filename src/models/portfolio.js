import ExchangeAccount from './exchange_account.js'
import regeneratorRuntime from 'regenerator-runtime' // required for es6 async functions

export default class {
    constructor() {
        var exchanges = this.getExchanges()
        this.exchange_accounts = {}
        exchanges.forEach(function (exchange) {
            var exchange_account = new ExchangeAccount(exchange)
            this.exchange_accounts[exchange] = exchange_account
        }.bind(this))
        this.btc_value = 0
        this.usd_value = 0
    }

    getExchanges() {
        var exchanges = []
        if (process.env.GDAX_KEY != undefined && process.env.GDAX_SECRET != undefined && process.env.GDAX_PASSPHRASE != undefined) {
            exchanges.push('GDAX')
        }
        if (process.env.POLONIEX_KEY != undefined && process.env.POLONIEX_SECRET != undefined) {
            exchanges.push('POLONIEX')
        }
        if (process.env.BITTREX_KEY != undefined && process.env.BITTREX_SECRET != undefined) {
            exchanges.push('BITTREX')
        }
        if (process.env.COINBASE_KEY != undefined && process.env.COINBASE_SECRET != undefined) {
            exchanges.push('COINBASE')
        }
        return exchanges
    }
    async getBalances() {
        var getBalanceCalls = []
        return new Promise(function (resolve, reject) {
            for (var exchange_account in this.exchange_accounts) {
                if (this.exchange_accounts.hasOwnProperty(exchange_account)) {
                    var function_call = this.exchange_accounts[exchange_account].getExchangeBalance()
                    getBalanceCalls.push(function_call)
                }
            }
            Promise.all(getBalanceCalls).then(function (balances) {
                resolve(balances)
            })
        }.bind(this))
    }
    /**
     * getCurrentInvestment
     * Returns the dollar amount that is currently invested (without considering any gains or losses)
     * This is calculated by the total sum of all deposits in USD minus any withdrawals in USD (currently on 1 account, must be coinbase, only)
     * 
     */
    async getCurrentInvestment() {
        return new Promise(function (resolve, reject) {
            for (var exchange_account in this.exchange_accounts) {
                if (this.exchange_accounts.hasOwnProperty(exchange_account)) {
                    if (exchange_account === 'COINBASE') {
                        console.log('coinbase account found!')
                        this.exchange_accounts[exchange_account].getTransactions()
                            .then(function (txns) {
                                console.log('txns: ' + txns)
                                var total = 0
                                txns.forEach(function (txn) {
                                    var transaction = {}
                                    transaction.type = txn.type
                                    transaction.amount = txn.amount.amount
                                    transaction.usd_amount = txn.native_amount.amount
                                    transaction.currency = txn.amount.currency
                                    transaction.datetime = txn.created_at
                                    if (txn.status === 'completed') {
                                        /**
                                         * Credits (type=)
                                         * - buy (buy crypto in Coinbase)
                                         * - fiat_deposit (deposit USD into Coinbase)
                                         * - N/A exchange_withdrawal (moving money from GDAX to Coinbase)
                                         */
                                        if (txn.type === 'buy' || txn.type === 'fiat_deposit') {
                                            console.log('adding ' + JSON.stringify(transaction))
                                            total = total + parseFloat(transaction.usd_amount)
                                        }

                                        /**
                                         * Debits (type=)
                                         * - N/A send (send money to another wallet)
                                         * - fiat_withdrawal (withdraw USD from Coinbase)
                                         * - N/A transfer (sending to another Coinbase)
                                         * - N/A exchange_deposit (moving money from Coinbase to GDAX)
                                         */
                                        if (txn.type === 'fiat_withdrawal') {
                                            console.log('subtracting ' + JSON.stringify(transaction))
                                            total = total + parseFloat(transaction.usd_amount)
                                        }

                                        /**
                                         * Trade (type=)
                                         * - sell
                                         */
                                    }
                                })
                                resolve(total)
                            })
                    }
                }
            }
        }.bind(this))
    }

    /**
     * getHistoricalPortfolioReturn
     * Returns an array of the cumulative return on the portfolio over time. This is calculated in the following steps:
     * 1. Get all historical deposits, trades, and withdrawals, which coin was purchased, the date, and the value
     * 2. Get historical rates on all coins purchased
     * 3. Calculate cumulative return on 1H (TODO) or daily intervals
     */
    async getHistoricalPortfolioReturn() {
        var exchange_trades_calls = []
        for (var exchange_account in this.exchange_accounts) {
            if (this.exchange_accounts.hasOwnProperty(exchange_account)) {
                exchange_trades_calls.push(this.exchange_accounts[exchange_account].getTrades())
            }
        }
        return Promise.all(exchange_trades_calls)
            .then(function (trades) {
                return trades
            })
            .catch(function (error) {
                console.error('error: ' + error)
            })
    }
}