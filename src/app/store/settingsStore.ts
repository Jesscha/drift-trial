import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

// Define the type for our settings state
interface SettingsState {
  // Notification settings
  showNotifications: boolean;

  // Trading settings
  slippageTolerance: number; // in percentage

  // Actions
  setShowNotifications: (show: boolean) => void;
  setSlippageTolerance: (tolerance: number) => void;
}

// Create the store with persistence
export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      // Default values
      showNotifications: true,
      slippageTolerance: 0.5,

      // Action implementations
      setShowNotifications: (show) => set({ showNotifications: show }),
      setSlippageTolerance: (tolerance) =>
        set({ slippageTolerance: tolerance }),
    }),
    {
      name: "drift-settings-storage", // unique name for localStorage
      storage: createJSONStorage(() => localStorage),
    }
  )
);
