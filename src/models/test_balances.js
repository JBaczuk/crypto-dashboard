import Balances from './balances'

var exchanges = ['POLONIEX'] //['GDAX', 'POLONIEX', 'BITTREX']
var balance = new Balances(exchanges)

balance.getBalances()
.then(function (all_balances) {
    console.log("all balances: " + JSON.stringify(all_balances))
})