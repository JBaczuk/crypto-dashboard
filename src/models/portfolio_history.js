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
    /**
     * getHistoricalBitcoinReturn
     * Returns an array of the cumulative return of Bitcoin on GDAX.
     */
    getHistoricalBitcoinReturn() {

    }
}