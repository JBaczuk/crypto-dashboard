import Portfolio from './portfolio.js'

var portfolio = new Portfolio()
portfolio.getBalances()
.then(function (balances) {
    console.log(JSON.stringify(balances))
})