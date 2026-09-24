import { createStore } from "redux";
import { devToolsEnhancer } from "redux-devtools-extension";

export interface StoreState {
  isSidebarVisible: boolean;
}

// Actions
export const TOGGLE_SIDEBAR = "TOGGLE_SIDEBAR";
export type TOGGLE_SIDEBAR = typeof TOGGLE_SIDEBAR;
export interface ToggleSidebar {
  type: TOGGLE_SIDEBAR;
}
export const toggleSidebar = (): ToggleSidebar => ({ type: TOGGLE_SIDEBAR });
export const CLOSE_SIDEBAR = "CLOSE_SIDEBAR";
export type CLOSE_SIDEBAR = typeof CLOSE_SIDEBAR;
export interface CloseSidebar {
  type: CLOSE_SIDEBAR;
}
export const closeSidebar = (): CloseSidebar => ({ type: CLOSE_SIDEBAR });

// Reducer
export const reducer = (state: StoreState, action: ToggleSidebar | CloseSidebar): StoreState => {
  switch (action.type) {
    case TOGGLE_SIDEBAR:
      return Object.assign({}, state, { isSidebarVisible: !state.isSidebarVisible });
    case CLOSE_SIDEBAR:
      return Object.assign({}, state, { isSidebarVisible: false });
    default:
      return state;
  }
};

// Store
export const initialState: StoreState = { isSidebarVisible: false };
export const store = createStore<StoreState, any, any, any>(
  reducer,
  initialState,
  devToolsEnhancer({}),
);
