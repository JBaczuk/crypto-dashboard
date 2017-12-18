import { api_version } from '../../package.json';
import { Router } from 'express';
// import facets from './facets';
import Portfolio from './portfolio';
import HistoricalBtcReturn from './historical_btc_return';

export default ({ config, db }) => {
	let api = Router();

	// mount the facets resource
	// api.use('/facets', facets({ config, db }));
	api.use('/portfolio', Portfolio({ config, db }));
	api.use('/historical_btc_return', HistoricalBtcReturn({ config, db }))

	// perhaps expose some API metadata at the root
	api.get('/', (req, res) => {
		res.json({ api_version });
	});

	return api;
}
