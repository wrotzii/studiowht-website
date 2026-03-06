import React, { createContext, useContext, useState } from 'react';
import defaultContent from '@/data/content.json';

const ContentContext = createContext<any>(null);

export const ContentProvider = ({ children }: any) => {
  const [content, setContent] = useState(defaultContent);
  const [isEditing, setIsEditing] = useState(false);
  const [activeEditSection, setActiveEditSection] = useState<string | null>(null);
  const [activeEditItem, setActiveEditItem] = useState<any | null>(null);

  return (
    <ContentContext.Provider value={{ 
      content, setContent, 
      isEditing, setIsEditing, 
      activeEditSection, setActiveEditSection,
      activeEditItem, setActiveEditItem
    }}>
      {children}
    </ContentContext.Provider>
  );
};

export const useContent = () => useContext(ContentContext);
