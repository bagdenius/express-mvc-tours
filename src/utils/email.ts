import { createTransport, type SendMailOptions } from 'nodemailer';

export async function sendEmail(options: {
  email: string;
  subject: string;
  message: string;
}) {
  const transporter = createTransport({
    host: process.env.EMAIL_HOST,
    port: +process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  const mailOptions: SendMailOptions = {
    from: 'bagdenius <bagdenius@gmail.com>',
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  await transporter.sendMail(mailOptions);
}
