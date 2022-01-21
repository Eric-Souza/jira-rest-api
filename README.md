# Initialization

- run `npm install` to install all dependencies
- run `npm run dev` to run the server in development mode
- run `npm start` to run the server

# Implementation

## Jira

This app uses the dependency jira-client `https://www.npmjs.com/package/jira-client` which uses jira-node API
`https://jira-node.github.io/class/src/jira.js~JiraApi.html` to make requests to Atlassian Jira Rest API with
JavaScript. In the `src/connection` folder, a simple class is used to establish connection to Jira's services.
The request routes are developed at `src/routes`, which will instantiate a Jira connection and have access
to its functions. To have access to your own Jira account, input your data into Jira's env variables.

## Google Sheets

This app uses the dependency google-spreadsheet `https://www.npmjs.com/package/google-spreadsheet` to use
Google Sheets Rest API with JavaScript. To have access to Google Sheets API, it is necessary to create a
google developer account `https://www.npmjs.com/package/google-spreadsheet` and request access to Google Sheets API.
After the process is finished, Google'll generate an authentication json file, which must be put into this project's
root folder with the name `client_secret.json`, so it can be imported as `credentials` by `src/connection.google` and
connect this app to Google API successfully. The `GOOGLE_SHEET_ID` env variable represents the sheet to be manipulated.

# Routes

- Default route:
  `GET http://localhost:3333/`

- Get all issues by specified board id:
  `GET http://localhost:3333/issues`
