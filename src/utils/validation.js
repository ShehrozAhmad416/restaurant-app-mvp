export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const PASSWORD_REGEX = /^(?=.*\d).{8,}$/; // 8+ characters, at least one digit
export const PK_MOBILE_REGEX = /^03\d{2}-\d{7}$/; // 03XX-XXXXXXX

export const isValidEmail = (value) => EMAIL_REGEX.test(value.trim());
export const isValidPassword = (value) => PASSWORD_REGEX.test(value);
export const isValidPkMobile = (value) => PK_MOBILE_REGEX.test(value.trim());

// Validation for the Login / Signup form (used with useForm).
export const validateAuthForm = (values, mode) => {
  const errors = {};
  if (!isValidEmail(values.email)) {
    errors.email = 'Enter a valid email, for example name@example.com';
  }
  if (!isValidPassword(values.password)) {
    errors.password = 'Password needs at least 8 characters, including a digit';
  }
  if (mode === 'signup') {
    if (!values.fullName.trim()) errors.fullName = 'Enter your full name';
    if (values.confirmPassword !== values.password) {
      errors.confirmPassword = 'Passwords do not match';
    }
    if (!values.role) errors.role = 'Choose a role';
  }
  return errors;
};
