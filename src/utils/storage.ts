const STORAGE_KEY = "speedDialDashboard";

export function saveState(state: any) {
  try {
    const json = JSON.stringify(state);
    localStorage.setItem(STORAGE_KEY, json);
  } catch (e) {
    console.error("Failed to save:", e);
  }
}

export function loadState<T>(defaultState: T): T {
  try {
    const json = localStorage.getItem(STORAGE_KEY);
    if (!json) return defaultState;
    return JSON.parse(json) as T;
  } catch (e) {
    console.error("Failed to load:", e);
    return defaultState;
  }
}
