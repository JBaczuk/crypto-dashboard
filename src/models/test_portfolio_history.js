import Portfolio from './portfolio.js'

var portfolio = new Portfolio()

// portfolio.getCurrentInvestment()
// .then(function (investment) {
//     console.log(JSON.stringify(investment))
// })

portfolio.initializePortfolio()
.then(function (result) {
    portfolio.getHistoricalPortfolioReturn()
    .then(function (portfolio_return) {
        console.log('portfolio return: ' + JSON.stringify(portfolio_return))
    })
})


// portfolio.getHistoricalBitcoinReturn()
// .then(function (bitoin_return) {
//     console.log('bitoin return: ' + JSON.stringify(bitoin_return))
// })

// portfolio.initializePortfolio()
// .then(function (result) {
//     console.log(result)
//     var currentInvestment = portfolio.getCurrentInvestment()
//     var currentBalance = portfolio.getBalance()
//     console.log('current Investment: ' + JSON.stringify(currentInvestment))
//     console.log('current Balance: ' + JSON.stringify(currentBalance))
// })