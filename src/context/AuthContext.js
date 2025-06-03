import React from 'react';

export const AuthContext = React.createContext();

export const AuthProvider = ({ children }) => {
  const [isVisitor, setIsVisitor] = React.useState(false);
  const [user, setUser] = React.useState(null);

  const enterVisitorMode = () => {
    setIsVisitor(true);
  };

  const exitVisitorMode = () => {
    setIsVisitor(false);
  };

  const signOut = () => {
    setUser(null);
    setIsVisitor(false);
  };

  const isAdmin = () => {
    return user && (user.rol === 'admin' || user.tipo === 'empresa');
  };

  return (
    <AuthContext.Provider value={{ 
      isVisitor, 
      user, 
      enterVisitorMode, 
      exitVisitorMode, 
      signOut,
      setUser,
      isAdmin
    }}>
      {children}
    </AuthContext.Provider>
  );
};