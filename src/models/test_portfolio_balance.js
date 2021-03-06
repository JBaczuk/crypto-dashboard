import Portfolio from './portfolio.js'

var portfolio = new Portfolio()
portfolio.getBalances()
    .then(function (balances) {
        console.log(JSON.stringify(balances))
        var totalValue = 0
        balances.forEach(function (exchangeObj) {
            for (var exchange in exchangeObj) {
                if (exchangeObj.hasOwnProperty(exchange)) {
                exchangeObj[exchange].forEach(function (currencyObj) {
                    for (var currency in currencyObj) {
                        if (currencyObj.hasOwnProperty(currency)) {
                            totalValue = totalValue + parseFloat(currencyObj[currency].usd_value)
                        }
                    }
                })
            }
        }
        })
        console.log('Portfolio Value: ' + totalValue)
    })