import { del, get, patch, post, put } from './api';

export const getAllCampaigns = async (params = {}) => {
  try {
    const queryString = new URLSearchParams(params).toString();
    const response = await get(`/campaigns?${queryString}`);
    return response;
  } catch (error) {
    throw error;
  }
};

export const createCampaign = async (campaignData) => {
  try {
    const response = await post('/campaigns', campaignData);
    return response;
  } catch (error) {
    throw error;
  }
};

export const getCampaignById = async (id) => {
  try {
    const response = await get(`/campaigns/${id}`);
    return response;
  } catch (error) {
    throw error;
  }
};

export const updateCampaign = async (id, campaignData) => {
  try {
    const response = await put(`/campaigns/${id}`, campaignData);
    return response;
  } catch (error) {
    throw error;
  }
};

export const registerDonor = async (campaignId, donorData) => {
  try {
    const response = await post(`/campaigns/${campaignId}/register`, donorData);
    return response;
  } catch (error) {
    throw error;
  }
};

export const updateDonorStatus = async (campaignId, donorId, statusData) => {
  try {
    const response = await put(`/campaigns/${campaignId}/donors/${donorId}`, statusData);
    return response;
  } catch (error) {
    throw error;
  }
};

export const sendCampaignReminders = async (campaignId) => {
  try {
    const response = await post(`/campaigns/${campaignId}/send-reminders`);
    return response;
  } catch (error) {
    throw error;
  }
};

export const getCampaignStats = async (campaignId) => {
  try {
    const response = await get(`/campaigns/${campaignId}/stats`);
    return response;
  } catch (error) {
    throw error;
  }
};

export const getUpcomingCampaigns = async (params = {}) => {
  try {
    const queryString = new URLSearchParams(params).toString();
    const response = await get(`/campaigns/status/upcoming?${queryString}`);
    return response;
  } catch (error) {
    throw error;
  }
};

export const getActiveCampaigns = async (params = {}) => {
  try {
    const queryString = new URLSearchParams(params).toString();
    const response = await get(`/campaigns/status/active?${queryString}`);
    return response;
  } catch (error) {
    throw error;
  }
};

export const getCampaignParticipants = async (campaignId, params = {}) => {
  try {
    const queryString = new URLSearchParams(params).toString();
    const response = await get(`/campaigns/${campaignId}/participants?${queryString}`);
    return response;
  } catch (error) {
    throw error;
  }
};

export const cancelCampaign = async (campaignId, reason) => {
  try {
    const response = await patch(`/campaigns/${campaignId}/cancel`, { reason });
    return response;
  } catch (error) {
    throw error;
  }
};

export const completeCampaign = async (campaignId, results) => {
  try {
    const response = await patch(`/campaigns/${campaignId}/complete`, { results });
    return response;
  } catch (error) {
    throw error;
  }
};

export const deleteCampaign = async (id) => {
  try {
    const response = await del(`/campaigns/${id}`);
    return response;
  } catch (error) {
    throw error;
  }
};