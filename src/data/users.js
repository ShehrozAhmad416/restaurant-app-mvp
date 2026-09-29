// Mock users used for authentication (no backend).
// Passwords follow the app's own rule: at least 8 characters with at least one digit.

export const ROLES = {
  CUSTOMER: 'customer',
  MANAGER: 'manager',
};

export const users = [
  {
    id: 'u1',
    fullName: 'Ayesha Khan',
    email: 'customer@demo.pk',
    password: 'customer1',
    role: ROLES.CUSTOMER,
  },
  {
    id: 'u2',
    fullName: 'Bilal Ahmed',
    email: 'manager@demo.pk',
    password: 'manager1',
    role: ROLES.MANAGER,
  },
];

export default users;
