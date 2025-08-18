import { del, get, post, put } from './api';

export const getAllDonors = async (params = {}) => {
  try {
    const queryString = new URLSearchParams(params).toString();
    const response = await get(`/donors?${queryString}`);
    return response;
  } catch (error) {
    throw error;
  }
};

export const getDonorById = async (id) => {
  try {
    const response = await get(`/donors/${id}`);
    return response;
  } catch (error) {
    throw error;
  }
};

export const updateDonor = async (id, donorData) => {
  try {
    const response = await put(`/donors/${id}`, donorData);
    return response;
  } catch (error) {
    throw error;
  }
};

export const checkEligibility = async (id) => {
  try {
    const response = await post(`/donors/${id}/check-eligibility`);
    return response;
  } catch (error) {
    throw error;
  }
};

export const getDonorHistory = async (id, params = {}) => {
  try {
    const queryString = new URLSearchParams(params).toString();
    const response = await get(`/donors/${id}/history?${queryString}`);
    return response;
  } catch (error) {
    throw error;
  }
};

export const getEligibleDonors = async (params = {}) => {
  try {
    const queryString = new URLSearchParams(params).toString();
    const response = await get(`/donors/eligible/blood-type?${queryString}`);
    return response;
  } catch (error) {
    throw error;
  }
};

export const registerForCampaign = async (campaignData) => {
  try {
    const response = await post('/donors/register-campaign', campaignData);
    return response;
  } catch (error) {
    throw error;
  }
};

export const getDonorCampaigns = async (id, params = {}) => {
  try {
    const queryString = new URLSearchParams(params).toString();
    const response = await get(`/donors/${id}/campaigns?${queryString}`);
    return response;
  } catch (error) {
    throw error;
  }
};

export const sendBulkNotification = async (notificationData) => {
  try {
    const response = await post('/donors/bulk-notification', notificationData);
    return response;
  } catch (error) {
    throw error;
  }
};

export const getDonorStats = async (id) => {
  try {
    const response = await get(`/donors/${id}/stats`);
    return response;
  } catch (error) {
    throw error;
  }
};

export const deleteDonor = async (id) => {
  try {
    const response = await del(`/donors/${id}`);
    return response;
  } catch (error) {
    throw error;
  }
};