import express from 'express';

import { IssuesController } from './controllers/IssuesController';
import { CreateIssuesController } from './controllers/CreateIssuesController';
import { UpdateIssuesController } from './controllers/UpdateIssuesController';
import { DefaultRouteController } from './controllers/DefaultRouteController';
import { GetIssuesController } from './controllers/GetIssuesController';

const routes = express.Router();

// Default route
routes.get('/', DefaultRouteController);

// Gets all issues by board id and generates a Google Sheet with its data
routes.get('/issues/sheet', IssuesController);

// Gets all issues by board id
routes.get('/issues', GetIssuesController);

// Creates a new issue
routes.post('/issues', CreateIssuesController);

// Updates an issue
routes.put('/issues/:id', UpdateIssuesController);

export default routes;
