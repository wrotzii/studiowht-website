import React from 'react';
import logo from '@/assets/logo.png';

interface LogoProps {
  className?: string;
  style?: React.CSSProperties;
  alt?: string;
  loading?: "lazy" | "eager";
  decoding?: "async" | "auto" | "sync";
  [key: string]: any;
}

const Logo = ({ className = '', style, ...props }: LogoProps) => {
  const [imgSrc, setImgSrc] = React.useState(logo);

  const handleError = () => {
    if (imgSrc !== '/media/logo.png') {
      setImgSrc('/media/logo.png');
    }
  };

  return (
    <img 
      src={imgSrc} 
      alt="STUDIOWHT Logo" 
      loading="eager"
      fetchPriority="high"
      referrerPolicy="no-referrer"
      className={className}
      style={style}
      onError={handleError}
      {...props}
    />
  );
};

export default Logo;
