import { connectToJiraApi } from '../connection/jira';

export const CreateIssuesController = async (req, res) => {
  // Connects to Jira API
  const jira = connectToJiraApi();

  const issues = await jira.getIssuesForBoard(16);
  console.log('issues', JSON.stringify(issues, null, 2));

  const newIssue = await jira.addNewIssue(req.body);

  console.log('newIssue', JSON.stringify(newIssue, null, 2));
  return res.json(newIssue);
};
