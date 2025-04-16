import { useState } from "react";

interface ConfirmCloseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading: boolean;
  positionDetails: {
    marketName: string;
    direction: string;
    size: string;
    pnl: string;
    pnlClass: string;
  } | null;
}

export function ConfirmCloseModal({
  isOpen,
  onClose,
  onConfirm,
  isLoading,
  positionDetails,
}: ConfirmCloseModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-neutrals-100/80 dark:bg-neutrals-100/40"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="relative bg-neutrals-10 dark:bg-neutrals-80 rounded-lg shadow-lg max-w-md w-full mx-4 z-10">
        <div className="p-6">
          <h3 className="text-xl font-bold mb-4 text-neutrals-100 dark:text-neutrals-10">
            Close Position
          </h3>

          {positionDetails && (
            <div className="mb-6 bg-neutrals-20 dark:bg-neutrals-70 p-4 rounded-lg">
              <p className="mb-2 text-neutrals-100 dark:text-neutrals-10">
                Are you sure you want to close this position?
              </p>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="text-neutrals-60 dark:text-neutrals-40">
                  Market:
                </div>
                <div className="text-neutrals-100 dark:text-neutrals-10 font-medium">
                  {positionDetails.marketName}
                </div>

                <div className="text-neutrals-60 dark:text-neutrals-40">
                  Position:
                </div>
                <div
                  className={`font-medium ${
                    positionDetails.direction === "Long"
                      ? "text-green-50"
                      : "text-red-50"
                  }`}
                >
                  {positionDetails.direction}
                </div>

                <div className="text-neutrals-60 dark:text-neutrals-40">
                  Size:
                </div>
                <div className="text-neutrals-100 dark:text-neutrals-10 font-medium">
                  {positionDetails.size}
                </div>

                <div className="text-neutrals-60 dark:text-neutrals-40">
                  PnL:
                </div>
                <div className={`font-medium ${positionDetails.pnlClass}`}>
                  {positionDetails.pnl}
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 bg-neutrals-30 dark:bg-neutrals-60 hover:bg-neutrals-40 dark:hover:bg-neutrals-50 rounded transition-colors text-neutrals-100 dark:text-neutrals-10"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={isLoading}
              className={`px-4 py-2 rounded ${
                isLoading
                  ? "bg-red-60 opacity-70 cursor-not-allowed"
                  : "bg-red-50 hover:bg-red-60"
              } text-white transition-colors flex items-center`}
            >
              {isLoading ? (
                <>
                  <svg
                    className="animate-spin h-4 w-4 mr-2"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Closing...
                </>
              ) : (
                "Confirm Close"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
