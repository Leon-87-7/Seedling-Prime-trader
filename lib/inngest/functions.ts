import { inngest } from './client';
import {
  NEWS_SUMMARY_EMAIL_PROMPT,
  PERSONALIZED_WELCOME_EMAIL_PROMPT,
} from './prompts';
import {
  sendWelcomeEmail,
  sendNewsSummaryEmail,
  sendPriceAlertEmail,
  sendVolumeAlertEmail,
} from '../nodemailer';
import { getAllUsersForNewsEmail } from '../actions/user.actions';
import { getWatchlistSymbolsByEmail } from '../actions/watchlist.actions';
import {
  getActiveAlerts,
  markAlertAsTriggered,
} from '../actions/alert.actions';
import {
  getNews,
  getBatchStockQuotes,
  type StockQuoteData,
} from '../actions/finnhub.actions';
import { formatDateToday, formatPrice } from '../utils';
import { connectToDatabase } from '@/database/mongoose';

interface UserForNewsEmail {
  email: string;
  name?: string;
  // add other fields here if your actions return more user metadata
}

export const sendSignUpEmail = inngest.createFunction(
  { id: 'sign-up-email' },
  { event: 'app/user.created' },
  async ({ event, step }) => {
    const userProfile = `
      -country: ${event.data.country}
      -investment goals: ${event.data.investmentGoals}
      -risk tolerance: ${event.data.riskTolerance}
      -preferred industry: ${event.data.preferredIndustry}
      `;

    const prompt = PERSONALIZED_WELCOME_EMAIL_PROMPT.replace(
      '{{userProfile}}',
      userProfile
    );

    const response = await step.ai.infer('generate-welcome-email', {
      model: step.ai.models.gemini({
        model: 'gemini-2.5-flash-lite',
      }),
      body: {
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
      },
    });

    await step.run('send-welcome-email', async () => {
      const part = response.candidates?.[0]?.content?.parts?.[0];
      const introText =
        (part && 'text' in part ? part.text : null) ||
        'Thanks for joining SeedlingPrime! \nWe are thrilled to have you on board as you embark on your investment journey with us.\nTrack the market, manage your portfolio, and achieve your financial goals.';

      const {
        data: { email, name },
      } = event;

      try {
        const result = await sendWelcomeEmail({
          email,
          name,
          intro: introText,
        });

        console.log('Welcome email sent via Inngest', {
          eventId: event.id,
          userEmail: email,
          userName: name,
          messageId: result.messageId,
          timestamp: new Date().toISOString(),
        });

        return result;
      } catch (error) {
        console.error('Failed to send welcome email via Inngest', {
          eventId: event.id,
          eventName: event.name,
          userEmail: email,
          userName: name,
          error:
            error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined,
          timestamp: new Date().toISOString(),
        });

        // TODO: Optionally notify support/fallback system here
        // Example: await notifySupport({ email, error, eventId: event.id });

        // Rethrow to allow Inngest to perform its retry logic
        throw error;
      }
    });

    return {
      success: true,
      message: 'Welcome email sent successfully',
    };
  }
);

/**
 * Scheduled function to send daily news summaries
 *
 * This function can be triggered in two ways:
 * 1. Event-based: When 'app/send.daily.news' event is sent
 * 2. Time-based: Automatically runs on a cron schedule
 *
 * Cron Schedule Syntax: minute hour day-of-month month day-of-week
 * - minute (0-59): Which minute of the hour
 * - hour (0-23): Which hour of the day (0 = midnight, 12 = noon)
 * - day-of-month (1-31): Which day of the month (* = every day)
 * - month (1-12): Which month (* = every month)
 * - day-of-week (0-7): Which day of week (0 or 7 = Sunday, * = every day)
 *
 * Current schedule: '0 12 * * *'
 * - Runs at minute 0 (start of the hour)
 * - At hour 12 (noon)
 * - Every day of the month (*)
 * - Every month (*)
 * - Every day of the week (*)
 * Result: Executes daily at 12:00 PM (noon)
 *
 * Examples of other cron schedules:
 * - '0 9 * * 1-5' = Weekdays at 9:00 AM
 * - '30 18 * * *' = Every day at 6:30 PM
 * - '0 0 1 * *' = First day of every month at midnight
 * - '0 * / 4 * * *' = Every 4 hours
 */
