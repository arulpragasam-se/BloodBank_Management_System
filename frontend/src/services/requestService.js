import { del, get, post, put } from './api';

export const getAllRequests = async (params = {}) => {
  try {
    const queryString = new URLSearchParams(params).toString();
    const response = await get(`/requests?${queryString}`);
    return response;
  } catch (error) {
    throw error;
  }
};

export const createRequest = async (requestData) => {
  try {
    const response = await post('/requests', requestData);
    return response;
  } catch (error) {
    throw error;
  }
};

export const getRequestById = async (id) => {
  try {
    const response = await get(`/requests/${id}`);
    return response;
  } catch (error) {
    throw error;
  }
};

export const updateRequest = async (id, requestData) => {
  try {
    const response = await put(`/requests/${id}`, requestData);
    return response;
  } catch (error) {
    throw error;
  }
};

export const approveRequest = async (id, approvalData) => {
  try {
    const response = await post(`/requests/${id}/approve`, approvalData);
    return response;
  } catch (error) {
    throw error;
  }
};

export const rejectRequest = async (id, rejectionData) => {
  try {
    const response = await post(`/requests/${id}/reject`, rejectionData);
    return response;
  } catch (error) {
    throw error;
  }
};

export const fulfillRequest = async (id, fulfillmentData) => {
  try {
    const response = await post(`/requests/${id}/fulfill`, fulfillmentData);
    return response;
  } catch (error) {
    throw error;
  }
};

export const cancelRequest = async (id, reason) => {
  try {
    const response = await post(`/requests/${id}/cancel`, { reason });
    return response;
  } catch (error) {
    throw error;
  }
};

export const getUrgentRequests = async (params = {}) => {
  try {
    const queryString = new URLSearchParams(params).toString();
    const response = await get(`/requests/urgent?${queryString}`);
    return response;
  } catch (error) {
    throw error;
  }
};

export const deleteRequest = async (id) => {
  try {
    const response = await del(`/requests/${id}`);
    return response;
  } catch (error) {
    throw error;
  }
};