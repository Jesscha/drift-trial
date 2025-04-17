import React, { useEffect, useState } from "react";
import { TransactionStatus } from "@/types/transactions";

interface TransactionToastProps {
  signature: string;
  status: TransactionStatus;
  description: string;
  timestamp: number;
  error?: string;
  onClose: () => void;
}

export function TransactionToast({
  signature,
  status,
  description,
  timestamp,
  error,
  onClose,
}: TransactionToastProps) {
  // Add state for animation
  const [isVisible, setIsVisible] = useState(true);
  const [isExiting, setIsExiting] = useState(false);

  // Auto-disappear logic for confirmed transactions
  useEffect(() => {
    let timer: NodeJS.Timeout;

    // If status is confirmed, start auto-disappear timer
    if (status === "confirmed") {
      timer = setTimeout(() => {
        // First trigger exit animation
        setIsExiting(true);

        // After animation completes, remove from DOM
        setTimeout(() => {
          onClose();
          setIsVisible(false);
        }, 200); // Animation duration
      }, 5000); // Auto-disappear after 5 seconds
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [status, onClose]);

  // If not visible, don't render
  if (!isVisible) return null;

  // Determine status color and label
  let statusText = "Pending";
  let statusTextColor = "text-lightBlue-70 dark:text-lightBlue-30";
  let borderColor = "border-lightBlue-40";
  let statusDotColor = "bg-lightBlue-50";

  if (status === "processing") {
    statusText = "Processing...";
    statusTextColor = "text-yellow-80 dark:text-yellow-30";
    borderColor = "border-yellow-50";
    statusDotColor = "bg-yellow-50";
  } else if (status === "confirmed") {
    statusText = "Confirmed";
    statusTextColor = "text-green-70 dark:text-green-30";
    borderColor = "border-green-60";
    statusDotColor = "bg-green-60";
  } else if (status === "failed") {
    statusText = "Failed";
    statusTextColor = "text-red-70 dark:text-red-30";
    borderColor = "border-red-60";
    statusDotColor = "bg-red-60";
  }

  // Format timestamp
  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  // Truncate signature for display
  const truncateSignature = (sig: string) => {
    return sig.slice(0, 8) + "..." + sig.slice(-8);
  };

  // Handle manual close with animation
  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      onClose();
      setIsVisible(false);
    }, 200); // Animation duration
  };

  return (
    <div
      className={`bg-neutrals-0 dark:bg-neutrals-80 p-4 rounded-lg shadow-md mb-3 max-w-sm border-l-4 ${borderColor}
        ${isExiting ? "animate-toast-out" : "animate-toast-in"}`}
    >
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="font-medium text-base mb-2 text-neutrals-100 dark:text-neutrals-0">
            {description}
          </div>
          <div className="flex items-center text-sm mb-2 space-x-2">
            <div
              className={`w-2 h-2 rounded-full mr-2 ${statusDotColor}`}
            ></div>
            <span className={`${statusTextColor}`}>Status: {statusText}</span>
            {status === "confirmed" && (
              <a
                href={`https://explorer.solana.com/tx/${signature}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-purple-50 hover:text-purple-60 underline transition-colors font-medium"
              >
                View
              </a>
            )}
          </div>
          <div className="text-xs mb-1 text-neutrals-80 dark:text-neutrals-30 font-mono">
            {truncateSignature(signature)}
          </div>
          <div className="text-xs opacity-70 text-neutrals-70 dark:text-neutrals-40">
            {formatTime(timestamp)}
          </div>
          {error && (
            <div className="text-xs mt-2 bg-red-10 dark:bg-neutrals-90 text-red-70 dark:text-red-30 p-2 rounded border border-red-60">
              {error}
            </div>
          )}
        </div>
        <div className="flex flex-col space-y-2 ml-2">
          <button
            onClick={handleClose}
            className="text-neutrals-60 hover:text-neutrals-100 dark:text-neutrals-40 dark:hover:text-neutrals-0 text-xs font-bold transition-colors"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
}
