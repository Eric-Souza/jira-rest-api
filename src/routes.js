import express from 'express';
import { connectToJiraApi } from './connection/jiraConnection';

const routes = express.Router();

routes.get('/boards', async (req, res) => {
  try {
    const jira = connectToJiraApi();

    const allBoards = await jira.getAllBoards();

    if (!allBoards) {
      return res.status(404).send('Sorry, no boards were found...');
    }

    return res.status(200).send(allBoards);
  } catch (error) {
    return console.log('Error:', error);
  }
});

export default routes;
