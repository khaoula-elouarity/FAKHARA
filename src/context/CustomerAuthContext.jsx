import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  fetchCurrentUser,
  loginUser,
  logoutUser,
  registerUser,
  updateCurrentUser,
} from "../services/api.js";

const CustomerAuthContext = createContext(null);

export function CustomerAuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  // Incremented by every explicit authentication action so the initial
  // "who am I" request can never overwrite a newer login/registration result.
  const sessionVersion = useRef(0);

  useEffect(() => {
    let active = true;
    const version = sessionVersion.current;

    fetchCurrentUser()
      .then((payload) => {
        if (active && version === sessionVersion.current) {
          setUser(payload?.user || null);
        }
      })
      .catch(() => {
        if (active && version === sessionVersion.current) {
          setUser(null);
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  const login = useCallback(async (credentials) => {
    const payload = await loginUser(credentials);
    sessionVersion.current += 1;
    setUser(payload?.user || null);
    return payload?.user || null;
  }, []);

  const register = useCallback(async (profile) => {
    const payload = await registerUser(profile);
    sessionVersion.current += 1;
    setUser(payload?.user || null);
    return payload?.user || null;
  }, []);

  const logout = useCallback(async () => {
    try {
      await logoutUser();
    } finally {
      sessionVersion.current += 1;
      setUser(null);
    }
  }, []);

  const refresh = useCallback(async () => {
    const payload = await fetchCurrentUser();
    setUser(payload?.user || null);
    return payload?.user || null;
  }, []);

  const updateUser = useCallback(async (profile) => {
    const payload = await updateCurrentUser(profile);
    setUser(payload?.user || null);
    return payload?.user || null;
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated: Boolean(user),
      login,
      register,
      logout,
      refresh,
      updateUser,
      setUser,
    }),
    [user, loading, login, register, logout, refresh, updateUser]
  );

  return (
    <CustomerAuthContext.Provider value={value}>
      {children}
    </CustomerAuthContext.Provider>
  );
}

export function useCustomerAuth() {
  const context = useContext(CustomerAuthContext);

  if (!context) {
    throw new Error(
      "useCustomerAuth must be used inside CustomerAuthProvider"
    );
  }

  return context;
}

export default CustomerAuthContext;
