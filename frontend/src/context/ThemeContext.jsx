import { createContext, useContext, useEffect, useState } from 'react';
import { getTheme, setTheme as saveTheme } from '../utils/storage';

const ThemeContext = createContext();

const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system',
};

const ThemeProvider = ({ children }) => {
  const [theme, setThemeState] = useState(() => getTheme() || THEMES.LIGHT);
  const [isDark, setIsDark] = useState(false);

  const setTheme = (newTheme) => {
    setThemeState(newTheme);
    saveTheme(newTheme);
  };

  const toggleTheme = () => {
    const newTheme = theme === THEMES.LIGHT ? THEMES.DARK : THEMES.LIGHT;
    setTheme(newTheme);
  };

  const applyTheme = (themeToApply) => {
    const root = document.documentElement;
    const body = document.body;

    if (themeToApply === THEMES.DARK) {
      root.classList.add('dark');
      body.classList.add('dark');
      setIsDark(true);
    } else {
      root.classList.remove('dark');
      body.classList.remove('dark');
      setIsDark(false);
    }
  };

  const getSystemTheme = () => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches
        ? THEMES.DARK
        : THEMES.LIGHT;
    }
    return THEMES.LIGHT;
  };

  const getEffectiveTheme = () => {
    if (theme === THEMES.SYSTEM) {
      return getSystemTheme();
    }
    return theme;
  };

  useEffect(() => {
    const effectiveTheme = getEffectiveTheme();
    applyTheme(effectiveTheme);

    if (theme === THEMES.SYSTEM) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = (e) => {
        applyTheme(e.matches ? THEMES.DARK : THEMES.LIGHT);
      };

      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [theme]);

  const getThemeColors = () => {
    const colors = {
      primary: isDark ? '#ef4444' : '#dc2626',
      secondary: isDark ? '#6b7280' : '#4b5563',
      background: isDark ? '#111827' : '#ffffff',
      surface: isDark ? '#1f2937' : '#f9fafb',
      text: isDark ? '#f9fafb' : '#111827',
      textSecondary: isDark ? '#d1d5db' : '#6b7280',
      border: isDark ? '#374151' : '#e5e7eb',
      success: isDark ? '#10b981' : '#059669',
      warning: isDark ? '#f59e0b' : '#d97706',
      error: isDark ? '#ef4444' : '#dc2626',
      info: isDark ? '#3b82f6' : '#2563eb',
    };

    return colors;
  };

  const getThemeConfig = () => {
    return {
      name: theme,
      isDark,
      colors: getThemeColors(),
      spacing: {
        xs: '0.25rem',
        sm: '0.5rem',
        md: '1rem',
        lg: '1.5rem',
        xl: '2rem',
        '2xl': '3rem',
      },
      borderRadius: {
        sm: '0.25rem',
        md: '0.375rem',
        lg: '0.5rem',
        xl: '0.75rem',
        '2xl': '1rem',
        full: '9999px',
      },
      shadows: {
        sm: isDark
          ? '0 1px 2px 0 rgba(0, 0, 0, 0.3)'
          : '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        md: isDark
          ? '0 4px 6px -1px rgba(0, 0, 0, 0.3)'
          : '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        lg: isDark
          ? '0 10px 15px -3px rgba(0, 0, 0, 0.3)'
          : '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
      },
    };
  };

  const value = {
    theme,
    isDark,
    themes: THEMES,
    setTheme,
    toggleTheme,
    getEffectiveTheme,
    getThemeColors,
    getThemeConfig,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export { ThemeProvider, THEMES };
export default ThemeContext;