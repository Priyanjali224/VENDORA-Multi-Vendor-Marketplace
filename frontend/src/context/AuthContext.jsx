import React, { createContext, useContext, useState, useEffect } from 'react';
import API from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [vendor, setVendor] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('vendora_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const { data } = await API.get('/auth/me');
        if (data.success) {
          setUser(data.user);
          setVendor(data.vendor);
        }
      } catch (err) {
        console.error('Failed to verify token:', err);
        logout();
      } finally {
        setLoading(false);
      }
    };
    fetchCurrentUser();
  }, [token]);

  const login = async (email, password) => {
    const { data } = await API.post('/auth/login', { email, password });
    if (data.success) {
      localStorage.setItem('vendora_token', data.token);
      setToken(data.token);
      setUser(data.user);
      setVendor(data.vendor);
      return data;
    }
  };

  const registerCustomer = async (formData) => {
    const { data } = await API.post('/auth/register', formData);
    if (data.success) {
      localStorage.setItem('vendora_token', data.token);
      setToken(data.token);
      setUser(data.user);
      return data;
    }
  };

  const registerVendor = async (formData) => {
    const { data } = await API.post('/auth/register-vendor', formData);
    if (data.success) {
      localStorage.setItem('vendora_token', data.token);
      setToken(data.token);
      setUser(data.user);
      setVendor(data.vendor);
      return data;
    }
  };

  const logout = () => {
    localStorage.removeItem('vendora_token');
    setToken(null);
    setUser(null);
    setVendor(null);
  };

  const isCustomer = user?.role === 'customer';
  const isVendor = user?.role === 'vendor';
  const isAdmin = user?.role === 'admin';
  const isVendorApproved = isVendor && vendor?.status === 'approved';

  return (
    <AuthContext.Provider
      value={{
        user,
        vendor,
        token,
        loading,
        login,
        registerCustomer,
        registerVendor,
        logout,
        isCustomer,
        isVendor,
        isAdmin,
        isVendorApproved,
        setVendor,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
