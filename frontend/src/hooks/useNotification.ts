import { useCallback } from "react";
import { useToastStore } from "../components/Toast";

export function useNotification() {
  const addToast = useToastStore((state) => state.addToast);

  return useCallback(
    (message: string, type: "success" | "error" = "success") => {
      addToast({ message, type });
    },
    [addToast]
  );
}
