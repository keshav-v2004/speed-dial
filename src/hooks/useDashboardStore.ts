import { useEffect, useState } from "react";
import type { DashboardState, SpeedDialItem, Group, UserSettings } from "../utils/types";
import { loadState, saveState } from "../utils/storage";

const defaultState: DashboardState = {
  items: [],
  groups: [],
  settings: {
    background: null,
    darkMode: false,
    gridSize: "medium",
    enableSync: false,
  },
};

export function useDashboardStore() {
  const [state, setState] = useState<DashboardState>(() =>
    loadState(defaultState)
  );

  // Save to localStorage whenever state changes
  useEffect(() => {
    const timeout = setTimeout(() => {
      saveState(state);
    }, 150); // debounced save

    return () => clearTimeout(timeout);
  }, [state]);

  // ----- ITEM OPERATIONS -----
  const addItem = (item: SpeedDialItem) => {
    setState((prev) => ({
      ...prev,
      items: [...prev.items, item],
    }));
  };

  const deleteItem = (id: string) => {
    setState((prev) => ({
      ...prev,
      items: prev.items.filter((x) => x.id !== id),
    }));
  };

  const updateItem = (id: string, updated: Partial<SpeedDialItem>) => {
    setState((prev) => ({
      ...prev,
      items: prev.items.map((x) =>
        x.id === id ? { ...x, ...updated } : x
      ),
    }));
  };

  const reorderItems = (newOrder: SpeedDialItem[]) => {
    setState((prev) => ({
      ...prev,
      items: newOrder,
    }));
  };

  // ----- GROUP OPERATIONS -----
  const createGroup = (group: Group) => {
    setState((prev) => ({
      ...prev,
      groups: [...prev.groups, group],
    }));
  };

  const deleteGroup = (groupId: string) => {
    setState((prev) => ({
      ...prev,
      groups: prev.groups.filter((g) => g.id !== groupId),
    }));
  };

  const addItemToGroup = (groupId: string, item: SpeedDialItem) => {
    setState((prev) => ({
      ...prev,
      groups: prev.groups.map((g) =>
        g.id === groupId
          ? { ...g, items: [...g.items, item] }
          : g
      ),
    }));
  };

  const removeItemFromGroup = (groupId: string, itemId: string) => {
    setState((prev) => ({
      ...prev,
      groups: prev.groups.map((g) =>
        g.id === groupId
          ? { ...g, items: g.items.filter((i) => i.id !== itemId) }
          : g
      ),
    }));
  };

  // ----- SETTINGS -----
  const updateSettings = (settings: Partial<UserSettings>) => {
    setState((prev) => ({
      ...prev,
      settings: {
        ...prev.settings,
        ...settings,
      },
    }));
  };

  return {
    state,
    setState,

    addItem,
    deleteItem,
    updateItem,
    reorderItems,

    createGroup,
    deleteGroup,
    addItemToGroup,
    removeItemFromGroup,

    updateSettings,
  };
}
