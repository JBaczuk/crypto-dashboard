import Balances from './balances'

var balance = new Balances()

balance.getBalances()
.then(function (all_balances) {
    console.log("all balances: " + JSON.stringify(all_balances))
})