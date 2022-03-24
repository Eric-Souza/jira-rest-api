import { connectToJiraApi } from '../connection/jira';

export const CreateIssuesController = async (req, res) => {
  // Connects to Jira API
  const jira = connectToJiraApi();

  const newIssue = await jira.addNewIssue(req.body);

  return res.json(newIssue);
};
