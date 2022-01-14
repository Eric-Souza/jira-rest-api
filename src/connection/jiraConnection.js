import JiraApi from 'jira-client';

// From 'https://www.npmjs.com/package/jira-client' package
export const connectToJiraApi = () => {
  try {
    // Establish connection to Jira API
    const jira = new JiraApi({
      protocol: 'https',
      host: process.env.JIRA_HOST,
      username: process.env.JIRA_USERNAME,
      password: process.env.JIRA_TOKEN,
      apiVersion: '2',
      strictSSL: true,
    });

    console.log('Connected to Jira API successfully!');
    return jira;
  } catch (error) {
    return console.log(error);
  }
};
