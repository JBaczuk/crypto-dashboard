import PortfolioHistory from './portfolio_history.js'
import ExchangeAuth from './exchange_auth.js'

var exchangeAuth = new ExchangeAuth()
var exchanges = exchangeAuth.exchanges
var portfolioHistory = new PortfolioHistory(exchangeAuth, exchanges)

portfolioHistory.getHistoricalPortfolioReturn()