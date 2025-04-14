import React, { useEffect, useState } from "react";
import { TransactionStatus } from "@/services/txTracker/txTracker";

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
          setIsVisible(false);
          onClose();
        }, 300); // Animation duration
      }, 2000); // Auto-disappear after 1 second
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [status, onClose]);

  // If not visible, don't render
  if (!isVisible) return null;

  // Determine status color and label
  let statusBg = "bg-yellow-50 dark:bg-yellow-90";
  let statusText = "Processing...";
  let statusTextColor = "text-yellow-80 dark:text-yellow-30";

  if (status === "confirmed") {
    statusBg = "bg-green-20 dark:bg-green-90";
    statusText = "Confirmed";
    statusTextColor = "text-green-70 dark:text-green-30";
  } else if (status === "failed") {
    statusBg = "bg-red-20 dark:bg-red-90";
    statusText = "Failed";
    statusTextColor = "text-red-70 dark:text-red-30";
  } else if (status === "pending") {
    statusBg = "bg-lightBlue-20 dark:bg-lightBlue-90";
    statusText = "Pending";
    statusTextColor = "text-lightBlue-70 dark:text-lightBlue-30";
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
      setIsVisible(false);
      onClose();
    }, 300); // Animation duration
  };

  return (
    <div
      className={`${statusBg} ${statusTextColor} p-3 rounded-md shadow-md mb-3 max-w-sm
        ${isExiting ? "animate-toast-out" : "animate-toast-in"}`}
    >
      <div className="flex justify-between items-start">
        <div>
          <div className="font-bold mb-1">{description}</div>
          <div className="text-sm mb-1 text-neutrals-90 dark:text-neutrals-20">
            Status: {statusText}
          </div>
          <div className="text-xs mb-1 text-neutrals-80 dark:text-neutrals-30">
            Signature:{" "}
            <span className="font-mono">{truncateSignature(signature)}</span>
          </div>
          <div className="text-xs opacity-70 text-neutrals-70 dark:text-neutrals-40">
            {formatTime(timestamp)}
          </div>
          {error && (
            <div className="text-xs mt-2 bg-red-20 dark:bg-red-90 text-red-70 dark:text-red-30 p-1 rounded overflow-hidden overflow-ellipsis">
              {error}
            </div>
          )}
        </div>
        <div className="flex flex-col space-y-2">
          <button
            onClick={handleClose}
            className="text-neutrals-70 dark:text-neutrals-40 hover:text-neutrals-100 dark:hover:text-neutrals-0 text-xs font-bold transition-colors"
          >
            ✕
          </button>
          {status === "confirmed" && (
            <a
              href={`https://explorer.solana.com/tx/${signature}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-purple-50 hover:text-purple-60 underline transition-colors"
            >
              View
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
