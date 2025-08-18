import { del, get, post, put } from './api';

export const getAllHospitals = async (params = {}) => {
  try {
    const queryString = new URLSearchParams(params).toString();
    const response = await get(`/hospitals?${queryString}`);
    return response;
  } catch (error) {
    throw error;
  }
};

export const createHospital = async (hospitalData) => {
  try {
    const response = await post('/hospitals', hospitalData);
    return response;
  } catch (error) {
    throw error;
  }
};

export const getHospitalById = async (id) => {
  try {
    const response = await get(`/hospitals/${id}`);
    return response;
  } catch (error) {
    throw error;
  }
};

export const updateHospital = async (id, hospitalData) => {
  try {
    const response = await put(`/hospitals/${id}`, hospitalData);
    return response;
  } catch (error) {
    throw error;
  }
};

export const addStaffMember = async (hospitalId, staffData) => {
  try {
    const response = await post(`/hospitals/${hospitalId}/staff`, staffData);
    return response;
  } catch (error) {
    throw error;
  }
};

export const removeStaffMember = async (hospitalId, userId) => {
  try {
    const response = await del(`/hospitals/${hospitalId}/staff/${userId}`);
    return response;
  } catch (error) {
    throw error;
  }
};

export const getHospitalRequests = async (hospitalId, params = {}) => {
  try {
    const queryString = new URLSearchParams(params).toString();
    const response = await get(`/hospitals/${hospitalId}/requests?${queryString}`);
    return response;
  } catch (error) {
    throw error;
  }
};

export const createBloodRequest = async (hospitalId, requestData) => {
  try {
    const response = await post(`/hospitals/${hospitalId}/requests`, requestData);
    return response;
  } catch (error) {
    throw error;
  }
};

export const deleteHospital = async (id) => {
  try {
    const response = await del(`/hospitals/${id}`);
    return response;
  } catch (error) {
    throw error;
  }
};