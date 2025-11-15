import React, { createContext, useContext, useState, type ReactNode } from "react";

export interface SpeedDialItem {
  id: string;
  title: string;
  url: string;
  image: string; // base64 or URL
}

export interface Folder {
  id: string;
  name: string;
  items: SpeedDialItem[];
}

export interface AppState {
  order: string[];  // array of item+folder IDs in visible order
}

interface SpeedDialContextType {
  items: SpeedDialItem[];
  folders: Folder[];
  addItem: (item: SpeedDialItem) => void;
  addFolder: (folder: Folder) => void;
  order: string[];
  setOrder: React.Dispatch<React.SetStateAction<string[]>>;
}



const SpeedDialContext = createContext<SpeedDialContextType | null>(null);

export const SpeedDialProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<SpeedDialItem[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [order, setOrder] = useState<string[]>([]);


  const addItem = (item: SpeedDialItem) => {
  setItems(prev => [...prev, item]);
  setOrder(prev => [...prev, item.id]);
};

  const addFolder = (folder: Folder) => {
  setFolders(prev => [...prev, folder]);
  setOrder(prev => [...prev, folder.id]);
};

  

  return (
    <SpeedDialContext.Provider value={{ items, folders, addItem, addFolder, order, setOrder }}>
      {children}
    </SpeedDialContext.Provider>
  );
};

export const useSpeedDial = () => {
  const ctx = useContext(SpeedDialContext);
  if (!ctx) throw new Error("useSpeedDial must be used inside SpeedDialProvider");
  return ctx;
};
