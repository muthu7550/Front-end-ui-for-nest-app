// src/utils/apiClient.js
import { jwtDecode } from "jwt-decode";

export const getStoredToken = (type) => localStorage.getItem(`${type}_token`);

export const setStoredTokens = (access, refresh) => {
  if (access) localStorage.setItem("access_token", access);
  if (refresh) localStorage.setItem("refresh_token", refresh);
};

export const clearTokens = () => {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
};

export const getUserPayload = () => {
  const token = getStoredToken("access");
  if (!token) return null;
  try {
    return jwtDecode(token);
  } catch {
    return null;
  }
};

export async function secureFetch(url, options = {}) {
  let accessToken = getStoredToken("access");
  
  options.headers = {
    ...options.headers,
    "Content-Type": "application/json",
    "Authorization": `Bearer ${accessToken}`,
  };

  let response = await fetch(url, options);

  // Intercept expired 1m Access Tokens
  if (response.status === 401) {
    const refreshToken = getStoredToken("refresh");
    const user = getUserPayload();

    if (refreshToken && user) {
      console.warn("Access token expired! Requesting silent refresh token rotation...");
      
      try {
        const refreshResponse = await fetch("https://backend-nest-7n6bh4kl7-muthu7550s-projects.vercel.app/auth/refresh", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: user.sub, refresh_token: refreshToken }),
        });

        if (refreshResponse.ok) {
          const tokens = await refreshResponse.json();
          setStoredTokens(tokens.access_token, tokens.refresh_token);

          // Retry the original user request with the fresh token pairs
          options.headers["Authorization"] = `Bearer ${tokens.access_token}`;
          return await fetch(url, options);
        }
      } catch (err) {
        console.error("Token recycling handshake pipeline failed:", err);
      }
    }

    // Force system eviction if refresh tokens are dead or missing
    clearTokens();
    window.dispatchEvent(new Event("auth-expired"));
  }

  return response;
}
