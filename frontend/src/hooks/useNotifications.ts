import { useSelector } from "react-redux";
import { RootState } from "../store";

export function useNotifications() {
  return useSelector((state: RootState) => state.notifications);
}
