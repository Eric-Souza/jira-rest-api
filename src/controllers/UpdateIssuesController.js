import { connectToJiraApi } from '../connection/jira';

export const UpdateIssuesController = async (req, res) => {
  // Connects to Jira API
  const jira = connectToJiraApi();

  const updateIssue = await jira.updateIssue(req.body);

  return res.json(updateIssue);
};
