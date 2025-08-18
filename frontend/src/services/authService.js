import { clearAuthData, setAuthToken, setRefreshToken, setUserData } from '../utils/storage';
import { get, post, put } from './api';

export const login = async (credentials) => {
  try {
    const response = await post('/auth/login', credentials);
    
    if (response.success) {
      const { user, tokens } = response.data;
      setAuthToken(tokens.accessToken);
      setRefreshToken(tokens.refreshToken);
      setUserData(user);
    }
    
    return response;
  } catch (error) {
    throw error;
  }
};

export const register = async (userData) => {
  try {
    const response = await post('/auth/register', userData);
    
    if (response.success) {
      const { user, tokens } = response.data;
      setAuthToken(tokens.accessToken);
      setRefreshToken(tokens.refreshToken);
      setUserData(user);
    }
    
    return response;
  } catch (error) {
    throw error;
  }
};

export const logout = async () => {
  try {
    await post('/auth/logout');
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    clearAuthData();
  }
};

export const forgotPassword = async (email) => {
  try {
    const response = await post('/auth/forgot-password', { email });
    return response;
  } catch (error) {
    throw error;
  }
};

export const resetPassword = async (token, newPassword) => {
  try {
    const response = await post('/auth/reset-password', { token, newPassword });
    return response;
  } catch (error) {
    throw error;
  }
};

export const changePassword = async (currentPassword, newPassword) => {
  try {
    const response = await post('/auth/change-password', {
      currentPassword,
      newPassword,
    });
    return response;
  } catch (error) {
    throw error;
  }
};

export const getProfile = async () => {
  try {
    const response = await get('/auth/profile');
    return response;
  } catch (error) {
    throw error;
  }
};

export const updateProfile = async (profileData) => {
  try {
    const response = await put('/auth/profile', profileData);
    
    if (response.success) {
      setUserData(response.data.user);
    }
    
    return response;
  } catch (error) {
    throw error;
  }
};