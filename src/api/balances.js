import resource from 'resource-router-middleware'
import Balances from '../models/balances'

// TODO: pull this from DB based on user
var balance = new Balances()

export default ({ config, db }) => resource({

	id: 'exchange',

	load(req, id, callback) {
		var exchange = id,
			err = exchange ? null : 'Not found'
		callback(err, exchange)
	},

	/** GET / - List all entities */
	index({ params }, res) {
		balance.getBalances()
		.then(function (all_balances) {
			res.json(all_balances)
		})
	},

	/** GET /:id - Return a given entity */
	read({ exchange }, res) {
		console.log(exchange)
		res.json("You want the " + exchange + " balance")
	}
})