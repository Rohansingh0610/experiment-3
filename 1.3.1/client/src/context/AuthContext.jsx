import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

/**
 * Educational Utility: Decode Base64URL segment of a JWT
 * NOTE: Decoding a token in client code merely inspects the payload claims.
 * It DOES NOT verify the signature. True security relies exclusively on backend verification!
 */
export function decodeJwtPayload(token) {
  if (!token) return null;
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

export function decodeJwtHeader(token) {
  if (!token) return null;
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const base64Url = parts[0];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(base64));
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  // Use sessionStorage so the token is automatically wiped when the browser tab closes
  const [token, setToken] = useState(() => sessionStorage.getItem('jwt_token') || null);
  const [user, setUser] = useState(() => {
    const savedUser = sessionStorage.getItem('user_data');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const isAuthenticated = !!token;

  // Sync token and user in sessionStorage
  const login = (newToken, newUser) => {
    sessionStorage.setItem('jwt_token', newToken);
    sessionStorage.setItem('user_data', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  };

  const logout = () => {
    sessionStorage.removeItem('jwt_token');
    sessionStorage.removeItem('user_data');
    setToken(null);
    setUser(null);
  };

  // Re-sync if changed externally
  useEffect(() => {
    const storedToken = sessionStorage.getItem('jwt_token');
    const storedUser = sessionStorage.getItem('user_data');
    if (storedToken && !token) {
      setToken(storedToken);
      if (storedUser) setUser(JSON.parse(storedUser));
    }
  }, [token]);

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        isAuthenticated,
        login,
        logout,
        decodedPayload: decodeJwtPayload(token),
        decodedHeader: decodeJwtHeader(token),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
