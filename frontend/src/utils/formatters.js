export const formatCurrency = (amount, currency = 'LKR') => {
  if (!amount) return '0.00';
  
  const formatter = new Intl.NumberFormat('en-LK', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2
  });
  
  return formatter.format(amount);
};

export const formatNumber = (number, decimals = 0) => {
  if (!number && number !== 0) return '0';
  
  return new Intl.NumberFormat('en-LK', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(number);
};

export const formatBloodType = (bloodType) => {
  if (!bloodType) return '';
  return bloodType.toUpperCase();
};

export const formatRole = (role) => {
  if (!role) return '';
  return role.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

export const formatStatus = (status) => {
  if (!status) return '';
  return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

export const formatUrgency = (urgency) => {
  const urgencyMap = {
    low: 'Low',
    medium: 'Medium',
    high: 'High',
    critical: 'Critical'
  };
  
  return urgencyMap[urgency] || urgency;
};

export const formatDateTime = (dateTime) => {
  if (!dateTime) return '';
  
  const date = new Date(dateTime);
  return date.toLocaleString('en-LK', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const formatTimeAgo = (date) => {
  if (!date) return '';
  
  const now = new Date();
  const diffInMs = now - new Date(date);
  const diffInSeconds = Math.floor(diffInMs / 1000);
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);
  
  if (diffInDays > 0) {
    return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  } else if (diffInHours > 0) {
    return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
  } else if (diffInMinutes > 0) {
    return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
  } else {
    return 'Just now';
  }
};

export const formatPercentage = (value, total, decimals = 1) => {
  if (!total || total === 0) return '0%';
  
  const percentage = (value / total) * 100;
  return `${percentage.toFixed(decimals)}%`;
};

export const formatAddress = (address) => {
  if (!address) return '';
  
  const parts = [
    address.street,
    address.city,
    address.district,
    address.zipCode
  ].filter(Boolean);
  
  return parts.join(', ');
};

export const formatName = (firstName, lastName) => {
  const parts = [firstName, lastName].filter(Boolean);
  return parts.join(' ');
};

export const formatFileType = (fileName) => {
  if (!fileName) return '';
  
  const extension = fileName.split('.').pop().toLowerCase();
  const typeMap = {
    pdf: 'PDF Document',
    doc: 'Word Document',
    docx: 'Word Document',
    jpg: 'JPEG Image',
    jpeg: 'JPEG Image',
    png: 'PNG Image',
    gif: 'GIF Image',
    csv: 'CSV File',
    xlsx: 'Excel Spreadsheet',
    xls: 'Excel Spreadsheet'
  };
  
  return typeMap[extension] || extension.toUpperCase();
};