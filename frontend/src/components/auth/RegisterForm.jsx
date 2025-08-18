import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useForm } from '../../hooks/useForm';
import { useNotification } from '../../hooks/useNotifications';
import { register } from '../../services/authService';
import { BLOOD_TYPES, USER_ROLES } from '../../utils/constants';

const RegisterForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { login } = useAuth();
  const { showError, showSuccess } = useNotification();
  const navigate = useNavigate();

  const {
    values,
    errors,
    handleChange,
    handleSubmit,
    isSubmitting,
    setFieldError,
  } = useForm({
    initialValues: {
      name: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
      role: USER_ROLES.DONOR,
      bloodType: '',
      dateOfBirth: '',
      weight: '',
      height: '',
      medicalCondition: '',
      agreeToTerms: false,
    },
    validationRules: {
      name: {
        required: true,
        minLength: 2,
        maxLength: 50,
      },
      email: {
        required: true,
        type: 'email',
      },
      phone: {
        required: true,
        type: 'phone',
      },
      password: {
        required: true,
        type: 'password',
      },
      confirmPassword: {
        required: true,
        minLength: 6,
      },
      role: {
        required: true,
      },
      agreeToTerms: {
        required: true,
      },
    },
    onSubmit: async (formData) => {
      // Validate password confirmation
      if (formData.password !== formData.confirmPassword) {
        setFieldError('confirmPassword', 'Passwords do not match');
        throw new Error('Passwords do not match');
      }

      // Validate role-specific fields
      if (formData.role === USER_ROLES.DONOR) {
        if (!formData.bloodType || !formData.dateOfBirth || !formData.weight || !formData.height) {
          throw new Error('Please fill in all donor information');
        }
      }

      if (formData.role === USER_ROLES.RECIPIENT) {
        if (!formData.bloodType || !formData.dateOfBirth || !formData.medicalCondition) {
          throw new Error('Please fill in all recipient information');
        }
      }

      try {
        const additionalData = {};
        
        if (formData.role === USER_ROLES.DONOR || formData.role === USER_ROLES.RECIPIENT) {
          additionalData.bloodType = formData.bloodType;
          additionalData.dateOfBirth = formData.dateOfBirth;
        }

        if (formData.role === USER_ROLES.DONOR) {
          additionalData.weight = parseFloat(formData.weight);
          additionalData.height = parseFloat(formData.height);
        }

        if (formData.role === USER_ROLES.RECIPIENT) {
          additionalData.medicalCondition = formData.medicalCondition;
        }

        const response = await register({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
          role: formData.role,
          additionalData,
        });

        if (response.success) {
          login(response.data.user);
          showSuccess('Registration successful! Welcome to Blood Bank Management System.');
          navigate('/dashboard');
        }
      } catch (error) {
        showError(error.message || 'Registration failed. Please try again.');
        throw error;
      }
    },
  });

  const isDonor = values.role === USER_ROLES.DONOR;
  const isRecipient = values.role === USER_ROLES.RECIPIENT;
  const needsBloodType = isDonor || isRecipient;

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
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-medium text-red-600 hover:text-red-500"
            >
              Sign in
            </Link>
          </p>
        </div>

        {/* Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Basic Information */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Full Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                value={values.name}
                onChange={handleChange}
                className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-red-500 focus:border-red-500 ${
                  errors.name ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Enter your full name"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
              )}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={values.email}
                onChange={handleChange}
                className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-red-500 focus:border-red-500 ${
                  errors.email ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Enter your email"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                Phone Number
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                required
                value={values.phone}
                onChange={handleChange}
                className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-red-500 focus:border-red-500 ${
                  errors.phone ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="+94 71 234 5678"
              />
              {errors.phone && (
                <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
              )}
            </div>

            {/* Role Selection */}
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                I am a
              </label>
              <select
                id="role"
                name="role"
                value={values.role}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
              >
                <option value={USER_ROLES.DONOR}>Blood Donor</option>
                <option value={USER_ROLES.RECIPIENT}>Blood Recipient</option>
                <option value={USER_ROLES.HOSPITAL_STAFF}>Hospital Staff</option>
              </select>
            </div>

            {/* Role-specific fields */}
            {needsBloodType && (
              <>
                <div>
                  <label htmlFor="bloodType" className="block text-sm font-medium text-gray-700">
                    Blood Type
                  </label>
                  <select
                    id="bloodType"
                    name="bloodType"
                    value={values.bloodType}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                  >
                    <option value="">Select blood type</option>
                    {BLOOD_TYPES.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700">
                    Date of Birth
                  </label>
                  <input
                    id="dateOfBirth"
                    name="dateOfBirth"
                    type="date"
                    value={values.dateOfBirth}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                  />
                </div>
              </>
            )}

            {isDonor && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="weight" className="block text-sm font-medium text-gray-700">
                      Weight (kg)
                    </label>
                    <input
                      id="weight"
                      name="weight"
                      type="number"
                      min="30"
                      max="300"
                      value={values.weight}
                      onChange={handleChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                      placeholder="70"
                    />
                  </div>
                  <div>
                    <label htmlFor="height" className="block text-sm font-medium text-gray-700">
                      Height (cm)
                    </label>
                    <input
                      id="height"
                      name="height"
                      type="number"
                      min="100"
                      max="250"
                      value={values.height}
                      onChange={handleChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                      placeholder="170"
                    />
                  </div>
                </div>
              </>
            )}

            {isRecipient && (
              <div>
                <label htmlFor="medicalCondition" className="block text-sm font-medium text-gray-700">
                  Medical Condition
                </label>
                <textarea
                  id="medicalCondition"
                  name="medicalCondition"
                  rows={3}
                  value={values.medicalCondition}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                  placeholder="Describe your medical condition..."
                />
              </div>
            )}

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
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
                  placeholder="Enter your password"
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

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirm Password
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
                  placeholder="Confirm your password"
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

          {/* Terms and conditions */}
          <div className="flex items-center">
            <input
              id="agreeToTerms"
              name="agreeToTerms"
              type="checkbox"
              checked={values.agreeToTerms}
              onChange={handleChange}
              className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
            />
            <label htmlFor="agreeToTerms" className="ml-2 block text-sm text-gray-900">
              I agree to the{' '}
              <Link to="/terms" className="text-red-600 hover:text-red-500">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link to="/privacy" className="text-red-600 hover:text-red-500">
                Privacy Policy
              </Link>
            </label>
          </div>
          {errors.agreeToTerms && (
            <p className="mt-1 text-sm text-red-600">{errors.agreeToTerms}</p>
          )}

          {/* Submit button */}
          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <div className="flex items-center">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Creating account...
                </div>
              ) : (
                'Create account'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterForm;