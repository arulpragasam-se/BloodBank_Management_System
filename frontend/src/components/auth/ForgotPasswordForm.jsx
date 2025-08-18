import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from '../../hooks/useForm';
import { useNotification } from '../../hooks/useNotifications';
import { forgotPassword } from '../../services/authService';

const ForgotPasswordForm = () => {
  const [emailSent, setEmailSent] = useState(false);
  const { showError, showSuccess } = useNotification();

  const {
    values,
    errors,
    handleChange,
    handleSubmit,
    isSubmitting,
  } = useForm({
    initialValues: {
      email: '',
    },
    validationRules: {
      email: {
        required: true,
        type: 'email',
      },
    },
    onSubmit: async (formData) => {
      try {
        const response = await forgotPassword(formData.email);
        
        if (response.success) {
          setEmailSent(true);
          showSuccess('Password reset instructions sent to your email.');
        }
      } catch (error) {
        showError(error.message || 'Failed to send reset email. Please try again.');
        throw error;
      }
    },
  });

  if (emailSent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
            </div>
            
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              Check your email
            </h2>
            
            <p className="mt-2 text-sm text-gray-600">
              We've sent password reset instructions to{' '}
              <span className="font-medium text-gray-900">{values.email}</span>
            </p>
            
            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-md p-4">
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-2">Didn't receive the email?</p>
                <ul className="list-disc list-inside space-y-1 text-left">
                  <li>Check your spam/junk folder</li>
                  <li>Make sure the email address is correct</li>
                  <li>Wait a few minutes for the email to arrive</li>
                </ul>
              </div>
            </div>
            
            <div className="mt-6 space-y-4">
              <button
                onClick={() => setEmailSent(false)}
                className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Try a different email address
              </button>
              
              <Link
                to="/login"
                className="flex items-center justify-center text-sm text-red-600 hover:text-red-500"
              >
                <ArrowLeftIcon className="h-4 w-4 mr-1" />
                Back to sign in
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div>
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-red-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-2xl">BB</span>
            </div>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Forgot your password?
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Enter your email address and we'll send you instructions to reset your password.
          </p>
        </div>

        {/* Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={values.email}
              onChange={handleChange}
              className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-red-500 focus:border-red-500 ${
               errors.email ? 'border-red-300' : 'border-gray-300'
             }`}
             placeholder="Enter your email address"
           />
           {errors.email && (
             <p className="mt-1 text-sm text-red-600">{errors.email}</p>
           )}
         </div>

         <div>
           <button
             type="submit"
             disabled={isSubmitting}
             className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
           >
             {isSubmitting ? (
               <div className="flex items-center">
                 <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                 Sending...
               </div>
             ) : (
               'Send reset instructions'
             )}
           </button>
         </div>

         <div className="text-center">
           <Link
             to="/login"
             className="flex items-center justify-center text-sm text-red-600 hover:text-red-500"
           >
             <ArrowLeftIcon className="h-4 w-4 mr-1" />
             Back to sign in
           </Link>
         </div>
       </form>
     </div>
   </div>
 );
};

export default ForgotPasswordForm;