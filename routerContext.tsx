import { createContext, useContext, useState, ReactNode, useCallback } from 'react';

export type Route =
  | { name: 'dashboard' }
  | { name: 'analyze'; strategyId?: string }
  | { name: 'result'; analysisId: string }
  | { name: 'history' }
  | { name: 'strategy'; strategyId: string }
  | { name: 'market' }
  | { name: 'settings' };

interface RouterContextValue {
  route: Route;
  navigate: (route: Route) => void;
}

const RouterContext = createContext<RouterContextValue | undefined>(undefined);

export function RouterProvider({ children }: { children: ReactNode }) {
  const [route, setRoute] = useState<Route>({ name: 'dashboard' });

  const navigate = useCallback((r: Route) => {
    setRoute(r);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <RouterContext.Provider value={{ route, navigate }}>
      {children}
    </RouterContext.Provider>
  );
}

export function useRouter() {
  const ctx = useContext(RouterContext);
  if (!ctx) throw new Error('useRouter must be used within RouterProvider');
  return ctx;
}
