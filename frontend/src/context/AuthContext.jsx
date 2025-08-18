import { createContext, useContext, useEffect, useReducer } from 'react';
import { getProfile } from '../services/authService';
import { clearAuthData, getAuthToken, getUserData } from '../utils/storage';

const AuthContext = createContext();

const initialState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

const authReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    case 'LOGIN_FAILURE':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };
    case 'UPDATE_USER':
      return {
        ...state,
        user: { ...state.user, ...action.payload },
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
    default:
      return state;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  const login = (userData) => {
    dispatch({
      type: 'LOGIN_SUCCESS',
      payload: { user: userData },
    });
  };

  const logout = () => {
    clearAuthData();
    dispatch({ type: 'LOGOUT' });
  };

  const updateUser = (userData) => {
    dispatch({
      type: 'UPDATE_USER',
      payload: userData,
    });
  };

  const setError = (error) => {
    dispatch({
      type: 'SET_ERROR',
      payload: error,
    });
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const checkAuthStatus = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const token = getAuthToken();
      const userData = getUserData();

      if (token && userData) {
        try {
          const response = await getProfile();
          if (response.success) {
            dispatch({
              type: 'LOGIN_SUCCESS',
              payload: { user: response.data.user },
            });
          } else {
            throw new Error('Invalid session');
          }
        } catch (error) {
          clearAuthData();
          dispatch({ type: 'LOGOUT' });
        }
      } else {
        dispatch({ type: 'LOGOUT' });
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      dispatch({ type: 'LOGOUT' });
    }
  };

  const hasPermission = (permission) => {
    if (!state.user) return false;
    
    const userRole = state.user.role;
    const rolePermissions = {
      admin: ['*'], // Admin has all permissions
      hospital_staff: [
        'view_donors',
        'manage_inventory',
        'create_campaigns',
        'view_reports',
        'send_notifications',
      ],
      donor: ['view_campaigns', 'view_profile'],
      recipient: ['view_profile'],
    };

    const permissions = rolePermissions[userRole] || [];
    return permissions.includes('*') || permissions.includes(permission);
  };

  const hasRole = (role) => {
    return state.user?.role === role;
  };

  const hasAnyRole = (roles) => {
    if (!state.user) return false;
    return roles.includes(state.user.role);
  };

  const canAccessRoute = (route) => {
    if (!state.isAuthenticated) return false;

    const publicRoutes = ['/dashboard', '/profile'];
    if (publicRoutes.includes(route)) return true;

    const routePermissions = {
      '/donors': 'view_donors',
      '/inventory': 'manage_inventory',
      '/campaigns': 'view_campaigns',
      '/hospitals': 'view_hospitals',
      '/recipients': 'view_recipients',
      '/requests': 'view_requests',
      '/notifications': 'view_notifications',
      '/reports': 'view_reports',
    };

    const requiredPermission = routePermissions[route];
    return requiredPermission ? hasPermission(requiredPermission) : true;
  };

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const value = {
    ...state,
    login,
    logout,
    updateUser,
    setError,
    clearError,
    checkAuthStatus,
    hasPermission,
    hasRole,
    hasAnyRole,
    canAccessRoute,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;