import { createContext, useContext, useEffect, useState } from 'react';
import api from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('🔍 AuthContext: Checking for token...');
    const token = localStorage.getItem('smf_token');
    if (!token) {
      console.log('🔍 AuthContext: No token found, setting loading=false');
      setLoading(false);
      return;
    }
    
    console.log('🔍 AuthContext: Token found, fetching user...');
    api
      .get('/auth/me')
      .then((res) => {
        console.log('✅ AuthContext: User loaded:', res.data);
        setUser(res.data);
      })
      .catch((err) => {
        console.error('❌ AuthContext: Error fetching user:', err);
        localStorage.removeItem('smf_token');
      })
      .finally(() => {
        console.log('🔍 AuthContext: Setting loading=false');
        setLoading(false);
      });
  }, []);

  async function login(email, password) {
    console.log('🔍 AuthContext: Login attempt for:', email);
    const res = await api.post('/auth/login', { email, password });
    localStorage.setItem('smf_token', res.data.token);
    setUser(res.data.user);
    console.log('✅ AuthContext: Login successful');
    return res.data.user;
  }

  async function register(payload) {
    console.log('🔍 AuthContext: Register attempt');
    const res = await api.post('/auth/register', payload);
    localStorage.setItem('smf_token', res.data.token);
    setUser(res.data.user);
    return res.data.user;
  }

  function logout() {
    console.log('🔍 AuthContext: Logout');
    localStorage.removeItem('smf_token');
    setUser(null);
  }

  if (loading) {
    console.log('🔍 AuthContext: Still loading...');
    return <div>Loading...</div>;
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
