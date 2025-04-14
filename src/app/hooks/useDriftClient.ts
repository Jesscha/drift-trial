import { useContext } from "react";
import {
  DriftClientContextType,
  DriftClientContext,
} from "../providers/DriftClientProvider";

export function useDriftClient(): DriftClientContextType {
  const context = useContext(DriftClientContext);
  if (!context) {
    throw new Error("useDriftClient must be used within a DriftClientProvider");
  }
  return context;
}
