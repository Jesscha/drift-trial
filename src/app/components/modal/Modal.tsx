import React, { useEffect, useRef } from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string | React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  footer,
}: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    function handleEscapeKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    if (isOpen) {
      document.addEventListener("keydown", handleEscapeKey);
    }

    return () => {
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        ref={modalRef}
        className={`bg-neutrals-0 dark:bg-neutrals-80 rounded-lg shadow-xl w-fit mx-4 overflow-hidden animate-scale-in relative`}
      >
        {/* Close button that always appears */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-neutrals-60 hover:text-neutrals-100 dark:text-neutrals-40 dark:hover:text-neutrals-0 focus:outline-none transition-colors z-10"
          aria-label="Close"
        >
          ✕
        </button>

        {/* Header - Only render if title exists */}
        {title && (
          <div className="flex justify-between items-center p-2 border-b border-neutrals-20 dark:border-neutrals-70">
            <h2 className="text-lg font-bold text-neutrals-100 dark:text-neutrals-0 flex items-center pr-6">
              {title}
            </h2>
          </div>
        )}

        {/* Body */}
        <div className="p-4 max-h-[70vh] overflow-y-auto text-neutrals-100 dark:text-neutrals-10">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="p-4 border-t border-neutrals-20 dark:border-neutrals-70">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
