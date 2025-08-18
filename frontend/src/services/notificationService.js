import { del, get, patch, post } from './api';

export const getUserNotifications = async (params = {}) => {
  try {
    const queryString = new URLSearchParams(params).toString();
    const response = await get(`/notifications?${queryString}`);
    return response;
  } catch (error) {
    throw error;
  }
};

export const createNotification = async (notificationData) => {
  try {
    const response = await post('/notifications', notificationData);
    return response;
  } catch (error) {
    throw error;
  }
};

export const markAsRead = async (id) => {
  try {
    const response = await patch(`/notifications/${id}/read`);
    return response;
  } catch (error) {
    throw error;
  }
};

export const markAllAsRead = async () => {
  try {
    const response = await patch('/notifications/mark-all-read');
    return response;
  } catch (error) {
    throw error;
  }
};

export const sendSMS = async (smsData) => {
  try {
    const response = await post('/notifications/sms', smsData);
    return response;
  } catch (error) {
    throw error;
  }
};

export const sendEmail = async (emailData) => {
  try {
    const response = await post('/notifications/email', emailData);
    return response;
  } catch (error) {
    throw error;
  }
};

export const sendBulkNotification = async (bulkData) => {
  try {
    const response = await post('/notifications/bulk', bulkData);
    return response;
  } catch (error) {
    throw error;
  }
};

export const getNotificationStats = async (params = {}) => {
  try {
    const queryString = new URLSearchParams(params).toString();
    const response = await get(`/notifications/stats?${queryString}`);
    return response;
  } catch (error) {
    throw error;
  }
};

export const getNotificationById = async (id) => {
  try {
    const response = await get(`/notifications/${id}`);
    return response;
  } catch (error) {
    throw error;
  }
};

export const deleteNotification = async (id) => {
  try {
    const response = await del(`/notifications/${id}`);
    return response;
  } catch (error) {
    throw error;
  }
};

export const getUnreadCount = async () => {
  try {
    const response = await get('/notifications/count/unread');
    return response;
  } catch (error) {
    throw error;
  }
};

export const testNotification = async (testData) => {
  try {
    const response = await post('/notifications/test', testData);
    return response;
  } catch (error) {
    throw error;
  }
};