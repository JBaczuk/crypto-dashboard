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
			portfolio.getHistoricalBitcoinReturn()
				.then(function (btc_return) {
					res.json(btc_return)
				})
		}
	},

	/** GET /:id - Return a given entity */
	read({ exchange }, res) {
		console.log(exchange)
		res.json("You want the " + exchange + " btc return")
	}
})