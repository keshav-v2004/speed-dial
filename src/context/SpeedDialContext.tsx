import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

/**
 * Types
 */
export interface SpeedDialItem {
  id: string;
  title: string;
  url: string;
  image: string; // base64 or URL
}

// Folder interface removed (folders no longer supported)

export interface UserSettings {
  background: string | null;
  darkMode: boolean;
  gridSize: "small" | "medium" | "large";
  enableSync: boolean;
}

export interface DashboardState {
  items: SpeedDialItem[];
  order: string[]; // list of item ids in display order
  settings: UserSettings;
}


const DEFAULT_STATE: DashboardState = {
  items: [],
  order: [],
  settings: {
    background: null,
    darkMode: false,
    gridSize: "medium",
    enableSync: false,
  },
};

type SpeedDialContextType = {
  state: DashboardState;
  addItem: (item: SpeedDialItem) => void;
  deleteItem: (itemId: string) => void;
  updateItem: (itemId: string, patch: Partial<SpeedDialItem>) => void;
  setOrder: (newOrder: string[]) => void;
  updateSettings: (patch: Partial<UserSettings>) => void;
  setState: (next: DashboardState | ((prev: DashboardState) => DashboardState)) => void;
};

const SpeedDialContext = createContext<SpeedDialContextType | undefined>(undefined);

/**
 * Helper utilities
 */
const STORAGE_KEY = "speedDialDashboard_v1";

function hydrateState(): DashboardState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STATE;
    const parsed: any = JSON.parse(raw);

    const existingItems: SpeedDialItem[] = Array.isArray(parsed.items) ? parsed.items : [];
    const folders: any[] = Array.isArray(parsed.folders) ? parsed.folders : [];

    // Flatten folder items into root items (avoid duplicates by id)
    const folderItems: SpeedDialItem[] = folders.flatMap(f => Array.isArray(f.items) ? f.items : []);
    const allItemsMap = new Map<string, SpeedDialItem>();
    [...existingItems, ...folderItems].forEach(it => { if (it && it.id) allItemsMap.set(it.id, it); });
    const allItems = Array.from(allItemsMap.values());

    // Build order by expanding folder ids into their item ids preserving order
    const rawOrder: string[] = Array.isArray(parsed.order) ? parsed.order : [];
    const folderMap = new Map<string, SpeedDialItem[]>(folders.map(f => [f.id, (Array.isArray(f.items) ? f.items : [])]));
    const expandedOrder: string[] = [];
    rawOrder.forEach(id => {
      if (folderMap.has(id)) {
        folderMap.get(id)!.forEach(item => { if (!expandedOrder.includes(item.id)) expandedOrder.push(item.id); });
      } else {
        if (!expandedOrder.includes(id)) expandedOrder.push(id);
      }
    });
    // Ensure all items appear at least once
    allItems.forEach(it => { if (!expandedOrder.includes(it.id)) expandedOrder.push(it.id); });

    return {
      items: allItems,
      order: expandedOrder,
      settings: parsed.settings ?? DEFAULT_STATE.settings,
    };
  } catch (e) {
    console.error("Failed to load state:", e);
    return DEFAULT_STATE;
  }
}

/**
 * Provider
 */
export const SpeedDialProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<DashboardState>(() => hydrateState());

  // persist, debounced
  useEffect(() => {
    const t = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      } catch (e) {
        console.error("Failed to save state:", e);
      }
    }, 120);
    return () => clearTimeout(t);
  }, [state]);

  // Item operations 
  const addItem = (item: SpeedDialItem) => {
    setState(prev => {
      const items = [...prev.items, item];
      const order = prev.order.includes(item.id) ? prev.order : [...prev.order, item.id];
      return { ...prev, items, order };
    });
  };

  const deleteItem = (itemId: string) => {
    setState(prev => {
      const items = prev.items.filter(i => i.id !== itemId);
      const order = prev.order.filter(id => id !== itemId);
      return { ...prev, items, order };
    });
  };

  const updateItem = (itemId: string, patch: Partial<SpeedDialItem>) => {
    setState(prev => ({
      ...prev,
      items: prev.items.map(i => i.id === itemId ? { ...i, ...patch } : i)
    }));
  };

  // moveItemToRoot no longer needed (folders removed)

  // All folder-related operations removed.

  // Ordering / settings / raw setter 
  const setOrder = (newOrder: string[]) => {
    setState((prev) => ({ ...prev, order: newOrder }));
  };

  const updateSettings = (patch: Partial<UserSettings>) => {
    setState((prev) => ({ ...prev, settings: { ...prev.settings, ...patch } }));
  };

  const contextValue: SpeedDialContextType = {
    state,
    addItem,
    deleteItem,
    updateItem,
    setOrder,
    updateSettings,
    setState,
  };


  return <SpeedDialContext.Provider value={contextValue}>{children}</SpeedDialContext.Provider>;
};

/**
 * Hook
 */
export const useSpeedDial = (): SpeedDialContextType => {
  const ctx = useContext(SpeedDialContext);
  if (!ctx) {
    throw new Error("useSpeedDial must be used inside SpeedDialProvider");
  }
  return ctx;
};
