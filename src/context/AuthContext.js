import React from 'react';

export const AuthContext = React.createContext();

export const AuthProvider = ({ children }) => {
  const [isVisitor, setIsVisitor] = React.useState(false);

  const enterVisitorMode = () => {
    setIsVisitor(true);
  };

  const exitVisitorMode = () => {
    setIsVisitor(false);
  };

  return (
    <AuthContext.Provider value={{ isVisitor, enterVisitorMode, exitVisitorMode }}>
      {children}
    </AuthContext.Provider>
  );
};