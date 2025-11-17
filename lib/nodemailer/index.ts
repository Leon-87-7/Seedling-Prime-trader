import nodemailer from 'nodemailer';
import { WELCOME_EMAIL_TEMPLATE } from './templates';

export const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.NODEMAILER_EMAIL,
    pass: process.env.NODEMAILER_PASSWORD,
  },
});

export const sendWelcomeEmail = async ({
  email,
  name,
  intro,
}: WelcomeEmailData) => {
  const htmlTemplate = WELCOME_EMAIL_TEMPLATE.replace(
    '{{name}}',
    name
  ).replace('{{intro}}', intro);

  const mailOptions = {
    from: `"SeedlingPrime" <${process.env.NODEMAILER_EMAIL}>`,
    to: email,
    subject:
      'Welcome to SeedlingPrime - the place to grow your stock portfolio!',
    text: `Hello ${name},\n\nThanks for joining SeedlingPrime!`,
    html: htmlTemplate,
  };

  await transporter.sendMail(mailOptions);
};
