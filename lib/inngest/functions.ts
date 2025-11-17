import { inngest } from './client';
import { PERSONALIZED_WELCOME_EMAIL_PROMPT } from './prompts';
import { sendWelcomeEmail } from '../nodemailer';

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
        'Welcome to Seedling Prime! \nullWe are thrilled to have you on board as you embark on your investment journey with us.\nTrack the market, manage your portfolio, and achieve your financial goals.';

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
          error: error instanceof Error ? error.message : String(error),
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
