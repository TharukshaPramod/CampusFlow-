import { useCallback, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export interface User {
  id: string;
  email: string;
  name: string;
  picture?: string;
  roles: string[];
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Load token from localStorage on mount
  useEffect(() => {
    const savedToken = localStorage.getItem('authToken');
    if (savedToken) {
      setToken(savedToken);
      // Decode JWT to get user info
      try {
        const payload = JSON.parse(atob(savedToken.split('.')[1]));
        setUser({
          id: payload.sub,
          email: payload.email,
          name: payload.name,
          picture: payload.picture,
          roles: (payload.roles || []).map((r: string) => r.replace('ROLE_', ''))
        });
      } catch (e) {
        localStorage.removeItem('authToken');
      }
    }
    setLoading(false);
  }, []);

  const login = useCallback((jwtToken: string) => {
    localStorage.setItem('authToken', jwtToken);
    setToken(jwtToken);
    
    try {
      const payload = JSON.parse(atob(jwtToken.split('.')[1]));
      setUser({
        id: payload.sub,
        email: payload.email,
        name: payload.name,
        picture: payload.picture,
        roles: (payload.roles || []).map((r: string) => r.replace('ROLE_', ''))
      });
    } catch (e) {
      console.error('Failed to decode JWT', e);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('authToken');
    setToken(null);
    setUser(null);
    navigate('/login');
  }, [navigate]);

  return { user, token, loading, login, logout };
}
