import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface FocusModeContextType {
  isInFocusMode: boolean;
  setFocusMode: (isFocusing: boolean) => void;
}

const FocusModeContext = createContext<FocusModeContextType | undefined>(undefined);

export function FocusModeProvider({ children }: { children: ReactNode }): JSX.Element {
  const [isInFocusMode, setIsInFocusMode] = useState(false);

  const setFocusMode = useCallback((isFocusing: boolean) => {
    setIsInFocusMode(isFocusing);
  }, []);

  return (
    <FocusModeContext.Provider value={{ isInFocusMode, setFocusMode }}>
      {children}
    </FocusModeContext.Provider>
  );
}

export function useFocusMode(): FocusModeContextType {
  const context = useContext(FocusModeContext);
  if (!context) {
    throw new Error('useFocusMode must be used within FocusModeProvider');
  }
  return context;
}
