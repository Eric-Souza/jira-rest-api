import { parseISO, format } from 'date-fns';

import { connectToGoogleApi } from '../connection/google';
import { connectToJiraApi } from '../connection/jira';

const IssueStatus = {
  BUSINESS_REFINEMENT: 'Business Refinement',
  TECHNICAL_REFINEMENT: 'Technical Refinement',
  READY_TO_DEVELOPMENT: 'Ready for Development',
  TO_DO: 'To Do',
  IN_PROGRESS : 'In Progress',
  ON_HOLD : 'On Hold',
  READY_CODE_REVIEW : 'Ready for Code Review',
  CODE_REVIEW_IN_PROGRESS : 'Code Review in Progress',
  READY_QA : 'Ready for QA',
  QA_IN_PROGRESS : 'QA in Progress',
  READY_RELEASE : 'Ready for Release',
  DONE : 'Done',
}


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
  'issueStartDate',
  'issueChangeCompletionDate',
  'issueSprints',
  'issueArea',
  'issueCreator',
  'issueAssignee',
  'issueAssigneeQA',
  'issueDescription',
  'issuePriority',
  'issueStoryPoints',
  'Refinamento',
  'DescricaoNegocio',
  'DescricaoTecnica',
  'PrototipoDeTela',  
  'CritérioDeAceite', 
  'CenariosDeTeste',
  'EstimativaMacro',
  'CheckedByCR',
  'CheckedByQA',
  'CriterioReady',
  'PorcentagemReady',
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
        issueStartDate: issue.fields.start && format(parseISO(issue.fields.start), 'dd-MM-yyyy'),
        issueChangeCompletionDate: issue.fields.change && format(parseISO(issue.fields.change), 'dd-MM-yyyy'),
        issueSprints: JSON.stringify(issueSprintNames),
        issueArea: issue.fields.customfield_100310?.value,
        issueCreator: issue.fields.creator?.displayName,
        issueAssignee: issue.fields.assignee?.displayName,
        issueAssigneeQA: issue.fields.customfield_10170?.displayName,
        issueDescription: issue.fields.description,
        issuePriority: issue.fields.priority?.name,
        issueStoryPoints: issue.fields.customfield_10026,
        Refinamento:      Object.values(IssueStatus).slice(0,12).includes(issue.fields.status?.name) ? 'OK' : 'NOK',
        DescricaoNegocio: Object.values(IssueStatus).slice(1,12).includes(issue.fields.status?.name) ? 'OK' : 'NOK',
        DescricaoTecnica: Object.values(IssueStatus).slice(2,12).includes(issue.fields.status?.name) ? 'OK' : 'NOK',
        PrototipoDeTela:  Object.values(IssueStatus).slice(2,12).includes(issue.fields.status?.name) ? 'OK' : 'NOK', 
        CritérioDeAceite: Object.values(IssueStatus).slice(2,12).includes(issue.fields.status?.name) ? 'OK' : 'NOK',
        CenariosDeTeste:  Object.values(IssueStatus).slice(2,12).includes(issue.fields.status?.name) ? 'OK' : 'NOK',
        EstimativaMacro:  Object.values(IssueStatus).slice(3,12).includes(issue.fields.status?.name) ? 'OK' : 'NOK',      
        CheckedByCR:      Object.values(IssueStatus).slice(8,12).includes(issue.fields.status?.name) ? 'OK' : 'NOK',
        CheckedByQA:      Object.values(IssueStatus).slice(10,12).includes(issue.fields.status?.name) ? 'OK' : 'NOK', 
      
      };

      const fieldsAnalyse = [row.Refinamento, row.DescricaoNegocio, row.DescricaoTecnica, row.PrototipoDeTela, row.CritérioDeAceite, row.CenariosDeTeste, row.EstimativaMacro, row.CheckedByCR, row.CheckedByQA];
      const filterFieldsOK = fieldsAnalyse.filter((item => item === 'OK'));
      const perFieldsReady = Math.floor((100 * filterFieldsOK.length) / fieldsAnalyse.length);

      Object.assign(row, { PorcentagemReady: `${perFieldsReady}%`, CriterioReady: `${fieldsAnalyse.length}%` })

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