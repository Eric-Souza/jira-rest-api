# Initialization

* run `npm install` to get all dependencies
* run `npm run dev` to execute the server in development mode

# Implementation

This app uses the dependency jira-client (https://www.npmjs.com/package/jira-client) which uses jira-node API (https://jira-node.github.io/class/src/jira.js~JiraApi.html) to make requests to Atlassian Jira Rest API. In the `src/connection` folder, a simple class is used to establish connection to Jira's services. The request routes are developed at `src/routes.js`, which will instantiate a Jira connection and have access to its functions.

# Routes

* Get all boards:
`GET http://localhost:3333/boards`
