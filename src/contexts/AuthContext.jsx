import { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';

// Create the context
const AuthContext = createContext(null);

// Create the hook separately from its export
function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Export the hook
export const useAuth = useAuthContext;

// AuthProvider component
export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      setCurrentUser(JSON.parse(userData));
      
      // Set Authorization header for all future requests
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    try {
      setError('');
      const { data } = await api.post('/auth/login', { username, password });
      
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify({
        id: data._id,
        username: data.username,
        role: data.role
      }));
      
      // Set Authorization header for all future requests
      api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
      
      setCurrentUser({
        id: data._id,
        username: data.username,
        role: data.role
      });
      
      return data.role;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to login');
      throw new Error(err.response?.data?.message || 'Failed to login');
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete api.defaults.headers.common['Authorization'];
    setCurrentUser(null);
  };

  const value = {
    currentUser,
    login,
    logout,
    error
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}