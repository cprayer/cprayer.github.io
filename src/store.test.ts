import { closeSidebar, initialState, reducer, toggleSidebar } from "./store";

describe("sidebar state", () => {
  it("opens, closes, and stays closed when close is repeated", () => {
    const opened = reducer(initialState, toggleSidebar());
    expect(opened.isSidebarVisible).toBe(true);

    const closed = reducer(opened, closeSidebar());
    expect(closed.isSidebarVisible).toBe(false);
    expect(reducer(closed, closeSidebar()).isSidebarVisible).toBe(false);
  });
});
