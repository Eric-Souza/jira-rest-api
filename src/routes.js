import express from 'express';

import { IssuesController } from './controllers/IssuesController';
import { DefaultRouteController } from './controllers/DefaultRouteController';

const routes = express.Router();

// Default route
routes.get('/', DefaultRouteController);

// Gets all issues by board id and generates a Google Sheet with its data
routes.get('/issues', IssuesController);

export default routes;
