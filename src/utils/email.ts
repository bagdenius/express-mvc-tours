import { htmlToText } from 'html-to-text';
import { createTransport as createNodemailTransport } from 'nodemailer';
import { renderFile } from 'pug';

import type { UserDocument } from '../models/user-model.ts';

export class Email {
  to: string;
  from: string;
  firstName: string;
  url: string;

  constructor(user: UserDocument, url: string) {
    this.to = user.email;
    this.from = `bagdenius <${process.env.EMAIL_FROM}>`;
    this.firstName = user.name.split(' ')[0];
    this.url = url;
  }

  createTransport() {
    if (process.env.NODE_ENV === 'production')
      return createNodemailTransport({
        host: process.env.SENDGRID_HOST,
        port: +process.env.SENDGRID_PORT,
        secure: true,
        auth: {
          user: process.env.SENDGRID_USERNAME,
          pass: process.env.SENDGRID_PASSWORD,
        },
      });
    return createNodemailTransport({
      host: process.env.EMAIL_HOST,
      port: +process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  async send(template: string, subject: string) {
    const html = renderFile(
      `${import.meta.dirname}/../views/email/${template}.pug`,
      { firstName: this.firstName, url: this.url, subject },
    );
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text: htmlToText(html),
    };
    await this.createTransport().sendMail(mailOptions);
  }

  async sendWelcome() {
    await this.send('welcome', 'Welcome to the Natours Family!');
  }

  async sendPasswordReset() {
    await this.send(
      'password-reset',
      'Your password reset token (valid for 10 minutes)',
    );
  }
}
