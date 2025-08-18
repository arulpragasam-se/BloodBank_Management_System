import { useCallback, useRef, useState } from 'react';
import { validateForm } from '../utils/validators';

export const useForm = ({
  initialValues = {},
  validationRules = {},
  onSubmit,
  validateOnChange = false,
  validateOnBlur = true,
} = {}) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const submitCountRef = useRef(0);

  const validateField = useCallback((name, value) => {
    if (!validationRules[name]) return null;

    const fieldRules = { [name]: validationRules[name] };
    const fieldValues = { [name]: value };
    const validation = validateForm(fieldValues, fieldRules);

    return validation.errors[name] || null;
  }, [validationRules]);

  const validateAllFields = useCallback(() => {
    setIsValidating(true);
    const validation = validateForm(values, validationRules);
    setErrors(validation.errors);
    setIsValidating(false);
    return validation.isValid;
  }, [values, validationRules]);

  const setValue = useCallback((name, value) => {
    setValues(prev => ({
      ...prev,
      [name]: value,
    }));

    if (validateOnChange && validationRules[name]) {
      const fieldError = validateField(name, value);
      setErrors(prev => ({
        ...prev,
        [name]: fieldError,
      }));
    }
  }, [validateOnChange, validationRules, validateField]);

  const setFieldValue = setValue;

  const setMultipleValues = useCallback((newValues) => {
    setValues(prev => ({
      ...prev,
      ...newValues,
    }));

    if (validateOnChange) {
      const newErrors = { ...errors };
      Object.keys(newValues).forEach(name => {
        if (validationRules[name]) {
          const fieldError = validateField(name, newValues[name]);
          newErrors[name] = fieldError;
        }
      });
      setErrors(newErrors);
    }
  }, [validateOnChange, validationRules, validateField, errors]);

  const setFieldTouched = useCallback((name, isTouched = true) => {
    setTouched(prev => ({
      ...prev,
      [name]: isTouched,
    }));
  }, []);

  const setFieldError = useCallback((name, error) => {
    setErrors(prev => ({
      ...prev,
      [name]: error,
    }));
  }, []);

  const clearFieldError = useCallback((name) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[name];
      return newErrors;
    });
  }, []);

  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    const fieldValue = type === 'checkbox' ? checked : value;
    setValue(name, fieldValue);
  }, [setValue]);

  const handleBlur = useCallback((e) => {
    const { name, value } = e.target;
    setFieldTouched(name, true);

    if (validateOnBlur && validationRules[name]) {
      const fieldError = validateField(name, value);
      setErrors(prev => ({
        ...prev,
        [name]: fieldError,
      }));
    }
  }, [validateOnBlur, validationRules, validateField, setFieldTouched]);

  const handleSubmit = useCallback((e) => {
    if (e) {
      e.preventDefault();
    }

    submitCountRef.current += 1;
    setIsSubmitting(true);

    // Mark all fields as touched
    const allFieldsTouched = {};
    Object.keys(validationRules).forEach(name => {
      allFieldsTouched[name] = true;
    });
    setTouched(allFieldsTouched);

    const isValid = validateAllFields();

    if (isValid && onSubmit) {
      Promise.resolve(onSubmit(values))
        .then(() => {
          setIsSubmitting(false);
        })
        .catch((error) => {
          setIsSubmitting(false);
          if (error.fieldErrors) {
            setErrors(prev => ({ ...prev, ...error.fieldErrors }));
          }
        });
    } else {
      setIsSubmitting(false);
    }
  }, [values, validationRules, validateAllFields, onSubmit]);

  const reset = useCallback((newValues = initialValues) => {
    setValues(newValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
    submitCountRef.current = 0;
  }, [initialValues]);

  const getFieldProps = useCallback((name) => {
    return {
      name,
      value: values[name] || '',
      onChange: handleChange,
      onBlur: handleBlur,
    };
  }, [values, handleChange, handleBlur]);

  const getFieldState = useCallback((name) => {
    return {
      value: values[name],
      error: errors[name],
      touched: touched[name],
      hasError: Boolean(errors[name] && touched[name]),
    };
  }, [values, errors, touched]);

  const isValid = Object.keys(errors).length === 0;
  const isDirty = JSON.stringify(values) !== JSON.stringify(initialValues);
  const submitCount = submitCountRef.current;

  return {
    // Values
    values,
    errors,
    touched,
    
    // State
    isSubmitting,
    isValidating,
    isValid,
    isDirty,
    submitCount,
    
    // Actions
    setValue,
    setFieldValue,
    setMultipleValues,
    setFieldTouched,
    setFieldError,
    clearFieldError,
    clearErrors,
    validateField,
    validateAllFields,
    handleChange,
    handleBlur,
    handleSubmit,
    reset,
    
    // Helpers
    getFieldProps,
    getFieldState,
  };
};

export default useForm;