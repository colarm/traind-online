/**
 * Theme management utility
 * Handles theme persistence across local storage and database
 *
 * Filename: themeManager.ts
 * Author: Haicheng Zhao
 * Date: 2025-08-15
 * AI Usage Declaration:
 * - This file contains code generated with the help of AI tools.
 * - Tool Used: Claude
 * - Date Generated: 2025-08-15
 * - AI-generated sections are marked with comments: # [AI-GENERATED]
 * I have reviewed, tested, and understood all AI-generated code.
 */

import { getPreferences, updatePreferences } from "../api/preference";
import { checkStatus } from "../api/auth";

// Available theme options
export const themes = [
  { label: "🌫️ Cool White", value: "theme-cool-white" },
  { label: "🌙 Nocturne Pulse", value: "theme-nocturne-pulse" },
  { label: "🌿 Mint Focus", value: "theme-mint-focus" },
  { label: "🌗 Joy Flow", value: "theme-joy-flow" },
];

export const DEFAULT_THEME = "theme-cool-white";
const THEME_STORAGE_KEY = "traind-online-theme";

// [AI-GENERATED: Claude, 2025-08-15]
const isValidTheme = (theme: string): boolean => {
  return themes.some((t) => t.value === theme);
};

// [AI-GENERATED: Claude, 2025-08-15]
const getValidTheme = (theme?: string): string => {
  return theme && isValidTheme(theme) ? theme : DEFAULT_THEME;
};

/**
 * Apply theme class to document body
 */
const applyThemeToDOM = (theme: string) => {
  if (typeof document === "undefined") return;
  // Remove all existing theme classes
  themes.forEach((t) => document.body.classList.remove(t.value));
  // Apply new theme class
  document.body.classList.add(theme);
};

/**
 * Save theme to browser local storage
 */
const saveThemeToLocal = (theme: string) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(THEME_STORAGE_KEY, theme);
};

/**
 * Get current theme from local storage
 */
export const getCurrentThemeLocal = (): string => {
  if (typeof window === "undefined") return DEFAULT_THEME;

  const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
  return getValidTheme(savedTheme || undefined);
};

/**
 * Fetch user's theme preference from database
 */
// [AI-GENERATED: Claude, 2025-08-15]
const getThemeFromDatabase = async (): Promise<string | null> => {
  try {
    const authStatus = await checkStatus();
    if (!authStatus?.valid) return null;

    const preferencesResponse = await getPreferences();
    const dbTheme = preferencesResponse.preferences?.theme;

    return dbTheme ? getValidTheme(dbTheme) : null;
  } catch (error) {
    console.warn("Failed to get theme from database:", error);
    return null;
  }
};

/**
 * Save theme preference to database
 */
// [AI-GENERATED: Claude, 2025-08-12]
const saveThemeToDatabase = async (theme: string): Promise<void> => {
  try {
    const authStatus = await checkStatus();
    if (!authStatus?.valid) {
      return;
    }

    const currentPrefs = await getPreferences();
    await updatePreferences({
      ...currentPrefs.preferences,
      theme: theme,
    });
  } catch (error) {
    console.warn("Failed to save theme to database:", error);
  }
};

/**
 * Initialize theme system on app startup
 * Synchronizes local and database theme preferences
 */
// [AI-GENERATED: Claude, 2025-08-15]
export const initializeTheme = async (): Promise<string> => {
  // Apply local theme immediately for quick UI response
  const localTheme = getCurrentThemeLocal();
  applyThemeToDOM(localTheme);

  // Check database for user's preferred theme
  const databaseTheme = await getThemeFromDatabase();

  // If database theme differs from local, use database theme
  if (databaseTheme && databaseTheme !== localTheme) {
    applyThemeToDOM(databaseTheme);
    saveThemeToLocal(databaseTheme);
    return databaseTheme;
  }

  return localTheme;
};

/**
 * Change theme and persist to both local storage and database
 */
export const changeTheme = (theme: string): void => {
  const validTheme = getValidTheme(theme);

  // Apply theme immediately
  applyThemeToDOM(validTheme);
  saveThemeToLocal(validTheme);

  // Save to database asynchronously
  saveThemeToDatabase(validTheme);
};
