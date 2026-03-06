import React, { createContext, useContext, useState, useMemo } from 'react';
import defaultContent from '@/data/content.json';

const ContentContext = createContext<any>(null);

export const ContentProvider = ({ children }: any) => {
  const [content, setContent] = useState(defaultContent);
  const [isEditing, setIsEditing] = useState(false);
  const [activeEditSection, setActiveEditSection] = useState<string | null>(null);
  const [activeEditItem, setActiveEditItem] = useState<any | null>(null);

  const value = useMemo(() => ({ 
    content, setContent, 
    isEditing, setIsEditing, 
    activeEditSection, setActiveEditSection,
    activeEditItem, setActiveEditItem
  }), [content, isEditing, activeEditSection, activeEditItem]);

  return (
    <ContentContext.Provider value={value}>
      {children}
    </ContentContext.Provider>
  );
};

export const useContent = () => useContext(ContentContext);
