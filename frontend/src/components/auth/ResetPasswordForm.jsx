import { CheckCircleIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from '../../hooks/useForm';
import { useNotification } from '../../hooks/useNotifications';
import { resetPassword } from '../../services/authService';

const ResetPasswordForm = () => {
  const [searchParams] = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const { showError, showSuccess } = useNotification();
  const navigate = useNavigate();

  const token = searchParams.get('token');

  const {
    values,
    errors,
    handleChange,
    handleSubmit,
    isSubmitting,
    setFieldError,
  } = useForm({
    initialValues: {
      password: '',
      confirmPassword: '',
    },
    validationRules: {
      password: {
        required: true,
        type: 'password',
      },
      confirmPassword: {
        required: true,
        minLength: 6,
      },
    },
    onSubmit: async (formData) => {
      if (formData.password !== formData.confirmPassword) {
        setFieldError('confirmPassword', 'Passwords do not match');
        throw new Error('Passwords do not match');
      }

      if (!token) {
        showError('Invalid reset token. Please request a new password reset.');
        throw new Error('Invalid reset token');
      }

      try {
        const response = await resetPassword(token, formData.password);
        
        if (response.success) {
          setResetSuccess(true);
          showSuccess('Password reset successful! You can now sign in with your new password.');
        }
      } catch (error) {
        showError(error.message || 'Failed to reset password. Please try again.');
        throw error;
      }
    },
  });

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
            </div>
            
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              Invalid Reset Link
            </h2>
            
            <p className="mt-2 text-sm text-gray-600">
              This password reset link is invalid or has expired.
              Please request a new password reset.
            </p>
            
            <div className="mt-6 space-y-4">
              <Link
                to="/forgot-password"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Request new reset link
              </Link>
              
              <Link
                to="/login"
                className="text-sm text-red-600 hover:text-red-500"
              >
                Back to sign in
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (resetSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircleIcon className="w-8 h-8 text-green-600" />
              </div>
            </div>
            
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              Password Reset Successful
            </h2>
            
            <p className="mt-2 text-sm text-gray-600">
              Your password has been successfully reset. You can now sign in with your new password.
            </p>
            
            <div className="mt-6">
              <button
                onClick={() => navigate('/login')}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Sign in to your account
              </button>
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
            Reset your password
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Enter your new password below
          </p>
        </div>

        {/* Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* New Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                New Password
              </label>
              <div className="mt-1 relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={values.password}
                  onChange={handleChange}
                  className={`block w-full px-3 py-2 pr-10 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-red-500 focus:border-red-500 ${
                    errors.password ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Enter your new password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirm New Password
              </label>
              <div className="mt-1 relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={values.confirmPassword}
                  onChange={handleChange}
                  className={`block w-full px-3 py-2 pr-10 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-red-500 focus:border-red-500 ${
                    errors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Confirm your new password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
              )}
            </div>
          </div>

          {/* Password requirements */}
          <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Password requirements:</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li className="flex items-center">
                <span className="w-1 h-1 bg-gray-400 rounded-full mr-2" />
                At least 6 characters long
              </li>
              <li className="flex items-center">
                <span className="w-1 h-1 bg-gray-400 rounded-full mr-2" />
                Contains uppercase and lowercase letters
              </li>
              <li className="flex items-center">
                <span className="w-1 h-1 bg-gray-400 rounded-full mr-2" />
                Contains at least one number
              </li>
            </ul>
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
                  Resetting password...
                </div>
              ) : (
                'Reset password'
              )}
            </button>
          </div>

          <div className="text-center">
            <Link
              to="/login"
              className="text-sm text-red-600 hover:text-red-500"
            >
              Back to sign in
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResetPasswordForm;