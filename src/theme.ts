export type Theme = "light" | "dark";

export const THEME_STORAGE_KEY = "cprayer-theme";
export const THEME_CHANGE_EVENT = "site-theme-change";

export const getTheme = (): Theme =>
  document.documentElement.dataset.theme === "dark" ? "dark" : "light";

export const getStoredTheme = (): Theme | null => {
  try {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
    return stored === "light" || stored === "dark" ? stored : null;
  } catch (error) {
    return null;
  }
};

export const applyTheme = (theme: Theme, persist = false): void => {
  document.documentElement.dataset.theme = theme;

  if (persist) {
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch (error) {
      // The theme still works when storage is unavailable.
    }
  }

  const browserThemeColor = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
  if (browserThemeColor) {
    browserThemeColor.content = theme === "dark" ? "#111820" : "#f7f7f7";
  }

  window.dispatchEvent(new Event(THEME_CHANGE_EVENT));
};
