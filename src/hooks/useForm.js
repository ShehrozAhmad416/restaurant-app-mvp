import { useCallback, useMemo, useRef, useState } from 'react';

/**
 * Question 9: reusable form logic.
 *
 * @param {object} initialValues  starting field values
 * @param {(values: object) => object} validate  returns { field: message } for each invalid field
 * @returns {{ values, errors, handleChange, handleSubmit, reset, isValid, setFieldValue, setErrors }}
 */
export default function useForm(initialValues, validate) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});

  // Keep the latest validate function without making callbacks change on every render.
  const validateRef = useRef(validate);
  validateRef.current = validate;
  const initialRef = useRef(initialValues);

  const setFieldValue = useCallback((field, value) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    // A field's error clears as soon as the user edits that field.
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }, []);

  // Usage: <TextInput onChangeText={handleChange('email')} />
  const handleChange = useCallback((field) => (value) => setFieldValue(field, value), [setFieldValue]);

  // Usage: onPress={handleSubmit(onValid)}
  const handleSubmit = useCallback(
    (onValid) => () => {
      const nextErrors = validateRef.current(values);
      setErrors(nextErrors);
      if (Object.keys(nextErrors).length === 0) onValid(values);
    },
    [values],
  );

  const reset = useCallback((nextValues = initialRef.current) => {
    setValues(nextValues);
    setErrors({});
  }, []);

  const isValid = useMemo(() => Object.keys(validate(values)).length === 0, [values, validate]);

  return { values, errors, handleChange, handleSubmit, reset, isValid, setFieldValue, setErrors };
}
