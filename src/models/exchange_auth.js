import Gdax from 'gdax'
import Poloniex from 'poloniex.js'
import bittrex from 'node-bittrex-api'

export default class {
    constructor() {
        // TODO: add check for missing env vars
        this.gdaxAuthedClient = new Gdax.AuthenticatedClient(process.env.GDAX_KEY, process.env.GDAX_SECRET, process.env.GDAX_PASSPHRASE, 'https://api.gdax.com') // 'https://api-public.sandbox.gdax.com'
        this.poloniex = new Poloniex(process.env.POLONIEX_KEY, process.env.POLONIEX_SECRET)
        bittrex.options({ 'apikey': process.env.BITTREX_KEY, 'apisecret': process.env.BITTREX_SECRET })
        this.bittrex = bittrex
    }
}
