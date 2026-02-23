import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useCallback,
} from "react";

interface LayoutContextType {
  headerRight: ReactNode;
  setHeaderRight: (content: ReactNode) => void;
  clearHeaderRight: () => void;
}

const LayoutContext = createContext<LayoutContextType>({
  headerRight: null,
  setHeaderRight: () => {},
  clearHeaderRight: () => {},
});

export function LayoutProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [headerRight, setHeaderRightState] =
    useState<ReactNode>(null);

  const setHeaderRight = useCallback((content: ReactNode) => {
    setHeaderRightState(content);
  }, []);

  const clearHeaderRight = useCallback(() => {
    setHeaderRightState(null);
  }, []);

  return (
    <LayoutContext.Provider
      value={{ headerRight, setHeaderRight, clearHeaderRight }}
    >
      {children}
    </LayoutContext.Provider>
  );
}

export function useLayout() {
  return useContext(LayoutContext);
}