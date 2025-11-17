'use server';

import { headers } from 'next/headers';
import { getAuth } from '../better-auth/auth';
import { inngest } from '../inngest/client';

const auth = await getAuth();
export const signUpWithEmail = async ({
  email,
  password,
  fullName,
  country,
  investmentGoals,
  riskTolerance,
  preferredIndustry,
}: SignUpFormData) => {
  try {
    const response = await auth.api.signUpEmail({
      body: {
        email,
        password,
        name: fullName,
      },
    });
    if (response) {
      try {
        await inngest.send({
          name: 'app/user.created',
          data: {
            email,
            name: fullName,
            country,
            investmentGoals,
            riskTolerance,
            preferredIndustry,
          },
        });
      } catch (inngestError) {
        console.error(
          'Failed to send welcome email event',
          inngestError
        );
      }
    }
    return { success: true, data: response };
  } catch (error) {
    console.error('Sign up failed', error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Sign up failed',
    };
  }
};

export const signInWithEmail = async ({
  email,
  password,
}: SignInFormData) => {
  try {
    const response = await auth.api.signInEmail({
      body: {
        email,
        password,
      },
    });

    return { success: true, data: response };
  } catch (error) {
    console.error('Sign in failed', error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Sign in failed',
    };
  }
};

export const signOut = async () => {
  try {
    await auth.api.signOut({ headers: await headers() });
    return { success: true };
  } catch (error) {
    console.error('Sign out failed', error);
    return { success: false, error: 'Sign out failed' };
  }
};
