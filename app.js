import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import Outlook from './server.js';
import config from './config.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Initialize Outlook client
const outlook = new Outlook(config);

// Function to get the last email
async function getLastEmail(email, password) {
  try {
    await outlook.login(email, password);
    const lastEmail = await outlook.unread();

    if (!lastEmail) {
      // If no unread emails, get the most recent email
      const allIds = await outlook.allIds();
      if (allIds.length === 0) {
        throw new Error('No emails found');
      }
      const lastEmailData = await outlook.getEmailById(allIds[allIds.length - 1]);
      return {
        from: lastEmailData.from.text,
        subject: lastEmailData.subject || 'No Subject',
        date: lastEmailData.date.toISOString(),
        body: lastEmailData.text || lastEmailData.html || 'No body'
      };
    }

    return {
      from: lastEmail.from.text,
      subject: lastEmail.subject || 'No Subject',
      date: lastEmail.date.toISOString(),
      body: lastEmail.text || lastEmail.html || 'No body'
    };

  } catch (error) {
    console.error('Error fetching email:', error);

    // Provide more specific error messages for common issues
    if (error.message.includes('LOGIN failed') || error.message.includes('Invalid credentials')) {
      throw new Error('Authentication failed. For Outlook.com, you may need to:\n1. Use an app password if 2FA is enabled\n2. Enable IMAP access in your account settings\n3. Allow less secure apps (if available)');
    } else if (error.message.includes('connection timed out')) {
      throw new Error('Connection timed out. Check your internet connection and Outlook IMAP settings.');
    } else if (error.message.includes('ENOTFOUND') || error.message.includes('ECONNREFUSED')) {
      throw new Error('Cannot connect to Outlook IMAP server. Check your network and account settings.');
    } else {
      throw new Error('Failed to fetch email: ' + error.message);
    }
  } finally {
    await outlook.logout();
  }
}

// API endpoint
app.post('/get-last-email', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
    const lastEmail = await getLastEmail(email, password);
    res.json({ email: lastEmail });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});