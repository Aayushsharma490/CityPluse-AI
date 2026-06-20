import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  onClick?: (e: React.MouseEvent<HTMLDivElement> | React.KeyboardEvent<HTMLDivElement>) => void;
}

export const Card: React.FC<CardProps> = ({ children, className = '', onClick, ...props }) => {
  const isClickable = !!onClick;
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (onClick && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      onClick(e);
    }
  };
  
  return (
    <div
      onClick={onClick}
      onKeyDown={handleKeyDown}
      tabIndex={isClickable ? 0 : undefined}
      className={`
        bg-cp-surface border border-cp-border rounded-card p-card-pad shadow-card
        transition-all duration-150 ease-out
        ${isClickable ? 'cursor-pointer hover:-translate-y-1 hover:shadow-card-hover hover:border-cp-border-glow focus-visible:outline focus-visible:outline-3 focus-visible:outline-cp-teal focus-visible:outline-offset-2' : ''}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
};
export default Card;
