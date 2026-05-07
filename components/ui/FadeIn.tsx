'use client';

import React from 'react';

interface FadeInProps {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}

export const FadeIn: React.FC<FadeInProps> = ({ children, className = '' }) => {
  return (
    <div className={`opacity-100 translate-y-0 ${className}`}>
      {children}
    </div>
  );
};
