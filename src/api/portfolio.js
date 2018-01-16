import resource from 'resource-router-middleware'
import Portfolio from '../models/portfolio'

// TODO: pull this from DB based on user
var portfolio = new Portfolio()

export default ({ config, db }) => resource({

	id: 'exchange',

	load(req, id, callback) {
		var exchange = id,
			err = exchange ? null : 'Not found'
		callback(err, exchange)
	},

	/** GET / - List all entities */
	index({ params }, res) {
		if (Object.keys(portfolio.exchange_accounts).length == 0) {
			res.sendStatus(401);
		}
		else {
			var portfolio_object = {}
			portfolio.initializePortfolio()
				.then(function (result) {
					portfolio_object.balances = portfolio.getBalances()
					portfolio_object.investment = portfolio.getCurrentInvestment()
					res.json(portfolio_object)
				})
		}
	},

	/** GET /:id - Return a given entity */
	read({ exchange }, res) {
		var exchange_object = {}
		portfolio.initializePortfolio()
		.then(function (result) {
			portfolio.exchange_accounts[exchange.toUpperCase()].getTrades()
			.then(function (historical_trades) {
				exchange_object['historical_trades'] = historical_trades
				exchange_object['balance'] = portfolio.exchange_accounts[exchange.toUpperCase()].balance
				res.json(exchange_object)
			})
		})
	}
})