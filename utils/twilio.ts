
import * as dotenv from 'dotenv';

// Load environment variables from .env.local file located one directory up
dotenv.config({ path: '../.env.local' });

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_ACCOUNT_AUTH_TOKEN; 
const from = process.env.TWILIO_ACCOUNT_PHONE_NUMBER;

const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;

const sendMessage = async (to: string, body: string) => {
  console.log(from);
  if (!from) {
    console.error('TWILIO_ACCOUNT_PHONE_NUMBER is not set');
    return;
  }

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + Buffer.from(`${accountSid}:${authToken}`).toString('base64'),
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        'To': to,
        'From': from,
        'Body': body
      }).toString()
    });

    const data = await response.json();
    console.log(data); // Log the response data to check the status of the message
  } catch (error) {
    console.error('Error sending message:', error);
  }
};

// Example usage
sendMessage('+18777804236', 'sent from vscode'); // The message is being sent to this phone number