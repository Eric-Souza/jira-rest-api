import { connectToJiraApi } from '../connection/jira';

export const UpdateIssuesController = async (req, res) => {
  // Connects to Jira API
  const jira = connectToJiraApi();

  await jira.updateIssue(req.params.id, req.body);

  return res.send();
};
