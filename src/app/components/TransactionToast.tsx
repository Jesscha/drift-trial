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
  let statusColor = "bg-yellow-500";
  let statusText = "Processing...";

  if (status === "confirmed") {
    statusColor = "bg-green-500";
    statusText = "Confirmed";
  } else if (status === "failed") {
    statusColor = "bg-red-500";
    statusText = "Failed";
  } else if (status === "pending") {
    statusColor = "bg-blue-500";
    statusText = "Pending";
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
      className={`${statusColor} text-white p-3 rounded-md shadow-md mb-3 max-w-sm
        ${isExiting ? "animate-toast-out" : "animate-toast-in"}`}
    >
      <div className="flex justify-between items-start">
        <div>
          <div className="font-bold mb-1">{description}</div>
          <div className="text-sm mb-1">Status: {statusText}</div>
          <div className="text-xs mb-1">
            Signature:{" "}
            <span className="font-mono">{truncateSignature(signature)}</span>
          </div>
          <div className="text-xs opacity-70">{formatTime(timestamp)}</div>
          {error && (
            <div className="text-xs mt-2 bg-red-800 p-1 rounded overflow-hidden overflow-ellipsis">
              {error}
            </div>
          )}
        </div>
        <div className="flex flex-col space-y-2">
          <button
            onClick={handleClose}
            className="text-white hover:text-gray-200 text-xs font-bold"
          >
            ✕
          </button>
          {status === "confirmed" && (
            <a
              href={`https://explorer.solana.com/tx/${signature}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs underline hover:text-gray-200"
            >
              View
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
