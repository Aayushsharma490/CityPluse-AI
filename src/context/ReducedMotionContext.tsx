import React, { createContext, useContext, useEffect, useState } from 'react';

const ReducedMotionContext = createContext<boolean>(false);

export const ReducedMotionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const listener = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    // Support both addEventListener and addListener for compatibility
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', listener);
      return () => mediaQuery.removeEventListener('change', listener);
    } else {
      // @ts-ignore
      mediaQuery.addListener(listener);
      // @ts-ignore
      return () => mediaQuery.removeListener(listener);
    }
  }, []);

  return (
    <ReducedMotionContext.Provider value={prefersReducedMotion}>
      {children}
    </ReducedMotionContext.Provider>
  );
};

export const useReducedMotion = () => {
  return useContext(ReducedMotionContext);
};
export default ReducedMotionContext;
