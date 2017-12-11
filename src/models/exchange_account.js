import Gdax from 'gdax'
import Poloniex from 'poloniex.js'
import bittrex from 'node-bittrex-api'
import coinbase from 'coinbase'

export default class {
    constructor(exchange) {
        this.exchange = exchange
        this.btc_value = 0
        this.usd_value = 0
        this.coin_accounts = []
        this.transactions = []
        this.api = this.getApi()
    }
    getApi() {
        if(this.exchange === 'GDAX') {
            return new Gdax.AuthenticatedClient(process.env.GDAX_KEY, process.env.GDAX_SECRET, process.env.GDAX_PASSPHRASE, 'https://api.gdax.com') // 'https://api-public.sandbox.gdax.com'
        }
        if(this.exchange === 'POLONIEX') {
            return new Poloniex(process.env.POLONIEX_KEY, process.env.POLONIEX_SECRET)
        }
        if(this.exchange === 'BITTREX') {
            bittrex.options({ 'apikey': process.env.BITTREX_KEY, 'apisecret': process.env.BITTREX_SECRET })
            return bittrex
        }
        if(this.exchange === 'COINBASE') {
            var Client = coinbase.Client
            return new Client({'apiKey': process.env.COINBASE_KEY, 'apiSecret': process.env.COINBASE_SECRET})
        }
    }
}