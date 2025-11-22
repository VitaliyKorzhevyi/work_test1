import Imap from 'imap';
import nodemailer from 'nodemailer';
import { simpleParser } from 'mailparser';
import { Buffer } from 'buffer';

export default class Outlook {
  constructor(config) {
    this.config = config;
    this.imap = null;
    this.smtp = null;
    this.username = null;
    this.password = null;
  }

  async login(username, password) {
    this.username = username;
    this.password = password;

    this.imap = new Imap({
      user: username,
      password: password,
      host: this.config.imap_server,
      port: this.config.imap_port,
      tls: true,
      tlsOptions: { rejectUnauthorized: false },
      connTimeout: 30000,
      authTimeout: 30000,
    });

    return new Promise((resolve, reject) => {
      this.imap.once('ready', () => {
        console.log(` > Signed in as ${username}`);
        resolve();
      });
      this.imap.once('error', (err) => {
        console.error(' > Sign in error:', err);
        reject(err);
      });
      this.imap.connect();
    });
  }

  async logout() {
    if (!this.imap) return;
    this.imap.end();
    console.log(' > Logged out');
  }

  async sendEmail(recipient, subject, html) {
    const transporter = nodemailer.createTransport({
      host: this.config.smtp_server,
      port: this.config.smtp_port,
      secure: false,
      auth: {
        user: this.username,
        pass: this.password,
      },
    });

    try {
      await transporter.sendMail({
        from: this.username,
        to: recipient,
        subject,
        html,
      });
      console.log('   email sent.');
    } catch (err) {
      console.error('   Sending email failed:', err);
      throw new Error('Send failed. Check the recipient email address');
    }
  }

  openInbox() {
    return new Promise((resolve, reject) => {
      this.imap.openBox('INBOX', false, (err, box) => {
        if (err) reject(err);
        else resolve(box);
      });
    });
  }

  async unreadIdsSince(days) {
    const since = this._sinceDate(days);
    await this.openInbox();

    return new Promise((resolve, reject) => {
      this.imap.search(['UNSEEN', ['SINCE', since]], (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });
  }

  async allIds() {
    await this.openInbox();

    return new Promise((resolve, reject) => {
      this.imap.search(['ALL'], (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });
  }

  async getEmailById(id) {
    await this.openInbox();
    return new Promise((resolve, reject) => {
      const f = this.imap.fetch(id, { bodies: '' });
      f.on('message', (msg) => {
        msg.on('body', async (stream) => {
          const parsed = await simpleParser(stream);
          resolve(parsed);
        });
      });
      f.once('error', reject);
    });
  }

  _sinceDate(days) {
    const date = new Date();
    date.setDate(date.getDate() - days);
    return date.toISOString().split('T')[0];
  }

  async unread() {
    const ids = await this.unreadIdsSince(1);
    if (!ids.length) return null;
    return this.getEmailById(ids[ids.length - 1]);
  }
}
