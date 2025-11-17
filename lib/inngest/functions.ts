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
        'Welcome to Seedling Prime! We are thrilled to have you on board as you embark on your investment journey with us. track the market, manage your portfolio, and achieve your financial goals.';

      const {
        data: { email, name },
      } = event;
      return await sendWelcomeEmail({
        email,
        name,
        intro: introText,
      });
    });

    return {
      success: true,
      message: 'Welcome email sent successfully',
    };
  }
);
