import { createSlice } from "@reduxjs/toolkit";

export type UiState = {
  sidebarOpen: boolean;
  loading: boolean;
};

const initialState: UiState = {
  sidebarOpen: true,
  loading: false
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    toggleSidebar(state) {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setLoading(state, action) {
      state.loading = action.payload as boolean;
    }
  }
});

export const { toggleSidebar, setLoading } = uiSlice.actions;
export default uiSlice.reducer;
