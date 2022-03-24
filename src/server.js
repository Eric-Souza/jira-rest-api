import express from 'express';
import routes from './routes';

require('dotenv').config();

const app = express();

app.use(express.json(), routes);

app.listen(process.env.PORT, () =>
  console.log(`Server running on port ${process.env.PORT}!`)
);
