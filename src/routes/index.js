import express from 'express';

import { connectToGoogleApi } from '../connection/google';
import { connectToJiraApi } from '../connection/jira';

const routes = express.Router();

// Default route
routes.get('/', (req, res) => {
  return res.send(
    `<div>
      <h2> Hello! You have reached the default route. </h2>
      <p> To use the API, please refer to one of the following routes: </p>

      <ul>
        <li>/issues - Get all issues by board id and generate a Google Sheet with its data</li>
      </ul>
    </div>`
  );
});

// Gets all issues by board id and generates a Google Sheet with its data
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

    // Gets google spreadsheet
    const document = await connectToGoogleApi();

    // Creates a new sheet with issues' headers
    const sheet = await document.addSheet({
      headerValues: [
        'issueKey',
        'issueId',
        'issueType',
        'issueLabel',
        'issueSummary',
        'issueSubtasks',
        'issueStatus',
        'issueCreatedAt',
        'issueUpdatedAt',
        'issueSprintData',
        'issueArea',
        'issueCreator',
        'issueAssignee',
        'issueDescription',
        'issuePriority',
      ],
    });

    const issuesRows = [];

    // Gets each issue and adds a row with its data
    allIssues.issues.map(async (issue) => {
      const row = {
        issueKey: JSON.stringify(issue.key),
        issueId: JSON.stringify(issue.id),
        issueType: JSON.stringify(issue.fields.issuetype?.name),
        issueLabel: JSON.stringify(issue.fields.labels),
        issueSummary: JSON.stringify(issue.fields.summary),
        issueSubtasks: JSON.stringify(issue.fields.subtasks),
        issueStatus: JSON.stringify(issue.fields.status?.name),
        issueCreatedAt: JSON.stringify(issue.fields.created),
        issueUpdatedAt: JSON.stringify(issue.fields.updated),
        issueSprintData: JSON.stringify(issue.fields.customfield_10020),
        issueArea: JSON.stringify(issue.fields.customfield_10039?.value),
        issueCreator: JSON.stringify(issue.fields.creator?.displayName),
        issueAssignee: JSON.stringify(issue.fields.assignee?.displayName),
        issueDescription: JSON.stringify(issue.fields.description),
        issuePriority: JSON.stringify(issue.fields.priority?.name),
        // issueFibonacciPoints: ,
      };

      issuesRows.push(row);
    });

    await sheet.addRows(issuesRows);

    return res
      .status(200)
      .send(
        "Sheet with updated Doge Squad issues created at 'https://docs.google.com/spreadsheets/d/1yNosvUZPv1Zmdb93AV8CGjBM3jb4qeeLoNmjNWaP4ys/edit#gid=1972193109'!"
      );
  } catch (error) {
    return res.status(500).send(`An error occured: ${error}`);
  }
});

export default routes;
