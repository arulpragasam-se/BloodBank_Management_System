import { createContext, useCallback, useContext, useReducer } from 'react';
import { getUnreadCount, getUserNotifications, markAllAsRead, markAsRead } from '../services/notificationService';

const NotificationContext = createContext();

const initialState = {
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  error: null,
  pagination: {
    current: 1,
    pages: 1,
    total: 0,
    limit: 10,
  },
  filters: {
    type: '',
    read: '',
    priority: '',
  },
};

const notificationReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };
    case 'SET_NOTIFICATIONS':
      return {
        ...state,
        notifications: action.payload.notifications,
        pagination: action.payload.pagination,
        isLoading: false,
        error: null,
      };
    case 'ADD_NOTIFICATION':
      return {
        ...state,
        notifications: [action.payload, ...state.notifications],
        unreadCount: state.unreadCount + 1,
      };
    case 'UPDATE_NOTIFICATION':
      return {
        ...state,
        notifications: state.notifications.map(notification =>
          notification._id === action.payload._id
            ? { ...notification, ...action.payload }
            : notification
        ),
      };
    case 'MARK_AS_READ':
      return {
        ...state,
        notifications: state.notifications.map(notification =>
          notification._id === action.payload
            ? { ...notification, 'channels.inApp.read': true, 'channels.inApp.readAt': new Date() }
            : notification
        ),
        unreadCount: Math.max(0, state.unreadCount - 1),
      };
    case 'MARK_ALL_AS_READ':
      return {
        ...state,
        notifications: state.notifications.map(notification => ({
          ...notification,
          'channels.inApp.read': true,
          'channels.inApp.readAt': new Date(),
        })),
        unreadCount: 0,
      };
    case 'SET_UNREAD_COUNT':
      return {
        ...state,
        unreadCount: action.payload,
      };
    case 'SET_FILTERS':
      return {
        ...state,
        filters: { ...state.filters, ...action.payload },
      };
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        isLoading: false,
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
    case 'REMOVE_NOTIFICATION':
      return {
        ...state,
        notifications: state.notifications.filter(
          notification => notification._id !== action.payload
        ),
      };
    default:
      return state;
  }
};

export const NotificationProvider = ({ children }) => {
  const [state, dispatch] = useReducer(notificationReducer, initialState);

  const fetchNotifications = useCallback(async (params = {}) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const queryParams = {
        ...state.filters,
        ...params,
        page: params.page || state.pagination.current,
        limit: params.limit || state.pagination.limit,
      };

      const response = await getUserNotifications(queryParams);
      
      if (response.success) {
        dispatch({
          type: 'SET_NOTIFICATIONS',
          payload: {
            notifications: response.data.notifications,
            pagination: response.data.pagination,
          },
        });
      }
    } catch (error) {
      dispatch({
        type: 'SET_ERROR',
        payload: error.message || 'Failed to fetch notifications',
      });
    }
  }, [state.filters, state.pagination.current, state.pagination.limit]);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const response = await getUnreadCount();
      if (response.success) {
        dispatch({
          type: 'SET_UNREAD_COUNT',
          payload: response.data.count,
        });
      }
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
    }
  }, []);

  const markNotificationAsRead = useCallback(async (notificationId) => {
    try {
      const response = await markAsRead(notificationId);
      if (response.success) {
        dispatch({
          type: 'MARK_AS_READ',
          payload: notificationId,
        });
      }
    } catch (error) {
      dispatch({
        type: 'SET_ERROR',
        payload: error.message || 'Failed to mark notification as read',
      });
    }
  }, []);

  const markAllNotificationsAsRead = useCallback(async () => {
    try {
      const response = await markAllAsRead();
      if (response.success) {
        dispatch({ type: 'MARK_ALL_AS_READ' });
      }
    } catch (error) {
      dispatch({
        type: 'SET_ERROR',
        payload: error.message || 'Failed to mark all notifications as read',
      });
    }
  }, []);

  const addNotification = useCallback((notification) => {
    dispatch({
      type: 'ADD_NOTIFICATION',
      payload: notification,
    });
  }, []);

  const updateNotification = useCallback((notification) => {
    dispatch({
      type: 'UPDATE_NOTIFICATION',
      payload: notification,
    });
  }, []);

  const removeNotification = useCallback((notificationId) => {
    dispatch({
      type: 'REMOVE_NOTIFICATION',
      payload: notificationId,
    });
  }, []);

  const setFilters = useCallback((filters) => {
    dispatch({
      type: 'SET_FILTERS',
      payload: filters,
    });
  }, []);

  const clearError = useCallback(() => {
    dispatch({ type: 'CLEAR_ERROR' });
  }, []);

  const showToast = useCallback((message, type = 'info', duration = 5000) => {
    const toastNotification = {
      _id: `toast_${Date.now()}`,
      title: type.charAt(0).toUpperCase() + type.slice(1),
      message,
      type,
      isToast: true,
      createdAt: new Date(),
    };

    dispatch({
      type: 'ADD_NOTIFICATION',
      payload: toastNotification,
    });

    if (duration > 0) {
      setTimeout(() => {
        removeNotification(toastNotification._id);
      }, duration);
    }
  }, [removeNotification]);

  const showSuccess = useCallback((message, duration) => {
    showToast(message, 'success', duration);
  }, [showToast]);

  const showError = useCallback((message, duration) => {
    showToast(message, 'error', duration);
  }, [showToast]);

  const showWarning = useCallback((message, duration) => {
    showToast(message, 'warning', duration);
  }, [showToast]);

  const showInfo = useCallback((message, duration) => {
    showToast(message, 'info', duration);
  }, [showToast]);

  const getNotificationsByType = useCallback((type) => {
    return state.notifications.filter(notification => notification.type === type);
  }, [state.notifications]);

  const getUnreadNotifications = useCallback(() => {
    return state.notifications.filter(notification => !notification['channels.inApp.read']);
  }, [state.notifications]);

  const hasUnreadNotifications = useCallback(() => {
    return state.unreadCount > 0;
  }, [state.unreadCount]);

  const value = {
    ...state,
    fetchNotifications,
    fetchUnreadCount,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    addNotification,
    updateNotification,
    removeNotification,
    setFilters,
    clearError,
    showToast,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    getNotificationsByType,
    getUnreadNotifications,
    hasUnreadNotifications,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

export default NotificationContext;