import { connectToJiraApi } from '../connection/jira';

export const GetIssuesController = async (req, res) => {
  // Connects to Jira API
  const jira = connectToJiraApi();

  const issues = await jira.getIssuesForBoard(process.env.JIRA_BOARD_ID);

  return res.json(issues);
};
