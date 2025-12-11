import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UIState {
  sidebarOpen: boolean;
  debugPanelOpen: boolean;
  debugPanelTab: string;
  theme: 'light' | 'dark' | 'system';
  fontSize: number;
  codeEditorTheme: string;
  showEmotionViz: boolean;
}

const initialState: UIState = {
  sidebarOpen: true,
  debugPanelOpen: false,
  debugPanelTab: 'memory',
  theme: 'dark',
  fontSize: 16,
  codeEditorTheme: 'vs-dark',
  showEmotionViz: true,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar(state) {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen(state, action: PayloadAction<boolean>) {
      state.sidebarOpen = action.payload;
    },
    toggleDebugPanel(state) {
      state.debugPanelOpen = !state.debugPanelOpen;
    },
    setDebugPanelOpen(state, action: PayloadAction<boolean>) {
      state.debugPanelOpen = action.payload;
    },
    setDebugPanelTab(state, action: PayloadAction<string>) {
      state.debugPanelTab = action.payload;
    },
    setTheme(state, action: PayloadAction<'light' | 'dark' | 'system'>) {
      state.theme = action.payload;
    },
    setFontSize(state, action: PayloadAction<number>) {
      state.fontSize = action.payload;
    },
    setCodeEditorTheme(state, action: PayloadAction<string>) {
      state.codeEditorTheme = action.payload;
    },
    toggleEmotionViz(state) {
      state.showEmotionViz = !state.showEmotionViz;
    }
  },
});

export const { 
  toggleSidebar,
  setSidebarOpen,
  toggleDebugPanel,
  setDebugPanelOpen,
  setDebugPanelTab,
  setTheme,
  setFontSize,
  setCodeEditorTheme,
  toggleEmotionViz
} = uiSlice.actions;

export default uiSlice.reducer;
