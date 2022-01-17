import { GoogleSpreadsheet } from 'google-spreadsheet';
import credentials from '../../client_secret.json';

// From 'https://www.npmjs.com/package/google-spreadsheet' package
export const connectToGoogleApi = async () => {
  try {
    // Instantiate Google spreadsheet class
    const document = new GoogleSpreadsheet(
      '1yNosvUZPv1Zmdb93AV8CGjBM3jb4qeeLoNmjNWaP4ys'
    );

    // Auth to Google
    await document.useServiceAccountAuth(credentials);

    // Get spreadsheet info
    await document.loadInfo();

    console.log('Connected to Google API successfully!');
    return document;
  } catch (error) {
    return console.warn(error);
  }
};
