import { parseISO, format } from 'date-fns';

import { connectToGoogleApi } from '../connection/google';
import { connectToJiraApi } from '../connection/jira';

// Google sheet header values
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

// Gets board by id and all issues contained within
const handleGetIssues = async (jira, res) => {
  try {
    const board = await jira.getBoard(process.env.JIRA_BOARD_ID);

    if (!board) {
      return res
        .status(404)
        .send('Sorry, no board was found with specified id...');
    }

    const allIssues = await jira.getIssuesForBoard(
      process.env.JIRA_BOARD_ID,
      0, // startAt: number - Issue number to start from
      5000 // maxResults: number - Number of issues to be brought
    );

    if (!allIssues) {
      return res
        .status(404)
        .send('Sorry, no issues were found in specified board...');
    }

    return { board, allIssues };
  } catch (error) {
    return res
      .status(500)
      .send(`Error while getting board and all issues: ${error}`);
  }
};

// Maps each issue and writes a sheet with its data
const handleWriteSheet = async (sheet, allIssues) => {
  try {
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
  } catch (error) {
    return res
      .status(500)
      .send(`Error while writing issues data into sheet: ${error}`);
  }
};

// If no sheet is found, a new one is created
const handleCreateNewSheet = async (document, board, allIssues, res) => {
  try {
    // Creates a new sheet
    const newSheet = await document.addSheet({
      headerValues,
      title: board.name,
    });

    // Writes issues data into new sheet
    await handleWriteSheet(newSheet, allIssues);

    return res
      .status(200)
      .send(
        `New sheet with all issues from board ${board.name} created at '${process.env.DASHBOARD_SHEET}'!`
      );
  } catch (error) {
    return res.status(500).send(`Error while creating new sheet: ${error}`);
  }
};

// Updates existing sheet (default case)
const handleUpdateSheet = async (sheet, board, allIssues, res) => {
  try {
    // Clears all existing sheet data
    await sheet.clear();

    // Sets sheet's header row
    await sheet.setHeaderRow(headerValues);

    // Overwrites existing sheet with new issues data
    await handleWriteSheet(sheet, allIssues);

    return res
      .status(200)
      .send(
        `Sheet with all issues from board ${board.name} updated at '${process.env.DASHBOARD_SHEET}'!`
      );
  } catch (error) {
    return res
      .status(500)
      .send(`Error while updating existing sheet: ${error}`);
  }
};

export const IssuesController = async (req, res) => {
  // Connects to Jira API
  const jira = connectToJiraApi();

  // Gets board by id and all jira issues contained within
  const { board, allIssues } = await handleGetIssues(jira, res);

  // Connects to Google API and gets spreadsheets
  const document = await connectToGoogleApi();

  // Gets sheet by its name
  const sheet = await document.sheetsByTitle[board.name];

  // Checks if found sheet already exists
  if (!sheet) {
    // If specified sheet doesn't exist, creates it
    return await handleCreateNewSheet(document, board, allIssues, res);
  }

  return await handleUpdateSheet(sheet, board, allIssues, res);
};
