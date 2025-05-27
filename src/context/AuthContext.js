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

  return (
    <AuthContext.Provider value={{ 
      isVisitor, 
      user, 
      enterVisitorMode, 
      exitVisitorMode, 
      signOut,
      setUser 
    }}>
      {children}
    </AuthContext.Provider>
  );
};