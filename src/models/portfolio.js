import ExchangeAccount from './exchange_account.js'
import regeneratorRuntime from 'regenerator-runtime' // required for es6 async functions
import Gdax from 'gdax'

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
        for (var exchange_account in this.exchange_accounts) {
            if (this.exchange_accounts.hasOwnProperty(exchange_account)) {
                if (exchange_account === 'COINBASE') {
                    // console.log('this.exchange_accounts: ' + JSON.stringify(this.exchange_accounts))
                    let txns = await this.exchange_accounts[exchange_account].getFiatTransactions()
                    txns.shift() // remove the pagination object
                    var total = 0
                    txns.forEach(function (account_txns_obj) {
                        let account_txns = account_txns_obj[0]
                        for (var txn in account_txns) {
                            // console.log('txn: ' + txn)
                            // console.log('account_txns: ' + txns)

                            if (account_txns.hasOwnProperty(txn)) {
                                var transaction = {}
                                transaction.type = account_txns[txn].type
                                transaction.amount = account_txns[txn].amount.amount
                                transaction.usd_amount = account_txns[txn].native_amount.amount
                                transaction.currency = account_txns[txn].amount.currency
                                transaction.datetime = account_txns[txn].created_at
                                if (account_txns[txn].status === 'completed') {
                                    /**
                                     * Credits (type=)
                                     * - buy (buy crypto in Coinbase)
                                     * - fiat_deposit (deposit USD into Coinbase)
                                     * - N/A exchange_withdrawal (moving money from GDAX to Coinbase)
                                     */
                                    if (account_txns[txn].type === 'buy' || account_txns[txn].type === 'fiat_deposit') {
                                        // console.log('adding ' + JSON.stringify(transaction))
                                        total = total + parseFloat(transaction.usd_amount)
                                    }

                                    /**
                                     * Debits (type=)
                                     * - N/A send (send money to another wallet)
                                     * - fiat_withdrawal (withdraw USD from Coinbase)
                                     * - N/A transfer (sending to another Coinbase)
                                     * - N/A exchange_deposit (moving money from Coinbase to GDAX)
                                     */
                                    if (account_txns[txn].type === 'fiat_withdrawal') {
                                        // console.log('subtracting ' + JSON.stringify(transaction))
                                        total = total + parseFloat(transaction.usd_amount) // should be a negative number
                                    }

                                    /**
                                     * Trade (type=)
                                     * - sell
                                     */
                                }
                            }
                        }
                    })
                    return total
                }
            }
        }
    }
    /**
     * calculateCumulativeReturns
     * returns an array of return objects representing a cumulative percentage return per period
     * @param {*} historicValue 
     */
    calculateCumulativeReturns(historicValue) {
        var historicReturns = []
        historicValue.forEach(function (valueObj, i) {
            if(i != 0) {
                // console.log('valueObj: ' + valueObj)
                // console.log('valueObj.value: ' + valueObj.value)
                // console.log('valueObj.datetime: ' + valueObj.datetime)
                var returnObj = {}
                var returnPct = (valueObj.value - historicValue[0].value) / historicValue[0].value
                // console.log('returnPct: ' + returnPct)
                // console.log('date: ' + new Date(parseInt(valueObj.datetime) * 1000))
                returnObj.return = returnPct
                returnObj.datetime = valueObj.datetime
                historicReturns.push(returnObj)
            }
        })
        return historicReturns
    }

    /**
     * getHistoricalBitcoinReturn
     * Returns an array of the cumulative return of Bitcoin on GDAX.
     *
     * @param {*} start_date 
     * @param {*} period_seconds
     */
    async getHistoricalBitcoinReturn(start_date=null, period_seconds=86400) {
        var historicClosePrices = []
        const publicClient = new Gdax.PublicClient(); // Defaults to BTC-USD as product
        try {
            var historicRates = await publicClient.getProductHistoricRates({'granularity': period_seconds, 'start': start_date})
        }
        catch(err) {
            console.error(err)
        }
        for (var rate in historicRates) {
            if (historicRates.hasOwnProperty(rate)) {
                var rate_obj = {}
                rate_obj.value = parseFloat(historicRates[rate][4])
                rate_obj.datetime = historicRates[rate][0]
                historicClosePrices.push(rate_obj)
            }
        }
        var historicReturns = this.calculateCumulativeReturns(historicClosePrices.reverse())
        return historicReturns
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
        var exchange_btc_historical_calls = []
        var historicalBTCReturn = await this.getHistoricalBitcoinReturn()
        for (var exchange_account in this.exchange_accounts) {
            if (this.exchange_accounts.hasOwnProperty(exchange_account)) {
                exchange_trades_calls.push(this.exchange_accounts[exchange_account].getTrades())
            }
        }
        var trades = Promise.all(exchange_trades_calls)
            .then(function (trades) {
                return trades
            })
            .catch(function (error) {
                console.error('error: ' + error)
            })

        var exchange_btc_historical_price = Promise.all(exchange_btc_historical_calls)
            .then(function (prices) {
                return prices
            })
            .catch(function (error) {
                console.error('error: ' + error)
            })
    }
}