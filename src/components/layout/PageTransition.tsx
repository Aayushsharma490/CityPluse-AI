import React from 'react';
import { motion } from 'framer-motion';
import { useReducedMotion } from '../../hooks/useReducedMotion';

interface PageTransitionProps {
  children: React.ReactNode;
}

export const PageTransition: React.FC<PageTransitionProps> = ({ children }) => {
  const prefersReduced = useReducedMotion();

  const animationProps = prefersReduced
    ? {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        transition: { duration: 0.15 }
      }
    : {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -20 },
        transition: { duration: 0.25, ease: 'easeOut' }
      };

  return (
    <motion.div
      {...animationProps}
      className="w-full flex-grow flex flex-col"
    >
      {children}
    </motion.div>
  );
};
export default PageTransition;
