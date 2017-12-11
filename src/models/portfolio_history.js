import ExchangeAuth from './exchange_auth.js'
import Gdax from 'gdax'
import regeneratorRuntime from 'regenerator-runtime' // required for es6 async functions

export default class {
    constructor(exchangeAuth, exchanges) {
        this.exchange_auth = exchangeAuth
        this.exchanges = exchanges
    }
    /**
     * getCurrentInvestment
     * Returns the dollar amount that is currently invested (without considering any gains or losses)
     * This is calculated by the total sum of all deposits in USD minus any withdrawals in USD
     * 
     */
    getCurrentInvestment() {

    }
    /**
     * getHistoricalPortfolioReturn
     * Returns an array of the cumulative return on the portfolio over time. This is calculated in the following steps:
     * 1. Get all historical deposits, trades, and withdrawals, which coin was purchased, the date, and the value
     * 2. Get historical rates on all coins purchased
     * 3. Calculate cumulative return on 1H (TODO) or daily intervals
     */
    getHistoricalPortfolioReturn() {
        for (var exchange in this.exchanges) {
            var transactions = this.getTransactions(exchange)
        }
    }
    /**
     * getHistoricalBitcoinReturn
     * Returns an array of the cumulative return of Bitcoin on GDAX.
     */
    getHistoricalBitcoinReturn() {

    }
    /**
     * getTransactions
     * Returns array of transactions (deposits and withdrawals but not trades)
     * 
     * @param {*} exchange (eg. 'COINBASE')
     */
    getTransactions(exchange) {
        if (exchange === 'COINBASE') {
            // FIXME: In progress
            this.exchange_auth.coinbase.getAccounts({}, function (err, accounts) {
                accounts.forEach(function (acct) {
                    //   console.log('my bal: ' + acct.balance.amount + ' for ' + acct.name)
                    acct.getTransactions(null, function (err, txns) {
                        var total = 0
                        txns.forEach(function (txn) {
                            var transaction = {}
                            transaction.type = txn.type
                            transaction.amount = txn.amount.amount
                            transaction.usd_amount = txn.native_amount.amount
                            transaction.currency = txn.amount.currency
                            transaction.datetime = txn.created_at
                            if(txn.status === 'completed') {
                                /**
                                 * Credits (type=)
                                 * - buy (buy crypto in Coinbase)
                                 * - fiat_deposit (deposit USD into Coinbase)
                                 * - exchange_withdrawal (moving money from GDAX to Coinbase)
                                 */ 
    
                                /**
                                 * Debits (type=)
                                 * - send (send money to another wallet)
                                 * - fiat_withdrawal (withdraw USD from Coinbase)
                                 * - transfer (sending to another Coinbase)
                                 * - exchange_deposit (moving money from Coinbase to GDAX)
                                 */
    
                                /**
                                 * Trade (type=)
                                 * - sell
                                 */
    
                                // Then it's ok to add
                                total = total + parseFloat(transaction.usd_amount)
                            }
                            console.log('txn: ' + JSON.stringify(transaction))
                        })
                        console.log('total: ' + total)
                    })
                })
            })
        }
    }
    /**
     * getTrades
     * Returns an array of trade history from the specified exchange
     * 
     * @param {*} exchange  (eg. 'COINBASE')
     */
    getTrades(exchange) {
        this.exchange_auth.gdaxAuthedClient.getAccounts(function (error, response, data) {
            console.log(JSON.stringify(data))
            data.forEach(function (account) {
                console.log("acct id: " + account.id)
                this.exchange_auth.gdaxAuthedClient.getAccountHistory(account.id, function (error, response, data) {
                    console.log(JSON.stringify(data))
                })
            }.bind(this))   
        }.bind(this))
    }
}