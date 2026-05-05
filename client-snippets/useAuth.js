import { useState, useCallback } from 'react';

/**
 * A custom hook to handle authentication and automatic token refreshing.
 * 
 * Usage:
 * const { authFetch, token, setToken } = useAuth();
 * 
 * // Use authFetch just like normal fetch, it will add the token and refresh if needed
 * authFetch('http://localhost:4000/protected-route')
 *   .then(res => res.json())
 *   .then(data => console.log(data));
 */
export function useAuth() {
  // Initialize token from localStorage (if available)
  const [token, setTokenState] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token');
    }
    return null;
  });

  const setToken = (newToken) => {
    if (newToken) {
      localStorage.setItem('token', newToken);
    } else {
      localStorage.removeItem('token');
    }
    setTokenState(newToken);
  };

  // Helper to check if token is expired
  const isTokenExpired = (token) => {
    if (!token) return true;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expiry = payload.exp;
      const now = Math.floor(Date.now() / 1000);
      return now >= expiry;
    } catch (e) {
      return true;
    }
  };

  // Function to refresh the token
  const refreshToken = async (oldToken) => {
    try {
      const response = await fetch('http://localhost:4000/auth/refresh', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${oldToken}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to refresh token');
      }

      const data = await response.json();
      return data.accessToken;
    } catch (error) {
      console.error("Token refresh failed:", error);
      return null;
    }
  };

  // Wrapper around fetch that handles auth
  const authFetch = useCallback(async (url, options = {}) => {
    let currentToken = token;

    // If token is expired (or missing), try to refresh it
    if (isTokenExpired(currentToken)) {
      // Note: We try to refresh using the *expired* token.
      // The server must be configured to accept expired tokens for the refresh endpoint.
      const newToken = await refreshToken(currentToken);
      
      if (newToken) {
        setToken(newToken);
        currentToken = newToken;
      } else {
        // Refresh failed, user might need to login again
        // You could redirect to login here
        throw new Error('Session expired');
      }
    }

    // Proceed with the request using the valid token
    const headers = {
      ...options.headers,
      'Authorization': `Bearer ${currentToken}`
    };

    return fetch(url, { ...options, headers });
  }, [token]);

  return { token, setToken, authFetch };
}
