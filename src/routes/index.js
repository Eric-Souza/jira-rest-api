import express from 'express';
import { promisify } from 'util';

import { connectToGoogleApi } from '../connection/googleConnection';
import { connectToJiraApi } from '../connection/jiraConnection';

const routes = express.Router();

routes.get('/issues', async (req, res) => {
  try {
    const jira = connectToJiraApi();

    /**
     * @Params boardId: string - board to retrieve issues from
     * @Params startAt: number - Issue number to start from
     * @Params maxResults: number - Number of issues to be brought
     * @Returns All issues from the specified board
     */
    const allIssues = await jira.getIssuesForBoard(
      process.env.DOGE_BOARD_ID,
      0,
      500
    );

    if (!allIssues) {
      return res.status(404).send('Sorry, no issues were found...');
    }

    const allIssuesData = [];

    allIssues.issues.map((issue) => {
      const issueData = {
        issueKey: issue.key,
        issueId: issue.id,
        issueType: issue.fields.issuetype?.name,
        // issueFibonacciPoints: ,
        issueLabel: issue.fields.labels,
        issueSummary: issue.fields.summary,
        issueSubtasks: issue.fields.subtasks,
        issueStatus: issue.fields.status?.name,
        issueCreatedAt: issue.fields.created,
        issueUpdatedAt: issue.fields.updated,
        issueSprintData: issue.fields.customfield_10020,
        issueArea: issue.fields.customfield_10039?.value,
        issueCreator: issue.fields.creator?.displayName,
        issueAssignee: issue.fields.assignee?.displayName,
        // issueDescription: issue.fields.description,
        issuePriority: issue.fields.priority?.name,
      };

      allIssuesData.push(issueData);
    });

    // Get google spreadsheet
    const document = await connectToGoogleApi();

    console.log('document', document.title);

    return res.status(200).send(allIssues);
  } catch (error) {
    return console.log('Error:', error);
  }
});

export default routes;