export const sendDailyNewsSummary = inngest.createFunction(
  { id: 'daily-news-summary' },
  [{ event: 'app/send.daily.news' }, { cron: '0 12 * * *' }],
  async ({ step }) => {
    // Step #1: Get all users for news delivery
    const users = await step.run(
      'get-all-users',
      getAllUsersForNewsEmail
    );

    if (!users || users.length === 0)
      return {
        success: false,
        message: 'No users found for news email',
      };

    // Step #2: For each user, get watchlist symbols -> fetch news (fallback to general)
    const results = await step.run('fetch-user-news', async () => {
      const perUser: Array<{
        user: UserForNewsEmail;
        articles: MarketNewsArticle[];
      }> = [];
      for (const user of users as UserForNewsEmail[]) {
        try {
          const symbols = await getWatchlistSymbolsByEmail(
            user.email
          );
          let articles = await getNews(symbols);
          // Enforce max 6 articles per user
          articles = (articles || []).slice(0, 6);
          // If still empty, fallback to general
          if (!articles || articles.length === 0) {
            articles = await getNews();
            articles = (articles || []).slice(0, 6);
          }
          perUser.push({ user, articles });
        } catch (e) {
          console.error(
            'daily-news: error preparing user news',
            user.email,
            e
          );
          perUser.push({ user, articles: [] });
        }
      }
      return perUser;
    });

    // Step #3: (placeholder) Summarize news via AI
    const userNewsSummaries: {
      user: UserForNewsEmail;
      newsContent: string | null;
    }[] = [];

    for (const { user, articles } of results) {
      try {
        const prompt = NEWS_SUMMARY_EMAIL_PROMPT.replace(
          '{{newsData}}',
          JSON.stringify(articles, null, 2)
        );

        const response = await step.ai.infer(
          `summarize-news-${user.email}`,
          {
            model: step.ai.models.gemini({
              model: 'gemini-2.5-flash-lite',
            }),
            body: {
              contents: [{ role: 'user', parts: [{ text: prompt }] }],
            },
          }
        );

        const part = response.candidates?.[0]?.content?.parts?.[0];
        const newsContent =
          (part && 'text' in part ? part.text : null) ||
          'No market news.';

        userNewsSummaries.push({ user, newsContent });
      } catch (e) {
        console.error('Failed to summarize news for : ', user.email);
        userNewsSummaries.push({ user, newsContent: null });
      }
    }

    // Step #4: Send the emails
    await step.run('send-news-emails', async () => {
      await Promise.all(
        userNewsSummaries.map(async ({ user, newsContent }) => {
          if (!newsContent) return false;

          return await sendNewsSummaryEmail({
            email: user.email,
            date: formatDateToday(),
            newsContent,
          });
        })
      );
    });

    return {
      success: true,
      message: 'Daily news summary emails sent successfully',
    };
  }
);

