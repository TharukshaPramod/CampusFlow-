import { useSelector } from "react-redux";
import { RootState } from "../store";

export function useTheme() {
  const theme = useSelector((state: RootState) => state.theme);
  return theme;
}
