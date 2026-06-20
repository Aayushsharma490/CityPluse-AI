import React from 'react';

interface SkeletonProps {
  width?: string;
  height?: string;
  borderRadius?: string;
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = '16px',
  borderRadius = 'rounded',
  className = '',
}) => {
  return (
    <div
      className={`animate-pulse bg-cp-border ${borderRadius} ${className}`}
      style={{ width, height }}
    />
  );
};

export const SkeletonCircle: React.FC<{ size?: string; className?: string }> = ({
  size = '40px',
  className = '',
}) => {
  return (
    <Skeleton
      width={size}
      height={size}
      borderRadius="rounded-full"
      className={className}
    />
  );
};

export const SkeletonBlock: React.FC<{ lines?: number; className?: string }> = ({
  lines = 3,
  className = '',
}) => {
  return (
    <div className={`flex flex-col gap-2.5 w-full ${className}`}>
      {Array.from({ length: lines }).map((_, i) => {
        const width = i === lines - 1 ? '60%' : '100%';
        return (
          <Skeleton
            key={i}
            width={width}
            height={i === 0 ? '24px' : '16px'}
            className="first:mb-1"
          />
        );
      })}
    </div>
  );
};
export default Skeleton;