export const checkStockAlerts = inngest.createFunction(
  { id: 'check-stock-alerts' },
  [
    { event: 'app/check.stock.alerts' },
    { cron: '0,15,30,45 9-16 * * 1-5' }, // Every 15 min during market hours
  ],
  async ({ step }) => {
    // Step #1: Get all active, non-triggered alerts
    const alerts = await step.run('get-active-alerts', async () => {
      return await getActiveAlerts();
    });

    if (!alerts || alerts.length === 0) {
      return {
        success: true,
        message: 'No active alerts to check',
        alertsChecked: 0,
        alertsTriggered: 0,
      };
    }

    // Step #2: Group alerts by symbol for efficient API calls
    const symbolsToCheck = [
      ...new Set(alerts.map((alert) => alert.symbol)),
    ];

    // Step #3: Fetch current stock data for all symbols
    const stockDataMap = await step.run(
      'fetch-stock-data',
      async (): Promise<Map<string, StockQuoteData>> => {
        return await getBatchStockQuotes(symbolsToCheck);
      }
    ) as Map<string, StockQuoteData>;

    // Step #4: Check each alert and trigger if conditions are met
    const triggeredAlerts: Array<{
      alertId: string;
      userId: string;
      symbol: string;
      company: string;
      alertType: string;
      currentPrice: number;
      targetPrice?: number;
    }> = [];

    for (const alert of alerts) {
      const stockData = stockDataMap.get(alert.symbol);
      if (!stockData) {
        console.warn(
          `No stock data found for ${alert.symbol}, skipping alert check`
        );
        continue;
      }

      let shouldTrigger = false;

      // Check alert conditions
      if (alert.alertType === 'price_upper') {
        shouldTrigger =
          stockData.currentPrice >= (alert.targetPrice || Infinity);
      } else if (alert.alertType === 'price_lower') {
        shouldTrigger =
          stockData.currentPrice <= (alert.targetPrice || 0);
      } else if (alert.alertType === 'volume') {
        // Volume alerts are not supported yet because Finnhub quote endpoint
        // doesn't provide volume data. Skip volume alerts for now.
        console.warn(
          `Volume alert for ${alert.symbol} skipped - volume data not available from Finnhub quote endpoint`
        );
        continue;
      }

      if (shouldTrigger) {
        triggeredAlerts.push({
          alertId: alert.id,
          userId: alert.userId,
          symbol: alert.symbol,
          company: alert.company,
          alertType: alert.alertType,
          currentPrice: stockData.currentPrice,
          targetPrice: alert.targetPrice,
        });
      }
    }

    if (triggeredAlerts.length === 0) {
      return {
        success: true,
        message: 'Stock alerts checked; no alerts triggered',
        alertsChecked: alerts.length,
        alertsTriggered: 0,
        emailResults: [],
      };
    }

    // Step #5: Send email notifications for triggered alerts
    const emailResults = await step.run(
      'send-alert-emails',
      async () => {
        const mongoose = await connectToDatabase();
        const db = mongoose.connection.db;

        if (!db) {
          throw new Error('Database connection not established');
        }

        const results = [];

        for (const alert of triggeredAlerts) {
          try {
            // Get user email from database
            const user = await db.collection('user').findOne<{
              id: string;
              email?: string;
              name?: string;
            }>({ id: alert.userId });

            if (!user || !user.email) {
              console.error(
                `User not found or no email for userId: ${alert.userId}`
              );
              continue;
            }

            const timestamp = new Date().toLocaleString('en-US', {
              timeZone: 'America/New_York',
              dateStyle: 'medium',
              timeStyle: 'short',
            });

            // Send appropriate email based on alert type
            // Note: Volume alerts are currently disabled because Finnhub quote endpoint
            // doesn't provide volume data, so only price alerts will be sent
            if (
              alert.alertType === 'price_upper' ||
              alert.alertType === 'price_lower'
            ) {
              await sendPriceAlertEmail({
                email: user.email,
                name: user.name || 'Investor',
                symbol: alert.symbol,
                company: alert.company,
                currentPrice: formatPrice(alert.currentPrice),
                targetPrice: formatPrice(alert.targetPrice || 0),
                alertType:
                  alert.alertType === 'price_upper'
                    ? 'upper'
                    : 'lower',
                timestamp,
              });
            }

            // Mark alert as triggered
            await markAlertAsTriggered(alert.alertId);

            results.push({
              success: true,
              alertId: alert.alertId,
              symbol: alert.symbol,
            });
          } catch (error) {
            console.error(
              `Failed to process alert ${alert.alertId}:`,
              error
            );
            results.push({
              success: false,
              alertId: alert.alertId,
              symbol: alert.symbol,
              error:
                error instanceof Error
                  ? error.message
                  : String(error),
            });
          }
        }

        return results;
      }
    );

    return {
      success: true,
      message: 'Stock alerts checked and processed',
      alertsChecked: alerts.length,
      alertsTriggered: triggeredAlerts.length,
      emailResults,
    };
  }
);
