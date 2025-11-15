export interface SpeedDialItem {
  id: string;
  title: string;
  url: string;
  icon: string; // base64 encoded image
}

export interface Group {
  id: string;
  name: string;
  items: SpeedDialItem[];
}

export interface UserSettings {
  background: string | null; // base64, gradient, or solid color
  darkMode: boolean;
  gridSize: "small" | "medium" | "large";
  enableSync: boolean;
}

export interface DashboardState {
  items: SpeedDialItem[];
  groups: Group[];
  settings: UserSettings;
}
