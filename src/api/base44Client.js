// Base44 client configuration for NewsPlay
export const base44 = {
  // Configuration for the NewsPlay backend
  appId: "68a6db8b12fc8a95921b2780",
  requiresAuth: true,
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:3001/api'
};
