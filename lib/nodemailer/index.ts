import nodemailer from 'nodemailer';
import {
  NEWS_SUMMARY_EMAIL_TEMPLATE,
  WELCOME_EMAIL_TEMPLATE,
  STOCK_ALERT_UPPER_EMAIL_TEMPLATE,
  STOCK_ALERT_LOWER_EMAIL_TEMPLATE,
  VOLUME_ALERT_EMAIL_TEMPLATE,
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

export const sendPriceAlertEmail = async ({
  email,
  name,
  symbol,
  company,
  currentPrice,
  targetPrice,
  alertType,
  timestamp,
}: {
  email: string;
  name: string;
  symbol: string;
  company: string;
  currentPrice: string;
  targetPrice: string;
  alertType: 'upper' | 'lower';
  timestamp: string;
}) => {
  const template =
    alertType === 'upper'
      ? STOCK_ALERT_UPPER_EMAIL_TEMPLATE
      : STOCK_ALERT_LOWER_EMAIL_TEMPLATE;

  const htmlTemplate = template
    .replace(/\{\{symbol\}\}/g, symbol)
    .replace(/\{\{company\}\}/g, company)
    .replace(/\{\{currentPrice\}\}/g, currentPrice)
    .replace(/\{\{targetPrice\}\}/g, targetPrice)
    .replace(/\{\{timestamp\}\}/g, timestamp);

  const mailOptions = {
    from: `"SeedlingPrime Alerts" <${process.env.NODEMAILER_EMAIL}>`,
    to: email,
    subject: `Price Alert: ${symbol} ${alertType === 'upper' ? 'Above' : 'Below'} ${targetPrice}`,
    text: `${symbol} has ${alertType === 'upper' ? 'reached above' : 'dropped below'} your target price of ${targetPrice}. Current price: ${currentPrice}`,
    html: htmlTemplate,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Price alert email sent', {
      messageId: info.messageId,
      to: email,
      symbol,
      alertType,
      accepted: info.accepted,
      rejected: info.rejected,
      response: info.response,
      timestamp: new Date().toISOString(),
    });

    return {
      success: true,
      messageId: info.messageId,
      recipient: email,
    };
  } catch (error) {
    console.error('Failed to send price alert email', {
      recipient: email,
      symbol,
      alertType,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString(),
    });
    throw error;
  }
};

export const sendVolumeAlertEmail = async ({
  email,
  name,
  symbol,
  company,
  currentVolume,
  averageVolume,
  volumeSpike,
  currentPrice,
  changePercent,
  priceColor,
  changeDirection,
  alertMessage,
  timestamp,
}: {
  email: string;
  name: string;
  symbol: string;
  company: string;
  currentVolume: string;
  averageVolume: string;
  volumeSpike: string;
  currentPrice: string;
  changePercent: string;
  priceColor: string;
  changeDirection: string;
  alertMessage: string;
  timestamp: string;
}) => {
  const htmlTemplate = VOLUME_ALERT_EMAIL_TEMPLATE.replace(
    /\{\{symbol\}\}/g,
    symbol
  )
    .replace(/\{\{company\}\}/g, company)
    .replace(/\{\{currentVolume\}\}/g, currentVolume)
    .replace(/\{\{averageVolume\}\}/g, averageVolume)
    .replace(/\{\{volumeSpike\}\}/g, volumeSpike)
    .replace(/\{\{currentPrice\}\}/g, currentPrice)
    .replace(/\{\{changePercent\}\}/g, changePercent)
    .replace(/\{\{priceColor\}\}/g, priceColor)
    .replace(/\{\{changeDirection\}\}/g, changeDirection)
    .replace(/\{\{alertMessage\}\}/g, alertMessage)
    .replace(/\{\{timestamp\}\}/g, timestamp);

  const mailOptions = {
    from: `"SeedlingPrime Alerts" <${process.env.NODEMAILER_EMAIL}>`,
    to: email,
    subject: `Volume Alert: ${symbol} - High Trading Activity`,
    text: `${symbol} is experiencing high trading volume (${currentVolume}M shares vs ${averageVolume}M average). Current price: ${currentPrice}`,
    html: htmlTemplate,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Volume alert email sent', {
      messageId: info.messageId,
      to: email,
      symbol,
      accepted: info.accepted,
      rejected: info.rejected,
      response: info.response,
      timestamp: new Date().toISOString(),
    });

    return {
      success: true,
      messageId: info.messageId,
      recipient: email,
    };
  } catch (error) {
    console.error('Failed to send volume alert email', {
      recipient: email,
      symbol,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString(),
    });
    throw error;
  }
};
