import Gdax from 'gdax'
import Poloniex from 'poloniex.js'
import bittrex from 'node-bittrex-api'

export default class {
    constructor() {
        this.exchanges = this.getExchanges()
        // TODO: add check for missing env vars
        this.gdaxAuthedClient = new Gdax.AuthenticatedClient(process.env.GDAX_KEY, process.env.GDAX_SECRET, process.env.GDAX_PASSPHRASE, 'https://api.gdax.com') // 'https://api-public.sandbox.gdax.com'
        this.poloniex = new Poloniex(process.env.POLONIEX_KEY, process.env.POLONIEX_SECRET)
        bittrex.options({ 'apikey': process.env.BITTREX_KEY, 'apisecret': process.env.BITTREX_SECRET })
        this.bittrex = bittrex
    }

    getExchanges() {
        var exchanges = []
        if(process.env.GDAX_KEY != undefined && process.env.GDAX_SECRET != undefined && process.env.GDAX_PASSPHRASE != undefined) {
            exchanges.push("GDAX")
        }
        if(process.env.POLONIEX_KEY != undefined && process.env.POLONIEX_SECRET != undefined) {
            exchanges.push("POLONIEX")
        }
        if(process.env.BITTREX_KEY != undefined && process.env.BITTREX_SECRET != undefined) {
            exchanges.push("BITTREX")
        }
        return exchanges
    }
}
