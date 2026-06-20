import React from 'react';
import NavBar from './NavBar';

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-cp-base flex flex-col font-body selection:bg-cp-teal/30 selection:text-cp-teal text-cp-text-primary">
      <NavBar />
      
      <main className="flex-grow flex flex-col">
        {children}
      </main>
      
      <footer className="w-full py-6 border-t border-cp-border bg-cp-base text-center text-body-sm text-cp-text-muted">
        <div className="max-w-7xl mx-auto px-6">
          &copy; {new Date().getFullYear()} CityPulse AI · Open-source civic intelligence dashboard.
        </div>
      </footer>
    </div>
  );
};
export default AppLayout;
