import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { ReducedMotionProvider } from './context/ReducedMotionContext';
import { ComplaintsProvider } from './context/ComplaintsContext';

// Lazy loaded page imports
const LandingPage = lazy(() => import('./pages/LandingPage'));
const CitizenDashboard = lazy(() => import('./pages/CitizenDashboard'));
const GovtDashboard = lazy(() => import('./pages/GovtDashboard'));
const TimelinePage = lazy(() => import('./pages/TimelinePage'));

// Full screen loader spinner
const SuspenseLoader: React.FC = () => (
  <div className="fixed inset-0 bg-cp-base flex flex-col items-center justify-center text-cp-teal z-[9999]" aria-live="polite">
    <Loader2 className="animate-spin h-10 w-10 mb-2" />
    <span className="font-display font-medium text-body-sm tracking-wider">Syncing Dashboard Feeds...</span>
  </div>
);

const AnimatedRoutes: React.FC = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route 
          path="/" 
          element={
            <Suspense fallback={<SuspenseLoader />}>
              <LandingPage />
            </Suspense>
          } 
        />
        <Route 
          path="/citizen" 
          element={
            <Suspense fallback={<SuspenseLoader />}>
              <CitizenDashboard />
            </Suspense>
          } 
        />
        <Route 
          path="/govt" 
          element={
            <Suspense fallback={<SuspenseLoader />}>
              <GovtDashboard />
            </Suspense>
          } 
        />
        <Route 
          path="/timeline/:id" 
          element={
            <Suspense fallback={<SuspenseLoader />}>
              <TimelinePage />
            </Suspense>
          } 
        />
        {/* Redirect old legacy routes to new dashboards */}
        <Route path="/intake" element={<Navigate to="/citizen" replace />} />
        <Route path="/dashboard" element={<Navigate to="/govt" replace />} />
        <Route path="/analytics" element={<Navigate to="/govt" replace />} />
        
        {/* Redirect unknown routes to Landing page */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
};

export default function App() {
  return (
    <ReducedMotionProvider>
      <ComplaintsProvider>
        <BrowserRouter>
          <AnimatedRoutes />
        </BrowserRouter>
      </ComplaintsProvider>
    </ReducedMotionProvider>
  );
}
