import { createContext, useContext, useState } from "react";

const AppContext = createContext(null);

export const RefreshContext = ({ children }) => {
  const [refreshScreen, setRefreshScreen] = useState(null);
  const [refreshContext, setRefreshContext] = useState(false);

  return (
    <AppContext.Provider
      value={{
        refreshScreen,
        setRefreshScreen,
        refreshContext,
        setRefreshContext,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);
