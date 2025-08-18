import { del, get, post, put } from './api';

export const getAllInventory = async (params = {}) => {
  try {
    const queryString = new URLSearchParams(params).toString();
    const response = await get(`/inventory?${queryString}`);
    return response;
  } catch (error) {
    throw error;
  }
};

export const addBloodInventory = async (inventoryData) => {
  try {
    const response = await post('/inventory', inventoryData);
    return response;
  } catch (error) {
    throw error;
  }
};

export const updateInventory = async (id, inventoryData) => {
  try {
    const response = await put(`/inventory/${id}`, inventoryData);
    return response;
  } catch (error) {
    throw error;
  }
};

export const getInventoryStats = async () => {
  try {
    const response = await get('/inventory/stats');
    return response;
  } catch (error) {
    throw error;
  }
};

export const checkExpiredBlood = async () => {
  try {
    const response = await post('/inventory/check-expired');
    return response;
  } catch (error) {
    throw error;
  }
};

export const sendLowStockAlert = async (alertData) => {
  try {
    const response = await post('/inventory/low-stock-alert', alertData);
    return response;
  } catch (error) {
    throw error;
  }
};

export const reserveBlood = async (reservationData) => {
  try {
    const response = await post('/inventory/reserve', reservationData);
    return response;
  } catch (error) {
    throw error;
  }
};

export const getInventoryByBloodType = async (bloodType, params = {}) => {
  try {
    const queryString = new URLSearchParams(params).toString();
    const response = await get(`/inventory/blood-type/${bloodType}?${queryString}`);
    return response;
  } catch (error) {
    throw error;
  }
};

export const getExpiringInventory = async (days, params = {}) => {
  try {
    const queryString = new URLSearchParams(params).toString();
    const response = await get(`/inventory/expiring/${days}?${queryString}`);
    return response;
  } catch (error) {
    throw error;
  }
};

export const deleteInventory = async (id) => {
  try {
    const response = await del(`/inventory/${id}`);
    return response;
  } catch (error) {
    throw error;
  }
};