import { del, get, post, put } from './api';

export const getAllRecipients = async (params = {}) => {
  try {
    const queryString = new URLSearchParams(params).toString();
    const response = await get(`/recipients?${queryString}`);
    return response;
  } catch (error) {
    throw error;
  }
};

export const getRecipientById = async (id) => {
  try {
    const response = await get(`/recipients/${id}`);
    return response;
  } catch (error) {
    throw error;
  }
};

export const updateRecipient = async (id, recipientData) => {
  try {
    const response = await put(`/recipients/${id}`, recipientData);
    return response;
  } catch (error) {
    throw error;
  }
};

export const getTransfusionHistory = async (id, params = {}) => {
  try {
    const queryString = new URLSearchParams(params).toString();
    const response = await get(`/recipients/${id}/transfusions?${queryString}`);
    return response;
  } catch (error) {
    throw error;
  }
};

export const addTransfusionRecord = async (id, transfusionData) => {
  try {
    const response = await post(`/recipients/${id}/transfusions`, transfusionData);
    return response;
  } catch (error) {
    throw error;
  }
};

export const getCompatibleBloodTypes = async (id) => {
  try {
    const response = await get(`/recipients/${id}/compatible-blood`);
    return response;
  } catch (error) {
    throw error;
  }
};

export const getRecipientRequests = async (id, params = {}) => {
  try {
    const queryString = new URLSearchParams(params).toString();
    const response = await get(`/recipients/${id}/requests?${queryString}`);
    return response;
  } catch (error) {
    throw error;
  }
};

export const getRecipientStats = async (id) => {
  try {
    const response = await get(`/recipients/${id}/stats`);
    return response;
  } catch (error) {
    throw error;
  }
};

export const searchCompatibleRecipients = async (bloodType, params = {}) => {
  try {
    const queryString = new URLSearchParams(params).toString();
    const response = await get(`/recipients/search/compatible/${bloodType}?${queryString}`);
    return response;
  } catch (error) {
    throw error;
  }
};

export const deleteRecipient = async (id) => {
  try {
    const response = await del(`/recipients/${id}`);
    return response;
  } catch (error) {
    throw error;
  }
};