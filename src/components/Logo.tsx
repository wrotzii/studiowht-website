import React, { useState } from 'react';
import logo from '@/assets/logo.png';

interface LogoProps {
  className?: string;
  style?: React.CSSProperties;
  [key: string]: any;
}

const Logo = ({ className = '', style = {}, ...props }: LogoProps) => {
  const [hasError, setHasError] = useState(false);

  return (
    <div className={`flex items-center justify-center ${className}`} style={style} {...props}>
      {!hasError ? (
        <img 
          src={logo} 
          alt="STUDIOWHT" 
          className="max-h-full max-w-full w-auto h-auto object-contain block"
          onError={() => {
            console.error('Logo failed to load from assets');
            setHasError(true);
          }}
          referrerPolicy="no-referrer"
          loading="eager"
          fetchPriority="high"
        />
      ) : (
        <span className="font-black tracking-tighter text-xl md:text-2xl uppercase whitespace-nowrap">
          Studio<span className="text-emerald-500">WHT</span>
        </span>
      )}
    </div>
  );
};

export default Logo;
