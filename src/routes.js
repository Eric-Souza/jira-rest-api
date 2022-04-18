import express from 'express';

import { IssuesController } from './controllers/IssuesController';
import { CreateIssuesController } from './controllers/CreateIssuesController';
import { UpdateIssuesController } from './controllers/UpdateIssuesController';
import { UpdateIssuesTransitionController } from './controllers/UpdateIssuesTransitionController';
import { DefaultRouteController } from './controllers/DefaultRouteController';
import { GetIssuesController } from './controllers/GetIssuesController';
import { CreateCommentsController } from './controllers/CreateCommentsController';

const routes = express.Router();

// Default route
routes.get('/', DefaultRouteController);

// Gets all issues by board id and generates a Google Sheet with its data
routes.get('/issues/sheet', IssuesController);

// Gets the issue by id
routes.get('/issues/:id', GetIssuesController);

// Creates a new issue
routes.post('/issues', CreateIssuesController);

// Updates an issue
routes.put('/issues/:id', UpdateIssuesController);

// Updates an issue
routes.put('/issues/:id/:transitionId', UpdateIssuesTransitionController);

// Creates a new comment
routes.post('/issues/:id/comments', CreateCommentsController);

export default routes;
