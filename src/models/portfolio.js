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

    async initializePortfolio() {
        var initializeExchangesCalls = []
        for (var exchange_account in this.exchange_accounts) {
            if (this.exchange_accounts.hasOwnProperty(exchange_account)) {
                initializeExchangesCalls.push(this.exchange_accounts[exchange_account].initializeExchange())
            }
        }
        var result = await Promise.all(initializeExchangesCalls)
            .then(function (result) {
                return "Portfolio Initialization Success"
            })
            .catch(function (error) {
                console.error('error: ' + error)
            })

        return result
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

    getBalances() {
        var balances = []
        for (var exchange_account in this.exchange_accounts) {
            if (this.exchange_accounts.hasOwnProperty(exchange_account)) {
                var balance = this.exchange_accounts[exchange_account].balance
                balances.push(balance)
            }
        }
        return balances
    }

    /**
     * getCurrentInvestment
     * Returns the dollar amount that is currently invested (without considering any gains or losses)
     * This is calculated by the total sum of all deposits in USD minus any withdrawals in USD (currently on 1 account, must be coinbase, only)
     * 
     */
    getCurrentInvestment() {
        var currentInvestment = 0
        for (var exchange_account in this.exchange_accounts) {
            if (this.exchange_accounts.hasOwnProperty(exchange_account)) {
                var current_exchange_investment = this.exchange_accounts[exchange_account].current_investment
                if (current_exchange_investment != undefined) {
                    currentInvestment = currentInvestment + current_exchange_investment
                }
            }
        }
        return currentInvestment
    }

    /**
     * calculateCumulativeReturns
     * returns an array of return objects representing a cumulative percentage return per period
     * @param {*} historicValue 
     */
    calculateCumulativeReturns(historicValue) {
        var historicReturns = []
        historicValue.forEach(function (valueObj, i) {
            if (i != 0) {
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
    async getHistoricalBitcoinReturn(start_date = null, period_seconds = 86400) {
        var historicClosePrices = []
        const publicClient = new Gdax.PublicClient(); // Defaults to BTC-USD as product
        try {
            var historicRates = await publicClient.getProductHistoricRates({ 'granularity': period_seconds, 'start': start_date })
        }
        catch (err) {
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
        var exchanges_historical_balances = []
        var historicalBTCReturn = await this.getHistoricalBitcoinReturn()
        for (var exchange_account in this.exchange_accounts) {
            if (this.exchange_accounts.hasOwnProperty(exchange_account)) {
                var exchange_historical_balance = this.exchange_accounts[exchange_account].historical_balance
                exchanges_historical_balances.push(exchange_historical_balance)
            }
        }
        return exchanges_historical_balances
    }
}