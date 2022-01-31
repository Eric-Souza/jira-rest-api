import { parseISO, format } from 'date-fns';

import { connectToGoogleApi } from '../connection/google';
import { connectToJiraApi } from '../connection/jira';

export const IssuesController = async (req, res) => {
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
    5000
  );

  if (!allIssues) {
    return res.status(404).send('Sorry, no issues were found...');
  }

  // Gets google spreadsheet
  const document = await connectToGoogleApi();

  const sheet = await document.sheetsByIndex[0];

  if (!sheet) {
    // Create new sheet
  }

  // Clears all sheet data
  await sheet.clear();

  var currentDate = new Date();
  var dd = String(currentDate.getDate()).padStart(2, '0');
  var mm = String(currentDate.getMonth() + 1).padStart(2, '0');
  var yyyy = currentDate.getFullYear();

  currentDate = mm + '/' + dd + '/' + yyyy;

  // Updates title with board id and current day
  await sheet.updateProperties({
    title: `Issues - Board ${process.env.JIRA_BOARD_ID} - Created at ${currentDate}`,
  });

  const headerValues = [
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
  ];

  // Sets sheet's header row
  await sheet.setHeaderRow(headerValues);

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
      `Sheet with all issues from board with id ${process.env.JIRA_BOARD_ID} updated at '${process.env.DASHBOARD_SHEET}'!`
    );
};
