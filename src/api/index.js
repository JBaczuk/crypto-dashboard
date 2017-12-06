import { api_version } from '../../package.json';
import { Router } from 'express';
// import facets from './facets';
import balances from './balances';

export default ({ config, db }) => {
	let api = Router();

	// mount the facets resource
	// api.use('/facets', facets({ config, db }));
	api.use('/balances', balances({ config, db }));

	// perhaps expose some API metadata at the root
	api.get('/', (req, res) => {
		res.json({ api_version });
	});

	return api;
}
