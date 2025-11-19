import nodemailer from 'nodemailer';
import {
  NEWS_SUMMARY_EMAIL_TEMPLATE,
  WELCOME_EMAIL_TEMPLATE,
} from './templates';

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

  try {
    const info = await transporter.sendMail(mailOptions);

    console.log('Welcome email sent successfully', {
      messageId: info.messageId,
      to: email,
      accepted: info.accepted,
      rejected: info.rejected,
      response: info.response,
    });

    return {
      success: true,
      messageId: info.messageId,
      recipient: email,
    };
  } catch (error) {
    console.error('Failed to send welcome email', {
      recipient: email,
      recipientName: name,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      mailbox: email,
      timestamp: new Date().toISOString(),
    });

    // Rethrow to allow caller to handle the error
    throw new Error(
      `Failed to send welcome email to ${email}: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
};

export const sendNewsSummaryEmail = async ({
  email,
  date,
  newsContent,
}: {
  email: string;
  date: string;
  newsContent: string;
}): Promise<void> => {
  const htmlTemplate = NEWS_SUMMARY_EMAIL_TEMPLATE.replace(
    '{{date}}',
    date
  ).replace('{{newsContent}}', newsContent);

  const mailOptions = {
    from: `"SeedlingPrime News" <${process.env.NODEMAILER_EMAIL}>`,
    to: email,
    subject: `Market News Summary Today - ${date}`,
    text: `Today's market news summary from SeedlingPrime`,
    html: htmlTemplate,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('News summary email sent', {
      messageId: info.messageId,
      to: email,
      accepted: info.accepted,
      rejected: info.rejected,
      response: info.response,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Failed to send news summary email', {
      recipient: email,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString(),
    });
    throw error;
  }
};
