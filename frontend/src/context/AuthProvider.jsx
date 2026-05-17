import { useState, useEffect } from 'react';
import axios from 'axios';
import PropTypes from 'prop-types';
import { AuthContext } from './context';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
    const checkUser = async () => {
      if (token) {
        try {
          const res = await axios.get(`${import.meta.env.VITE_API_URL}/auth/me`);
          setUser(res.data.data.user);
        } catch (error) {
          console.error(error);
          setToken(null);
          localStorage.removeItem('token');
        }
      }
      setLoading(false);
    };

    checkUser();
  }, [token]);

  const login = (newToken, userData) => {
    setToken(newToken);
    localStorage.setItem('token', newToken);
    setUser(userData);
  };

  const logout = () => {
    setToken(null);
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
