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

interface SpeedDialContextType {
  items: SpeedDialItem[];
  folders: Folder[];
  addItem: (item: SpeedDialItem) => void;
  addFolder: (folder: Folder) => void;
}

const SpeedDialContext = createContext<SpeedDialContextType | null>(null);

export const SpeedDialProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<SpeedDialItem[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);

  const addItem = (item: SpeedDialItem) => setItems((prev) => [...prev, item]);
  const addFolder = (folder: Folder) => setFolders((prev) => [...prev, folder]);

  return (
    <SpeedDialContext.Provider value={{ items, folders, addItem, addFolder }}>
      {children}
    </SpeedDialContext.Provider>
  );
};

export const useSpeedDial = () => {
  const ctx = useContext(SpeedDialContext);
  if (!ctx) throw new Error("useSpeedDial must be used inside SpeedDialProvider");
  return ctx;
};
