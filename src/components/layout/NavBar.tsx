import React, { useState, useEffect } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useReducedMotion } from '../../hooks/useReducedMotion';

export const NavBar: React.FC = () => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const location = useLocation();
  const prefersReduced = useReducedMotion();

  // Close mobile drawer on route change
  useEffect(() => {
    setIsMobileOpen(false);
  }, [location.pathname]);

  // Accessibility: Close drawer on Escape key press
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsMobileOpen(false);
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, []);

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/citizen', label: 'Citizen Portal' },
    { to: '/govt', label: 'Govt Control Room' },
  ];

  const activeStyle = "text-cp-teal font-semibold";
  const inactiveStyle = "text-cp-text-secondary hover:text-cp-text-primary transition-colors duration-150";

  const drawerVariants = prefersReduced
    ? {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        transition: { duration: 0.15 }
      }
    : {
        initial: { opacity: 0, y: -20 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -20 },
        transition: { duration: 0.25, ease: 'easeOut' }
      };

  return (
    <nav className="sticky top-0 z-50 w-full bg-cp-base/90 backdrop-blur-md border-b border-cp-border h-16 flex items-center">
      <div className="max-w-7xl mx-auto w-full px-6 flex items-center justify-between">
        
        {/* Left Side: Brand Logo Wordmark */}
        <Link 
          to="/" 
          className="flex items-center gap-1.5 focus-visible:outline focus-visible:outline-3 focus-visible:outline-cp-teal focus-visible:outline-offset-2 rounded"
          aria-label="CityPulse AI Home"
        >
          <span className="font-display font-bold text-[1.25rem] tracking-tight text-cp-text-primary">
            CityPulse <span className="text-cp-teal">AI</span>
          </span>
        </Link>

        {/* Right Side: Desktop Navigation Links */}
        <div className="hidden md:flex items-center gap-8 font-body text-body-sm">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) => 
                `focus-visible:outline focus-visible:outline-3 focus-visible:outline-cp-teal focus-visible:outline-offset-2 rounded px-1.5 py-0.5 ${isActive ? activeStyle : inactiveStyle}`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </div>

        {/* Mobile Toggle Button */}
        <button
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="md:hidden p-1.5 text-cp-text-secondary hover:text-cp-text-primary focus-visible:outline focus-visible:outline-3 focus-visible:outline-cp-teal focus-visible:outline-offset-2 rounded"
          aria-expanded={isMobileOpen}
          aria-label={isMobileOpen ? 'Close Menu' : 'Open Menu'}
        >
          {isMobileOpen ? <X size={24} aria-hidden="true" /> : <Menu size={24} aria-hidden="true" />}
        </button>

      </div>

      {/* Mobile Slide-Down Drawer */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            {...drawerVariants}
            className="absolute top-16 left-0 right-0 w-full bg-cp-surface border-b border-cp-border shadow-lg z-40 md:hidden overflow-hidden"
          >
            <div className="flex flex-col p-6 gap-4 font-body text-body-md">
              {navLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) => 
                    `px-3 py-2 rounded-btn focus-visible:outline focus-visible:outline-3 focus-visible:outline-cp-teal ${isActive ? 'bg-cp-surface-2 text-cp-teal font-semibold' : 'text-cp-text-secondary hover:bg-cp-surface-2/50 hover:text-cp-text-primary transition-colors'}`
                  }
                >
                  {link.label}
                </NavLink>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};
export default NavBar;
