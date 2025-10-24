// Utility to get API URL dynamically for local or Codespace
const getApiUrl = () => {
  // If running in Codespace, use VITE_API_URL_CODESPACE if set
  if (window.location.hostname.endsWith('.app.github.dev') && import.meta.env.VITE_API_URL_CODESPACE) {
    return import.meta.env.VITE_API_URL_CODESPACE;
  }
  // Otherwise use local
  return import.meta.env.VITE_API_URL;
};

export const API_URL = getApiUrl();