import React from "react";
import clsx from "clsx";

interface IconWrapperProps {
  children: React.ReactNode;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export const IconWrapper = ({
  children,
  className = "",
  size = "md",
}: IconWrapperProps) => {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  };

  return (
    <div
      className={clsx(
        "relative inline-flex items-center justify-center",
        sizeClasses[size],
        className
      )}
    >
      {/* Pseudo-background for dark mode */}
      <div className="absolute inset-0 dark:bg-neutrals-60/20 rounded-full opacity-0 dark:opacity-100" />

      {/* Icon content */}
      <div className="relative z-10 flex items-center justify-center w-full h-full">
        {children}
      </div>
    </div>
  );
};

export default IconWrapper;
