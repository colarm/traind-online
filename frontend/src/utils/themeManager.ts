// Theme management utility
import { getPreferences, updatePreferences } from "../api/preference";
import { checkStatus } from "../api/auth";

export const themes = [
  { label: "🌫️ Cool White", value: "theme-cool-white" },
  { label: "🌙 Nocturne Pulse", value: "theme-nocturne-pulse" },
  { label: "🌿 Mint Focus", value: "theme-mint-focus" },
  { label: "🌗 Joy Flow", value: "theme-joy-flow" },
];

export const DEFAULT_THEME = "theme-cool-white";
const THEME_STORAGE_KEY = "traind-online-theme";

// Internal helper functions
const isThemeAvailable = (theme: string): boolean => {
  return themes.some((t) => t.value === theme);
};

const getValidTheme = (preferredTheme?: string): string => {
  if (!preferredTheme) return DEFAULT_THEME;
  return isThemeAvailable(preferredTheme) ? preferredTheme : DEFAULT_THEME;
};

const applyTheme = (theme: string) => {
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

// Get current theme from localStorage immediately (for instant rendering)
export const getCurrentThemeLocal = (): string => {
  if (typeof window === "undefined") return DEFAULT_THEME;

  const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
  return savedTheme && isThemeAvailable(savedTheme)
    ? savedTheme
    : DEFAULT_THEME;
};

// Sync theme from database and apply if different from local
export const syncThemeFromDatabase = async (): Promise<boolean> => {
  const localTheme = getCurrentThemeLocal();

  try {
    const authStatus = await checkStatus();
    if (authStatus && authStatus.valid) {
      const preferencesResponse = await getPreferences();
      const databaseTheme = preferencesResponse.preferences?.theme;

      if (databaseTheme) {
        const validDatabaseTheme = getValidTheme(databaseTheme);

        // If database theme is different from local, apply it
        if (validDatabaseTheme !== localTheme) {
          applyTheme(validDatabaseTheme);
          return true; // Theme was changed
        }
      }
    }
  } catch (error) {
    console.warn("Failed to sync theme from database:", error);
  }

  return false; // No theme change
};

// Initialize theme on app startup with instant local theme + background sync
export const initializeTheme = () => {
  // 1. Immediately apply local theme for instant rendering
  const localTheme = getCurrentThemeLocal();
  applyTheme(localTheme);

  // 2. Sync with database in the background
  syncThemeFromDatabase().catch(console.warn);

  return localTheme;
};

// Change theme and persist to both localStorage and database
export const changeTheme = (theme: string) => {
  // Apply theme immediately
  applyTheme(theme);

  // Save to database in background if user is logged in
  const saveToDatabase = async () => {
    try {
      const authStatus = await checkStatus();
      if (authStatus && authStatus.valid) {
        const currentPrefs = await getPreferences();
        await updatePreferences({
          ...currentPrefs.preferences,
          theme: theme,
        });
      }
    } catch (error) {
      console.warn("Failed to save theme to database:", error);
      // Theme still works locally via localStorage
    }
  };

  saveToDatabase();
};
