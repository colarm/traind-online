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

const isValidTheme = (theme: string): boolean => {
  return themes.some((t) => t.value === theme);
};

const getValidTheme = (theme?: string): string => {
  return theme && isValidTheme(theme) ? theme : DEFAULT_THEME;
};

const applyThemeToDOM = (theme: string) => {
  if (typeof document === "undefined") return;
  themes.forEach((t) => document.body.classList.remove(t.value));
  document.body.classList.add(theme);
};

const saveThemeToLocal = (theme: string) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(THEME_STORAGE_KEY, theme);
};

export const getCurrentThemeLocal = (): string => {
  if (typeof window === "undefined") return DEFAULT_THEME;

  const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
  return getValidTheme(savedTheme || undefined);
};

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

export const initializeTheme = async (): Promise<string> => {

  const localTheme = getCurrentThemeLocal();
  applyThemeToDOM(localTheme);

  const databaseTheme = await getThemeFromDatabase();

  if (databaseTheme && databaseTheme !== localTheme) {
    applyThemeToDOM(databaseTheme);
    saveThemeToLocal(databaseTheme);
    return databaseTheme;
  }

  return localTheme;
};

export const changeTheme = (theme: string): void => {
  const validTheme = getValidTheme(theme);

  applyThemeToDOM(validTheme);
  saveThemeToLocal(validTheme);

  saveThemeToDatabase(validTheme);
};
