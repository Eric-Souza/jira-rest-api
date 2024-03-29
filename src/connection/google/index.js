import { GoogleSpreadsheet } from 'google-spreadsheet';
import credentials from '../../../client_secret.json';

// From 'https://www.npmjs.com/package/google-spreadsheet' package
export const connectToGoogleApi = async () => {
  try {
    // Instantiate Google spreadsheet class by its id
    const document = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID);

    // Auth to Google with google developer credentials
    await document.useServiceAccountAuth(credentials);

    // Get spreadsheet info
    await document.loadInfo();

    console.log('Connected to Google API successfully!');
    return document;
  } catch (error) {
    return console.warn(error);
  }
};
