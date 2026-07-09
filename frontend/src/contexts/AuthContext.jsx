import { useCallback, useEffect, useState } from "react";
import { api, clearToken, getToken, setToken } from "../lib/api.js";
import { AuthContext } from "./auth-context.js";

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(Boolean(getToken()));

    const logout = useCallback(() => {
        clearToken();
        setUser(null);
    }, []);

    useEffect(() => {
        if (!getToken()) return;
        api.get("/users/me")
            .then(({ data }) => setUser(data.data.user))
            .catch(logout)
            .finally(() => setLoading(false));
    }, [logout]);

    const login = async (credentials) => {
        const { data } = await api.post("/users/login", credentials);
        setToken(data.data.token);
        setUser(data.data.user);
    };

    const register = async (details) => {
        await api.post("/users/register", details);
        await login({ username: details.username, password: details.password });
    };

    return (
        <AuthContext.Provider value={{ user, loading, isAuthenticated: Boolean(user), login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
}
