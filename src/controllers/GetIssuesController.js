import { connectToJiraApi } from '../connection/jira';

export const GetIssuesController = async (req, res) => {
  // Connects to Jira API
  const jira = connectToJiraApi();

  const issues = await jira.getIssue(req.params.id);

  return res.json(issues);
};
