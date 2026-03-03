import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type AuthState = {
  user: { id: string; name: string } | null;
  token: string | null;
  status: "idle" | "loading" | "authenticated" | "error";
};

const initialState: AuthState = {
  user: null,
  token: null,
  status: "idle"
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials(state, action: PayloadAction<{ user: AuthState["user"]; token: string }>) {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.status = "authenticated";
    },
    clearSession(state) {
      state.user = null;
      state.token = null;
      state.status = "idle";
    }
  }
});

export const { setCredentials, clearSession } = authSlice.actions;
export default authSlice.reducer;
