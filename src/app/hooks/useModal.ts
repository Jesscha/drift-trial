import { useState, useCallback } from "react";

/**
 * Custom hook for managing modal state
 * @returns Object containing modal state and functions to manipulate it
 */
export function useModal(initialState = false) {
  const [isOpen, setIsOpen] = useState(initialState);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((prevState) => !prevState), []);

  return {
    isOpen,
    open,
    close,
    toggle,
  };
}
