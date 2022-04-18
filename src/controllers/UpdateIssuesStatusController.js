import { connectToJiraApi } from '../connection/jira';

export const UpdateIssuesTransitionController = async (req, res) => {
  // Connects to Jira API
  const jira = connectToJiraApi();

  await jira.transitionIssue(req.params.id, { "transition": { "id": req.params.transitionId } })

  return res.send();
};
