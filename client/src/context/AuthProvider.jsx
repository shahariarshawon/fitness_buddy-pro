import { useEffect, useState } from "react";
import api from "../services/api";
import { AuthContext } from "./AuthContext";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("FitnessBuddyPro_user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem("FitnessBuddyPro_token");
  });

  const [loading, setLoading] = useState(() => {
    return Boolean(localStorage.getItem("FitnessBuddyPro_token"));
  });

  const isAuthenticated = Boolean(token && user);

  const register = async (formData) => {
    const response = await api.post("/auth/register", formData);

    const { token, user } = response.data;

    localStorage.setItem("FitnessBuddyPro_token", token);
    localStorage.setItem("FitnessBuddyPro_user", JSON.stringify(user));

    setToken(token);
    setUser(user);
    setLoading(false);

    return response.data;
  };

  const login = async (formData) => {
    const response = await api.post("/auth/login", formData);

    const { token, user } = response.data;

    localStorage.setItem("FitnessBuddyPro_token", token);
    localStorage.setItem("FitnessBuddyPro_user", JSON.stringify(user));

    setToken(token);
    setUser(user);
    setLoading(false);

    return response.data;
  };

  const logout = () => {
    localStorage.removeItem("FitnessBuddyPro_token");
    localStorage.removeItem("FitnessBuddyPro_user");

    setToken(null);
    setUser(null);
    setLoading(false);
  };

  useEffect(() => {
    if (!token) {
      return;
    }

    let isMounted = true;

    const fetchCurrentUser = async () => {
      try {
        const response = await api.get("/auth/me");

        if (isMounted) {
          setUser(response.data.user);
          localStorage.setItem(
            "FitnessBuddyPro_user",
            JSON.stringify(response.data.user)
          );
        }
      } catch (error) {
        if (isMounted) {
          localStorage.removeItem("FitnessBuddyPro_token");
          localStorage.removeItem("FitnessBuddyPro_user");

          setToken(null);
          setUser(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchCurrentUser();

    return () => {
      isMounted = false;
    };
  }, [token]);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated,
        register,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};