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

export interface Folder {
  id: string;
  name: string;
  items: SpeedDialItem[];
}

export interface UserSettings {
  background: string | null;
  darkMode: boolean;
  gridSize: "small" | "medium" | "large";
  enableSync: boolean;
}

export interface DashboardState {
  items: SpeedDialItem[];
  folders: Folder[];
  order: string[]; // combined list of item and folder ids in display order
  settings: UserSettings;
}


const DEFAULT_STATE: DashboardState = {
  items: [],
  folders: [],
  order: [],
  settings: {
    background: null,
    darkMode: false,
    gridSize: "medium",
    enableSync: false,
  },
};

type SpeedDialContextType = {
  // state
  state: DashboardState;

  // item ops
  addItem: (item: SpeedDialItem) => void;
  deleteItem: (itemId: string) => void;
  updateItem: (itemId: string, patch: Partial<SpeedDialItem>) => void;
  moveItemToRoot: (item: SpeedDialItem, index?: number) => void;

  // folder ops
  createFolder: (folder: Folder) => void;
  deleteFolder: (folderId: string) => void;
  renameFolder: (folderId: string, name: string) => void;

  // folder item ops
  addItemToFolder: (folderId: string, item: SpeedDialItem) => void;
  removeItemFromFolder: (folderId: string, itemId: string) => void;
  removeTabFromFolder: (folderId: string, itemId: string) => void;
  reorderFolderItems: (folderId: string, itemIds: string[]) => void;
  groupItemsIntoFolder: (itemIds: string[], name?: string) => void;

  // ordering
  setOrder: (newOrder: string[]) => void;

  // settings
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
    const parsed = JSON.parse(raw) as DashboardState;

    // Basic sanity: ensure arrays exist
    return {
      items: parsed.items ?? [],
      folders: parsed.folders ?? [],
      order: parsed.order ?? [],
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
    setState((prev) => {
      const items = [...prev.items, item];
      const order = prev.order.includes(item.id) ? prev.order : [...prev.order, item.id];
      return { ...prev, items, order };
    });
  };

  const deleteItem = (itemId: string) => {
    setState((prev) => {
      // remove from root items
      const items = prev.items.filter((i) => i.id !== itemId);

      // remove from any folder that contains it
      const folders = prev.folders.map((f) => ({ ...f, items: f.items.filter((it) => it.id !== itemId) }));

      // remove from order
      const order = prev.order.filter((id) => id !== itemId);

      return { ...prev, items, folders, order };
    });
  };

  const updateItem = (itemId: string, patch: Partial<SpeedDialItem>) => {
    setState((prev) => {
      const items = prev.items.map((i) => (i.id === itemId ? { ...i, ...patch } : i));
      const folders = prev.folders.map((f) => ({
        ...f,
        items: f.items.map((it) => (it.id === itemId ? { ...it, ...patch } : it)),
      }));
      return { ...prev, items, folders };
    });
  };

  const moveItemToRoot = (item: SpeedDialItem, index?: number) => {
    setState((prev) => {
      // ensure item is present in items
      const items = prev.items.some((i) => i.id === item.id) ? prev.items : [...prev.items, item];

      // remove from folders
      const folders = prev.folders.map((f) => ({ ...f, items: f.items.filter((it) => it.id !== item.id) }));

      // insert into order if not present
      let order = prev.order.filter((id) => id !== item.id);
      if (typeof index === "number" && index >= 0 && index <= order.length) {
        order = [...order.slice(0, index), item.id, ...order.slice(index)];
      } else {
        order = [...order, item.id];
      }

      return { ...prev, items, folders, order };
    });
  };

  // Folder operations 
  const createFolder = (folder: Folder) => {
    setState((prev) => {
      const folders = [...prev.folders, folder];
      const order = prev.order.includes(folder.id) ? prev.order : [...prev.order, folder.id];
      return { ...prev, folders, order };
    });
  };

  const deleteFolder = (folderId: string) => {
    setState((prev) => {
      const folders = prev.folders.filter((f) => f.id !== folderId);
      const order = prev.order.filter((id) => id !== folderId);
      return { ...prev, folders, order };
    });
  };

  const renameFolder = (folderId: string, name: string) => {
    setState((prev) => {
      const folders = prev.folders.map((f) => (f.id === folderId ? { ...f, name } : f));
      return { ...prev, folders };
    });
  };

  // Folder item operations 
  const addItemToFolder = (folderId: string, item: SpeedDialItem) => {
    setState((prev) => {
      // remove item from root (if present)
      const items = prev.items.filter((i) => i.id !== item.id);

      // add to folder
      const folders = prev.folders.map((f) =>
        f.id === folderId ? { ...f, items: [...f.items, item] } : f
      );

      // ensure order doesn't include the item (item is inside folder)
      const order = prev.order.filter((id) => id !== item.id);

      return { ...prev, items, folders, order };
    });
  };

  const removeItemFromFolder = (folderId: string, itemId: string) => {
    setState((prev) => {
      const folders = prev.folders.map((f) =>
        f.id === folderId ? { ...f, items: f.items.filter((it) => it.id !== itemId) } : f
      );


      const previouslyFound =
        prev.folders
          .flatMap((f) => f.items)
          .find((it) => it.id === itemId) ?? null;

      let items = prev.items;
      let order = prev.order;

      if (previouslyFound) {
        // add to root items (if not present)
        if (!prev.items.some((it) => it.id === itemId)) {
          items = [...prev.items, previouslyFound];
        }
        if (!order.includes(itemId)) {
          order = [...order, itemId];
        }
      }

      return { ...prev, folders, items, order };
    });
  };

  const reorderFolderItems = (folderId: string, itemIds: string[]) => {
    setState((prev) => {
      const folders = prev.folders.map((f) =>
        f.id === folderId
          ? {
              ...f,
              items: itemIds
                .map((id) => f.items.find((it) => it.id === id))
                .filter((it): it is SpeedDialItem => !!it),
            }
          : f
      );
      return { ...prev, folders };
    });
  };

  const groupItemsIntoFolder = (itemIds: string[], name?: string) => {
    setState((prev) => {
      const uniqueIds = itemIds.filter((id, idx, arr) => arr.indexOf(id) === idx);
      const rootItems = prev.items.filter((i) => uniqueIds.includes(i.id));
      if (rootItems.length === 0) return prev;
      const folderId = crypto.randomUUID();
      const folderName = name || (rootItems[0].title || 'Folder');
      const newFolder: Folder = { id: folderId, name: folderName, items: rootItems };

      // Remove items from root items list
      const remainingItems = prev.items.filter((i) => !uniqueIds.includes(i.id));

      // New folders list
      const folders = [...prev.folders, newFolder];

      // Order: replace first occurrence position of first item with folderId and remove other item ids
      const firstIndex = prev.order.findIndex((id) => id === uniqueIds[0]);
      let order = prev.order.filter((id) => !uniqueIds.includes(id));
      if (firstIndex >= 0) {
        order = [...order.slice(0, firstIndex), folderId, ...order.slice(firstIndex)];
      } else {
        order = [...order, folderId];
      }

      return { ...prev, items: remainingItems, folders, order };
    });
  };

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
    moveItemToRoot,

    createFolder,
    deleteFolder,
    renameFolder,

    addItemToFolder,
    removeItemFromFolder,

    // 👇 Add this alias
    removeTabFromFolder: removeItemFromFolder,
    reorderFolderItems,
    groupItemsIntoFolder,

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
