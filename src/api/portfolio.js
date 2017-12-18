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
		if(Object.keys(portfolio.exchange_accounts).length == 0) {
			res.sendStatus(401);
		}
		else {
			var portfolio_object = {}
			portfolio.getBalances()
			.then(function (all_balances) {
				portfolio_object.balances = all_balances
				portfolio.getCurrentInvestment()
				.then(function (investment) {
					portfolio_object.investment = investment
					console.log('ready to send investment: ' + investment)
					res.json(portfolio_object)
				})
			})
		}
	},

	/** GET /:id - Return a given entity */
	read({ exchange }, res) {
		console.log(exchange)
		res.json("You want the " + exchange + " balance")
	}
})