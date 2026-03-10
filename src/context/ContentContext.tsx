import React, { createContext, useContext, useState, useMemo } from 'react';
import defaultContent from '@/data/content.json';

const ContentContext = createContext<any>(null);

export const ContentProvider = ({ children }: any) => {
  const [content, setContent] = useState(defaultContent);

  const value = useMemo(() => ({ 
    content, setContent
  }), [content]);

  return (
    <ContentContext.Provider value={value}>
      {children}
    </ContentContext.Provider>
  );
};

export const useContent = () => useContext(ContentContext);
