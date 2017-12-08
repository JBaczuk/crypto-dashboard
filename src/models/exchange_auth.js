import Gdax from 'gdax'
import Poloniex from 'poloniex.js'
import bittrex from 'node-bittrex-api'
import coinbase from 'coinbase'

export default class {
    constructor() {
        this.exchanges = this.getExchanges()

        this.exchanges.forEach(function (exchange) {
            if(exchange === 'GDAX') {
                this.gdaxAuthedClient = new Gdax.AuthenticatedClient(process.env.GDAX_KEY, process.env.GDAX_SECRET, process.env.GDAX_PASSPHRASE, 'https://api.gdax.com') // 'https://api-public.sandbox.gdax.com'
            }
            if(exchange === 'POLONIEX') {
                this.poloniex = new Poloniex(process.env.POLONIEX_KEY, process.env.POLONIEX_SECRET)
            }
            if(exchange === 'BITTREX') {
                bittrex.options({ 'apikey': process.env.BITTREX_KEY, 'apisecret': process.env.BITTREX_SECRET })
                this.bittrex = bittrex
            }
            if(exchange === 'COINBASE') {
                var Client = coinbase.Client
                this.coinbase = new Client({'apiKey': process.env.COINBASE_KEY, 'apiSecret': process.env.COINBASE_SECRET})
            }
        }.bind(this))

    }

    getExchanges() {
        var exchanges = []
        if(process.env.GDAX_KEY != undefined && process.env.GDAX_SECRET != undefined && process.env.GDAX_PASSPHRASE != undefined) {
            exchanges.push('GDAX')
        }
        if(process.env.POLONIEX_KEY != undefined && process.env.POLONIEX_SECRET != undefined) {
            exchanges.push('POLONIEX')
        }
        if(process.env.BITTREX_KEY != undefined && process.env.BITTREX_SECRET != undefined) {
            exchanges.push('BITTREX')
        }
        if(process.env.COINBASE_KEY != undefined && process.env.COINBASE_SECRET != undefined) {
            exchanges.push('COINBASE')
        }
        return exchanges
    }
}
