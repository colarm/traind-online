// Theme management utility
export const themes = [
  { label: "🌫️ Cool White", value: "theme-cool-white" },
  { label: "🌙 Nocturne Pulse", value: "theme-nocturne-pulse" },
  { label: "🌿 Mint Focus", value: "theme-mint-focus" },
  { label: "🌗 Joy Flow", value: "theme-joy-flow" },
];

export const DEFAULT_THEME = "theme-nocturne-pulse";
const THEME_STORAGE_KEY = "traind-online-theme";

// Get current theme from localStorage or default
export const getCurrentTheme = (): string => {
  if (typeof window === "undefined") return DEFAULT_THEME;

  const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
  return savedTheme && themes.some((t) => t.value === savedTheme)
    ? savedTheme
    : DEFAULT_THEME;
};

// Apply theme to document body
export const applyTheme = (theme: string) => {
  if (typeof document === "undefined") return;

  // Remove all theme classes
  themes.forEach((t) => {
    document.body.classList.remove(t.value);
  });

  // Add the selected theme
  document.body.classList.add(theme);

  // Save to localStorage
  localStorage.setItem(THEME_STORAGE_KEY, theme);
};

// Initialize theme on app startup
export const initializeTheme = () => {
  const theme = getCurrentTheme();
  applyTheme(theme);
  return theme;
};

// Change theme and persist
export const changeTheme = (theme: string) => {
  applyTheme(theme);
};
