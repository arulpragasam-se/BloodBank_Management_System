import { useCallback, useState } from 'react';
import { useAuth } from './useAuth';

export const useApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { logout } = useAuth();

  const execute = useCallback(async (apiCall, options = {}) => {
    const { 
      showLoading = true, 
      showError = true,
      onSuccess,
      onError 
    } = options;

    try {
      if (showLoading) setLoading(true);
      setError(null);

      const response = await apiCall();
      
      if (onSuccess) {
        onSuccess(response);
      }
      
      return response;
    } catch (err) {
      const errorMessage = err.message || 'An error occurred';
      
      if (err.status === 401) {
        logout();
        return;
      }
      
      if (showError) {
        setError(errorMessage);
      }
      
      if (onError) {
        onError(err);
      }
      
      throw err;
    } finally {
      if (showLoading) setLoading(false);
    }
  }, [logout]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    loading,
    error,
    execute,
    clearError,
  };
};

export default useApi;