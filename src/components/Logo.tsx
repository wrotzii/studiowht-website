import React from 'react';
import logo from '@/assets/logo.png';

const Logo = ({ className = '' }: { className?: string }) => (
  <img 
    src={logo} 
    alt="STUDIOWHT Logo" 
    loading="eager"
    fetchPriority="high"
    className={className}
  />
);

export default Logo;
