import express from 'express';
import routes from './routes';

require('dotenv').config();

const port = process.env.PORT ? process.env.PORT : 3444;

const app = express();

app.use(routes);

app.listen(port);
