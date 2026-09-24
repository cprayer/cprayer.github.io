import { applyTheme, getStoredTheme, getTheme, THEME_CHANGE_EVENT, THEME_STORAGE_KEY } from "./theme";

describe("site theme", () => {
  let savedValues: Record<string, string>;
  let browserThemeColor: { content: string };
  let dispatchEvent: jest.Mock;

  beforeEach(() => {
    savedValues = {};
    browserThemeColor = { content: "#f7f7f7" };
    dispatchEvent = jest.fn();

    Object.defineProperty(global, "document", {
      configurable: true,
      value: {
        documentElement: { dataset: {} },
        querySelector: jest.fn(() => browserThemeColor),
      },
    });
    Object.defineProperty(global, "window", {
      configurable: true,
      value: {
        dispatchEvent,
        localStorage: {
          getItem: (key: string) => savedValues[key] || null,
          setItem: (key: string, value: string) => { savedValues[key] = value; },
        },
      },
    });
  });

  it("uses light mode when no theme is selected", () => {
    expect(getTheme()).toBe("light");
    expect(getStoredTheme()).toBeNull();
  });

  it("applies and saves a selected theme", () => {
    applyTheme("dark", true);

    expect(getTheme()).toBe("dark");
    expect(getStoredTheme()).toBe("dark");
    expect(savedValues[THEME_STORAGE_KEY]).toBe("dark");
    expect(browserThemeColor.content).toBe("#111820");
    expect(dispatchEvent).toHaveBeenCalledWith(expect.objectContaining({ type: THEME_CHANGE_EVENT }));
  });

  it("can follow the system theme without saving a preference", () => {
    applyTheme("dark");

    expect(getTheme()).toBe("dark");
    expect(getStoredTheme()).toBeNull();
  });
});
