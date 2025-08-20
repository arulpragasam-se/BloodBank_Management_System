import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import { authService } from '../../services/authService';
import Toast from '../common/Toast';
import FormContainer from '../forms/FormContainer';
import Input from '../forms/Input';

const ChangePassword = ({ onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  const handleChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const validatePasswords = () => {
    if (!formData.currentPassword) {
      setError('Current password is required');
      return false;
    }
    
    if (!formData.newPassword) {
      setError('New password is required');
      return false;
    }
    
    if (formData.newPassword.length < 8) {
      setError('New password must be at least 8 characters long');
      return false;
    }
    
    if (formData.newPassword !== formData.confirmPassword) {
      setError('New passwords do not match');
      return false;
    }
    
    if (formData.currentPassword === formData.newPassword) {
      setError('New password must be different from current password');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validatePasswords()) return;
    
    try {
      setLoading(true);
      setError('');
      
      const response = await authService.changePassword(
        formData.currentPassword,
        formData.newPassword
      );

      if (response.success) {
        setSuccess('Password changed successfully');
        setFormData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        setTimeout(() => {
          onSuccess && onSuccess();
        }, 2000);
      }
    } catch (err) {
      setError(err.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const getPasswordStrength = (password) => {
    if (!password) return { strength: 0, label: '', color: '' };
    
    let strength = 0;
    const checks = {
      length: password.length >= 8,
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      numbers: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };
    
    strength = Object.values(checks).filter(Boolean).length;
    
    if (strength <= 2) return { strength, label: 'Weak', color: 'text-red-600' };
    if (strength <= 3) return { strength, label: 'Fair', color: 'text-yellow-600' };
    if (strength <= 4) return { strength, label: 'Good', color: 'text-blue-600' };
    return { strength, label: 'Strong', color: 'text-green-600' };
  };

  const passwordStrength = getPasswordStrength(formData.newPassword);

  return (
    <FormContainer onSubmit={handleSubmit}>
      {error && <Toast type="error" message={error} onClose={() => setError('')} />}
      {success && <Toast type="success" message={success} onClose={() => setSuccess('')} />}
      
      <div className="space-y-6">
        <div className="relative">
          <Input
            label="Current Password"
            name="currentPassword"
            type={showPasswords.current ? 'text' : 'password'}
            value={formData.currentPassword}
            onChange={handleChange}
            required
            placeholder="Enter your current password"
          />
          <button
            type="button"
            onClick={() => togglePasswordVisibility('current')}
            className="absolute right-3 top-9 text-gray-400 hover:text-gray-600"
          >
            {showPasswords.current ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>

        <div className="relative">
          <Input
            label="New Password"
            name="newPassword"
            type={showPasswords.new ? 'text' : 'password'}
            value={formData.newPassword}
            onChange={handleChange}
            required
            placeholder="Enter your new password"
          />
          <button
            type="button"
            onClick={() => togglePasswordVisibility('new')}
            className="absolute right-3 top-9 text-gray-400 hover:text-gray-600"
          >
            {showPasswords.new ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
          
          {formData.newPassword && (
            <div className="mt-2">
              <div className="flex items-center justify-between text-sm">
                <span>Password strength:</span>
                <span className={`font-medium ${passwordStrength.color}`}>
                  {passwordStrength.label}
                </span>
              </div>
              <div className="mt-1 w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-300 ${
                    passwordStrength.strength <= 2 ? 'bg-red-500' :
                    passwordStrength.strength <= 3 ? 'bg-yellow-500' :
                    passwordStrength.strength <= 4 ? 'bg-blue-500' : 'bg-green-500'
                  }`}
                  style={{ width: `${(passwordStrength.strength / 5) * 100}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>

        <div className="relative">
          <Input
            label="Confirm New Password"
            name="confirmPassword"
            type={showPasswords.confirm ? 'text' : 'password'}
            value={formData.confirmPassword}
            onChange={handleChange}
            required
            placeholder="Confirm your new password"
          />
          <button
            type="button"
            onClick={() => togglePasswordVisibility('confirm')}
            className="absolute right-3 top-9 text-gray-400 hover:text-gray-600"
          >
            {showPasswords.confirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
          
          {formData.confirmPassword && formData.newPassword && (
            <div className="mt-1 text-sm">
              {formData.newPassword === formData.confirmPassword ? (
                <span className="text-green-600">✓ Passwords match</span>
              ) : (
                <span className="text-red-600">✗ Passwords do not match</span>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h4 className="font-medium text-blue-900 mb-2">Password Requirements:</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li className={formData.newPassword.length >= 8 ? 'text-green-600' : ''}>
            • At least 8 characters long
          </li>
          <li className={/[a-z]/.test(formData.newPassword) ? 'text-green-600' : ''}>
            • Contains lowercase letters
          </li>
          <li className={/[A-Z]/.test(formData.newPassword) ? 'text-green-600' : ''}>
            • Contains uppercase letters
          </li>
          <li className={/\d/.test(formData.newPassword) ? 'text-green-600' : ''}>
            • Contains numbers
          </li>
          <li className={/[!@#$%^&*(),.?":{}|<>]/.test(formData.newPassword) ? 'text-green-600' : ''}>
            • Contains special characters
          </li>
        </ul>
      </div>

      <div className="flex justify-end space-x-4 mt-6">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Changing...' : 'Change Password'}
        </button>
      </div>
    </FormContainer>
  );
};

export default ChangePassword;