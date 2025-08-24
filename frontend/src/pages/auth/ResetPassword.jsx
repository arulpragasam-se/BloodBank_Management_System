import { Link } from 'react-router-dom';
import ResetPasswordForm from '../../components/auth/ResetPasswordForm';
import AuthLayout from '../../layouts/AuthLayout';

const ResetPassword = () => {
  return (
    <AuthLayout>
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Set new password
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Or{' '}
              <Link
                to="/login"
                className="font-medium text-red-600 hover:text-red-500"
              >
                back to sign in
              </Link>
            </p>
          </div>
          <ResetPasswordForm />
        </div>
      </div>
    </AuthLayout>
  );
};

export default ResetPassword;