import React from 'react';

const Logo = ({ className = '' }: { className?: string }) => (
  <img 
    src="/white_no_box_cropped.png" 
    alt="STUDIOWHT Logo" 
    loading="eager"
    fetchPriority="high"
    className={className}
  />
);

export default Logo;
