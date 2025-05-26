import { create } from "zustand";
import { persist } from "zustand/middleware";

interface ToastConfigState {
    isToastEnabled: boolean;
    setToastEnabled: (enabled: boolean) => void;
}

export const useToastConfigStore = create<ToastConfigState>()(
    persist(
        (set) => ({
            isToastEnabled: true,
            setToastEnabled: (enabled) => set({ isToastEnabled: enabled }),
        }),
        {
            name: "toast-config-store",
        }
    )
)