import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type NotificationItem = { id: string; title: string; message: string; read: boolean };

export type NotificationState = {
  items: NotificationItem[];
};

const initialState: NotificationState = {
  items: []
};

const notificationSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    setNotifications(state, action: PayloadAction<NotificationItem[]>) {
      state.items = action.payload;
    },
    markRead(state, action: PayloadAction<string>) {
      const item = state.items.find((n) => n.id === action.payload);
      if (item) item.read = true;
    }
  }
});

export const { setNotifications, markRead } = notificationSlice.actions;
export default notificationSlice.reducer;
