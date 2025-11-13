'use client';
import InputFields from '@/components/forms/InputFields';
import { Button } from '@/components/ui/button';
import { useForm } from 'react-hook-form';

function SignUp() {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<SignUpFormData>({
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      country: 'US',
      investmentGoals: 'Growth',
      riskTolerance: 'Medium',
      preferredIndustry: 'Technology',
    },
    mode: 'onBlur',
  });
  const onSubmit = async (data: SignUpFormData) => {
    try {
      console.log(data);
    } catch (e) {
      console.error(e);
    }
  };
  return (
    <>
      <h1 className="form-title">Sign Up & Personalize</h1>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-5"
      >
        {/* Input fields will go here */}
        <InputFields
          name="fullName"
          label="Full Name"
          placeholder="John Doe"
          register={register}
          error={errors.fullName}
          validation={{
            required: 'Full Name is required',
            minLength: 2,
          }}
        />
        <InputFields
          name="email"
          label="Email"
          placeholder="john.doe@example.com"
          register={register}
          error={errors.email}
          validation={{
            required: 'Email is required',
            pattern: {
              value: /^\w+@\w+\.\w+$/,
              message: 'Invalid email address',
            },
          }}
        />
        <InputFields
          name="password"
          label="Password"
          placeholder="Enter a strong password"
          type="password"
          register={register}
          error={errors.password}
          validation={{
            required: 'Password is required',
            minLength: 8,
          }}
        />
        <Button
          type="submit"
          className="yellow-btn w-full mt-5"
          disabled={isSubmitting}
        >
          {isSubmitting
            ? 'Creating Account'
            : 'Sign Up For Your Investment Journey'}
        </Button>
      </form>
    </>
  );
}

export default SignUp;
