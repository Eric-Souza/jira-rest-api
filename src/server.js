import express from 'express';
import routes from './routes';

require('dotenv').config();

const port = process.env.PORT;

const app = express();

app.use(routes);

app.listen(port);
