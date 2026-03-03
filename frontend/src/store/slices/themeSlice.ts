import { createSlice } from "@reduxjs/toolkit";

type Theme = "light" | "dark";

type ThemeState = {
  theme: Theme;
};

const initialState: ThemeState = {
  theme: "light"
};

const themeSlice = createSlice({
  name: "theme",
  initialState,
  reducers: {
    setTheme(state, action) {
      state.theme = action.payload as Theme;
    }
  }
});

export const { setTheme } = themeSlice.actions;
export default themeSlice.reducer;
