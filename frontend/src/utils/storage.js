import { STORAGE_KEYS } from './constants';

export const setItem = (key, value) => {
  try {
    const serializedValue = JSON.stringify(value);
    localStorage.setItem(key, serializedValue);
    return true;
  } catch (error) {
    console.error('Error saving to localStorage:', error);
    return false;
  }
};

export const getItem = (key, defaultValue = null) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error('Error reading from localStorage:', error);
    return defaultValue;
  }
};

export const removeItem = (key) => {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error('Error removing from localStorage:', error);
    return false;
  }
};

export const clearStorage = () => {
  try {
    localStorage.clear();
    return true;
  } catch (error) {
    console.error('Error clearing localStorage:', error);
    return false;
  }
};

export const setAuthToken = (token) => {
  return setItem(STORAGE_KEYS.AUTH_TOKEN, token);
};

export const getAuthToken = () => {
  return getItem(STORAGE_KEYS.AUTH_TOKEN);
};

export const removeAuthToken = () => {
  return removeItem(STORAGE_KEYS.AUTH_TOKEN);
};

export const setRefreshToken = (token) => {
  return setItem(STORAGE_KEYS.REFRESH_TOKEN, token);
};

export const getRefreshToken = () => {
  return getItem(STORAGE_KEYS.REFRESH_TOKEN);
};

export const removeRefreshToken = () => {
  return removeItem(STORAGE_KEYS.REFRESH_TOKEN);
};

export const setUserData = (userData) => {
  return setItem(STORAGE_KEYS.USER_DATA, userData);
};

export const getUserData = () => {
  return getItem(STORAGE_KEYS.USER_DATA);
};

export const removeUserData = () => {
  return removeItem(STORAGE_KEYS.USER_DATA);
};

export const setTheme = (theme) => {
  return setItem(STORAGE_KEYS.THEME, theme);
};

export const getTheme = () => {
  return getItem(STORAGE_KEYS.THEME, 'light');
};

export const isStorageAvailable = () => {
  try {
    const test = '__storage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch (error) {
    return false;
  }
};

export const getStorageSize = () => {
  let total = 0;
  
  for (const key in localStorage) {
    if (localStorage.hasOwnProperty(key)) {
      total += localStorage[key].length + key.length;
    }
  }
  
  return total;
};

export const clearAuthData = () => {
  removeAuthToken();
  removeRefreshToken();
  removeUserData();
};