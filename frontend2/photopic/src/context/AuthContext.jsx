import { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('mock_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = (displayName, email) => {
    const mockUser = {
      displayName: displayName || email.split('@')[0] || 'Mock User',
      email: email || 'mock@example.com',
      photoURL: null,
      uid: 'mock-user-id'
    };
    setUser(mockUser);
    localStorage.setItem('mock_user', JSON.stringify(mockUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('mock_user');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, USE_FIREBASE: false }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
