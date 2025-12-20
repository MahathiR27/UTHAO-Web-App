// Simple authentication utilities

// Get token
export const getToken = () => localStorage.getItem('token');

// Save token
export const setToken = (token) => localStorage.setItem('token', token);

// Remove token (logout)
export const removeToken = () => localStorage.removeItem('token');

// Get user data from token
export const getUser = () => {
  const token = getToken();
  if (!token) return null;
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload;
  } catch (error) {
    return null;
  }
};
