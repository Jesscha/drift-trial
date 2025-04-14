import React, { useState, useRef, useEffect } from "react";

export interface DropdownOption {
  value: string | number;
  label: string;
  icon?: string; // URL to icon image
  mint?: string; // Mint address for token options
}

interface CustomDropdownProps {
  options: DropdownOption[];
  value: string | number;
  onChange: (value: string | number, option: DropdownOption) => void;
  placeholder?: string;
  label?: string;
  disabled?: boolean;
  className?: string;
  dropdownClassName?: string;
  optionClassName?: string;
  showSelectedIcon?: boolean;
  renderOption?: (option: DropdownOption) => React.ReactNode;
  onIconError?: (e: React.SyntheticEvent<HTMLImageElement, Event>) => void;
}

export const CustomDropdown: React.FC<CustomDropdownProps> = ({
  options,
  value,
  onChange,
  placeholder = "Select...",
  label,
  disabled = false,
  className = "",
  dropdownClassName = "",
  optionClassName = "",
  showSelectedIcon = true,
  renderOption,
  onIconError,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Find selected option
  const selectedOption = options.find((option) => option.value === value);

  // Handle click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Default icon error handler
  const handleIconError = (
    e: React.SyntheticEvent<HTMLImageElement, Event>
  ) => {
    if (onIconError) {
      onIconError(e);
    } else {
      // Default fallback
      (e.target as HTMLImageElement).src =
        "https://drift-public.s3.eu-central-1.amazonaws.com/assets/icons/markets/unknown.svg";
    }
  };

  // Toggle dropdown
  const toggleDropdown = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

  // Handle option selection
  const handleSelect = (option: DropdownOption) => {
    onChange(option.value, option);
    setIsOpen(false);
  };

  // Default option renderer
  const defaultRenderOption = (option: DropdownOption) => (
    <div className="flex items-center">
      {option.icon && (
        <img
          src={option.icon}
          alt={option.label}
          className="w-5 h-5 mr-2 rounded-full"
          onError={handleIconError}
        />
      )}
      <span className="font-medium text-sm">{option.label}</span>
    </div>
  );

  return (
    <div className="w-full">
      {label && (
        <div className="text-xs text-neutrals-80 dark:text-neutrals-30 mb-1.5">
          {label}
        </div>
      )}

      <div className="relative" ref={dropdownRef}>
        {/* Selected value display */}
        <div
          onClick={toggleDropdown}
          className={`bg-neutrals-10 dark:bg-neutrals-80 rounded-lg border border-neutrals-20 dark:border-neutrals-70 p-2 flex justify-between items-center cursor-pointer ${
            disabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer"
          } ${className}`}
        >
          <div className="flex items-center overflow-hidden">
            {selectedOption ? (
              renderOption ? (
                renderOption(selectedOption)
              ) : (
                defaultRenderOption(selectedOption)
              )
            ) : (
              <span className="text-neutrals-60 dark:text-neutrals-40 text-sm">
                {placeholder}
              </span>
            )}
          </div>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={`h-4 w-4 text-neutrals-60 transition-transform ${
              isOpen ? "rotate-180" : ""
            }`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>

        {/* Dropdown options */}
        {isOpen && (
          <div
            className={`absolute z-10 w-full mt-1 bg-neutrals-10 dark:bg-neutrals-80 rounded-lg border border-neutrals-20 dark:border-neutrals-70 shadow-lg max-h-48 overflow-y-auto ${dropdownClassName}`}
          >
            {options.map((option) => (
              <div
                key={option.value}
                className={`p-2 hover:bg-neutrals-20 dark:hover:bg-neutrals-70 cursor-pointer ${
                  option.value === value
                    ? "bg-neutrals-20 dark:bg-neutrals-70"
                    : ""
                } ${optionClassName}`}
                onClick={() => handleSelect(option)}
              >
                {renderOption
                  ? renderOption(option)
                  : defaultRenderOption(option)}
              </div>
            ))}

            {options.length === 0 && (
              <div className="p-2 text-neutrals-60 dark:text-neutrals-40 text-sm">
                No options available
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
