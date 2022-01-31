import { parseISO, format } from 'date-fns';

import { connectToGoogleApi } from '../connection/google';
import { connectToJiraApi } from '../connection/jira';

import { getCurrentDate } from '../utils/getCurrentDate';

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

// Connects to Jira API and gets all issues by board id
const handleGetIssues = async (jira, res) => {
  try {
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

    return allIssues;
  } catch (error) {
    return res.status(500).send(`Error while getting all issues: ${error}`);
  }
};

// Maps each issue and writes a sheet row with its data
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
const handleCreateNewSheet = async (document, allIssues, res) => {
  try {
    // Gets and parses current date
    const currentDate = getCurrentDate();

    // Creates a new sheet
    const newSheet = await document.addSheet({
      headerValues,
      title: `Issues - Board ${process.env.JIRA_BOARD_ID} - Created at ${currentDate}`,
    });

    // Writes issues data into new sheet
    await handleWriteSheet(newSheet, allIssues);

    return res
      .status(200)
      .send(
        `New sheet with all issues from board with id ${process.env.JIRA_BOARD_ID} created at '${process.env.DASHBOARD_SHEET}'!`
      );
  } catch (error) {
    return res.status(500).send(`Error while creating new sheet: ${error}`);
  }
};

// Updates existing sheet (default case)
const handleUpdateSheet = async (sheet, allIssues, res) => {
  try {
    // Clears all existing sheet data
    await sheet.clear();

    // Gets and parses current date
    const currentDate = getCurrentDate();

    // Updates title with board id and current day
    await sheet.updateProperties({
      title: `Issues - Board ${process.env.JIRA_BOARD_ID} - Updated at ${currentDate}`,
    });

    // Sets sheet's header row
    await sheet.setHeaderRow(headerValues);

    // Overwrites existing sheet with new issues data
    await handleWriteSheet(sheet, allIssues);

    return res
      .status(200)
      .send(
        `Sheet with all issues from board with id ${process.env.JIRA_BOARD_ID} updated at '${process.env.DASHBOARD_SHEET}'!`
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

  // Gets all jira issues by board id
  const allIssues = await handleGetIssues(jira, res);

  // Connects to Google API and gets spreadsheets
  const document = await connectToGoogleApi();

  // Gets sheet
  const sheet = await document.sheetsByIndex[0];

  // Checks if a sheet already exists
  if (!sheet) {
    return await handleCreateNewSheet(document, allIssues, res);
  }

  return await handleUpdateSheet(sheet, allIssues, res);
};
