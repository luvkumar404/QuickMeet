import axios from "axios";

export const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:8000").replace(/\/$/, "");
const TOKEN_KEY = "quickmeet_token";

export const getToken = () => sessionStorage.getItem(TOKEN_KEY);
export const setToken = (token) => sessionStorage.setItem(TOKEN_KEY, token);
export const clearToken = () => sessionStorage.removeItem(TOKEN_KEY);

export const api = axios.create({
    baseURL: `${API_URL}/api/v1`,
    timeout: 10000,
    headers: { "Content-Type": "application/json" }
});

api.interceptors.request.use((config) => {
    const token = getToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

export const getApiError = (error, fallback = "Something went wrong") =>
    error.response?.data?.message || (error.code === "ECONNABORTED" ? "The server took too long to respond" : fallback);
