import express from 'express';

import { parseISO, format } from 'date-fns';

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
      process.env.JIRA_BOARD_ID,
      0,
      2000
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
        'issueType',
        'issueLabel',
        'issueSummary',
        'issueSubtasks',
        'issueStatus',
        'issueCreatedAt',
        'issueUpdatedAt',
        'issueSprints',
        'issueArea',
        'issueCreator',
        'issueAssignee',
        'issueDescription',
        'issuePriority',
        'issueStoryPoints',
      ],
    });

    const issuesRows = [];

    // Gets each issue and adds a row with its data
    allIssues.issues.map(async (issue) => {
      const issueSprintNames = issue.fields.customfield_10020?.map(
        ({ name }) => name
      );

      const issueSubtasksSummaries = issue.fields.subtasks?.map(
        ({ fields }) => fields.summary
      );

      const row = {
        issueKey: issue.key,
        issueType: issue.fields.issuetype?.name,
        issueLabel: JSON.stringify(issue.fields.labels),
        issueSummary: issue.fields.summary,
        issueSubtasks: JSON.stringify(issueSubtasksSummaries),
        issueStatus: issue.fields.status?.name,
        issueCreatedAt: format(parseISO(issue.fields.created), 'dd-MM-yyyy'),
        issueUpdatedAt: format(parseISO(issue.fields.updated), 'dd-MM-yyyy'),
        issueSprints: JSON.stringify(issueSprintNames),
        issueArea: issue.fields.customfield_10039?.value,
        issueCreator: issue.fields.creator?.displayName,
        issueAssignee: issue.fields.assignee?.displayName,
        issueDescription: issue.fields.description,
        issuePriority: issue.fields.priority?.name,
        issueStoryPoints: issue.fields.customfield_10026,
      };

      issuesRows.push(row);
    });

    await sheet.addRows(issuesRows);

    return res
      .status(200)
      .send(
        `Sheet with updated issues from board with id ${process.env.JIRA_BOARD_ID} created at '${process.env.DASHBOARD_SHEET}'!`
      );
  } catch (error) {
    return res.status(500).send(`An error occured: ${error}`);
  }
});

export default routes;
