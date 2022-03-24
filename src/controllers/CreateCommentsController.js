import { connectToJiraApi } from '../connection/jira';

export const CreateCommentsController = async (req, res) => {
  // Connects to Jira API
  const jira = connectToJiraApi();

  const newComment = await jira.addComment(req.params.id, req.body.comment);

  return res.json(newComment);
};
