import React, { useRef, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useReducedMotion } from '../../hooks/useReducedMotion';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  disabled,
  className = '',
  ...props
}) => {
  const baseStyle = "inline-flex items-center justify-center font-display rounded-btn font-medium transition-all duration-150 focus-visible:outline focus-visible:outline-3 focus-visible:outline-cp-teal focus-visible:outline-offset-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer";
  
  const variantStyles = {
    primary: "bg-cp-teal hover:bg-cp-teal-dim text-cp-base font-bold shadow-sm active:scale-95",
    secondary: "border border-cp-teal text-cp-teal hover:bg-cp-teal/10 active:scale-95",
  };
  
  const sizeStyles = {
    sm: "px-3 py-1.5 text-body-sm",
    md: "px-4 py-2 text-body-md",
    lg: "px-6 py-3 text-body-lg",
  };

  return (
    <button
      disabled={disabled || loading}
      className={`${baseStyle} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin text-current" />}
      {!loading && icon && <span className="mr-2">{icon}</span>}
      {children}
    </button>
  );
};

// MagneticButton Wrapper
export const MagneticButton: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const buttonRef = useRef<HTMLDivElement>(null);
  const prefersReduced = useReducedMotion();
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (prefersReduced || !buttonRef.current) return;
    const { clientX, clientY } = e;
    const { left, top, width, height } = buttonRef.current.getBoundingClientRect();
    const centerX = left + width / 2;
    const centerY = top + height / 2;
    
    const dx = clientX - centerX;
    const dy = clientY - centerY;
    
    // Clamp offset to 8px max
    const maxOffset = 8;
    const offsetX = Math.max(-maxOffset, Math.min(maxOffset, dx * 0.15));
    const offsetY = Math.max(-maxOffset, Math.min(maxOffset, dy * 0.15));
    
    setPosition({ x: offsetX, y: offsetY });
  };

  const handleMouseLeave = () => {
    setPosition({ x: 0, y: 0 });
  };

  const style = prefersReduced
    ? {}
    : {
        transform: `translate(${position.x}px, ${position.y}px)`,
        transition: position.x === 0 && position.y === 0 ? 'transform 200ms ease-out' : 'none',
      };

  return (
    <div
      ref={buttonRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="inline-block"
      style={style}
    >
      {children}
    </div>
  );
};
export default Button;
