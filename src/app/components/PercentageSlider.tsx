import React from "react";

export interface PercentageSliderProps {
  percentage: number;
  onChange: (percentage: number) => void;
  percentageOptions?: number[];
  sliderHeight?: "sm" | "md";
  className?: string;
  disabled?: boolean;
}

export const PercentageSlider: React.FC<PercentageSliderProps> = ({
  percentage,
  onChange,
  percentageOptions = [25, 50, 75, 100],
  sliderHeight = "sm",
  className = "",
  disabled = false,
}) => {
  // Helper to check if a percentage option is active
  const isPercentageActive = (percent: number) => {
    return Math.abs(percentage - percent) < 0.01;
  };

  // Get height class based on size prop
  const heightClass = sliderHeight === "sm" ? "h-1" : "h-1.5";
  const thumbSize = sliderHeight === "sm" ? "w-3 h-3" : "w-3.5 h-3.5";

  return (
    <div className={`${className}`}>
      {/* Slider track and thumb */}
      <div className="relative mb-3">
        <div
          className={`w-full ${heightClass} bg-neutrals-20 dark:bg-neutrals-70 rounded-full`}
        >
          <div
            className={`absolute ${heightClass} bg-gradient-to-r from-pink-50 via-purple-50 to-blue-50 rounded-full`}
            style={{ width: `${percentage}%` }}
          >
            <div
              className={`absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-1/2 ${thumbSize} bg-white dark:bg-white border-2 border-purple-50 rounded-full cursor-grab hover:scale-110 transition-transform`}
              style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }}
            ></div>
          </div>
        </div>
        <input
          type="range"
          min="0"
          max="100"
          step="1"
          value={percentage}
          onChange={(e) => onChange(parseInt(e.target.value))}
          className="absolute w-full h-3 top-[-1px] opacity-0 cursor-pointer"
          disabled={disabled}
        />
      </div>

      {/* Percentage buttons */}
      <div className="grid grid-cols-4 gap-1">
        {percentageOptions.map((percent) => (
          <button
            key={percent}
            onClick={() => onChange(percent)}
            disabled={disabled}
            className={`py-1 text-center rounded-md text-xs ${
              isPercentageActive(percent)
                ? "bg-purple-50/20 text-purple-40 border border-purple-50/30"
                : "bg-neutrals-10 dark:bg-neutrals-80 text-neutrals-60 dark:text-neutrals-40 border border-neutrals-20 dark:border-neutrals-70"
            } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            {percent}%
          </button>
        ))}
      </div>
    </div>
  );
};
