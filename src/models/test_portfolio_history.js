import Portfolio from './portfolio.js'

var portfolio = new Portfolio()

// portfolio.getCurrentInvestment()
// .then(function (investment) {
//     console.log(JSON.stringify(investment))
// })

portfolio.getHistoricalPortfolioReturn()
.then(function (portfolio_return) {
    // console.log('portfolio return: ' + JSON.stringify(portfolio_return))
})

// portfolio.getHistoricalBitcoinReturn()
// .then(function (bitoin_return) {
//     console.log('bitoin return: ' + JSON.stringify(bitoin_return))
// })