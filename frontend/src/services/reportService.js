import { del, get, post } from './api';

export const generateDonorReport = async (params = {}) => {
  try {
    const queryString = new URLSearchParams(params).toString();
    const response = await get(`/reports/donors?${queryString}`);
    return response;
  } catch (error) {
    throw error;
  }
};

export const generateInventoryReport = async (params = {}) => {
  try {
    const queryString = new URLSearchParams(params).toString();
    const response = await get(`/reports/inventory?${queryString}`);
    return response;
  } catch (error) {
    throw error;
  }
};

export const generateCampaignReport = async (params = {}) => {
  try {
    const queryString = new URLSearchParams(params).toString();
    const response = await get(`/reports/campaigns?${queryString}`);
    return response;
  } catch (error) {
    throw error;
  }
};

export const generateRequestsReport = async (params = {}) => {
  try {
    const queryString = new URLSearchParams(params).toString();
    const response = await get(`/reports/requests?${queryString}`);
    return response;
  } catch (error) {
    throw error;
  }
};

export const generateDonationsReport = async (params = {}) => {
  try {
    const queryString = new URLSearchParams(params).toString();
    const response = await get(`/reports/donations?${queryString}`);
    return response;
  } catch (error) {
    throw error;
  }
};

export const generateMonthlySummary = async (params = {}) => {
  try {
    const queryString = new URLSearchParams(params).toString();
    const response = await get(`/reports/monthly-summary?${queryString}`);
    return response;
  } catch (error) {
    throw error;
  }
};

export const generateAnnualReport = async (params = {}) => {
  try {
    const queryString = new URLSearchParams(params).toString();
    const response = await get(`/reports/annual?${queryString}`);
    return response;
  } catch (error) {
    throw error;
  }
};

export const generateHospitalPerformanceReport = async (params = {}) => {
  try {
    const queryString = new URLSearchParams(params).toString();
    const response = await get(`/reports/hospital-performance?${queryString}`);
    return response;
  } catch (error) {
    throw error;
  }
};

export const generateWastageReport = async (params = {}) => {
  try {
    const queryString = new URLSearchParams(params).toString();
    const response = await get(`/reports/wastage?${queryString}`);
    return response;
  } catch (error) {
    throw error;
  }
};

export const generateDonorEngagementReport = async (params = {}) => {
  try {
    const queryString = new URLSearchParams(params).toString();
    const response = await get(`/reports/donor-engagement?${queryString}`);
    return response;
  } catch (error) {
    throw error;
  }
};

export const generateCustomReport = async (reportData) => {
  try {
    const response = await post('/reports/custom', reportData);
    return response;
  } catch (error) {
    throw error;
  }
};

export const getReportHistory = async (params = {}) => {
  try {
    const queryString = new URLSearchParams(params).toString();
    const response = await get(`/reports/history?${queryString}`);
    return response;
  } catch (error) {
    throw error;
  }
};

export const downloadReport = async (reportId) => {
  try {
    const response = await get(`/reports/download/${reportId}`, {
      responseType: 'blob',
    });
    return response;
  } catch (error) {
    throw error;
  }
};

export const deleteReport = async (reportId) => {
  try {
    const response = await del(`/reports/${reportId}`);
    return response;
  } catch (error) {
    throw error;
  }
};