import { BASE_PRECISION, BN, PRICE_PRECISION } from "@drift-labs/sdk";

/**
 * Formats a BigNumber (BN) value to a human-readable string with proper decimal placement
 * @param bn The BigNumber to format
 * @param isUSDValue Whether this is a USD value (uses PRICE_PRECISION) or a token value (uses BASE_PRECISION)
 * @param decimals Number of decimal places to show
 * @returns Formatted string with commas for thousands and appropriate decimal precision
 */
export const formatBN = (
  bn: BN | null,
  isUSDValue = false,
  decimals = 2
): string => {
  if (!bn) return "N/A";

  const precision = isUSDValue ? PRICE_PRECISION : BASE_PRECISION;

  const fullStr = bn.toString();
  const precisionDigits = precision.toString().length - 1;
  const isNegative = bn.isNeg();

  // Remove negative sign for processing, we'll add it back later
  const absFullStr = isNegative ? fullStr.substring(1) : fullStr;
  const paddedStr = absFullStr.padStart(precisionDigits + 1, "0");

  const wholeStr = paddedStr.slice(0, -precisionDigits) || "0";
  const decimalStr = paddedStr.slice(-precisionDigits);

  // Format the whole number part with commas
  let formattedWhole = wholeStr.replace(/\B(?=(\d{3})+(?!\d))/g, ",");

  // Add negative sign if number is negative
  if (isNegative) {
    formattedWhole = "-" + formattedWhole;
  }

  if (decimals === 0) {
    return formattedWhole;
  }

  // Get decimal digits up to specified precision
  let decimalPart = decimalStr.slice(0, decimals);

  // Remove trailing zeros
  decimalPart = decimalPart.replace(/0+$/, "");

  // Only add decimal point if there are decimal digits
  return decimalPart ? `${formattedWhole}.${decimalPart}` : formattedWhole;
};

/**
 * Formats a regular JavaScript number to a human-readable string
 * @param num The number to format
 * @param decimals Number of decimal places to show
 * @returns Formatted string with commas for thousands and appropriate decimal precision
 */
export const formatNumber = (num: number | null, decimals = 2): string => {
  if (num === null) return "N/A";

  // Format with the specified number of decimal places
  const formatted = num.toFixed(decimals);

  // Split into whole and decimal parts
  const [wholeStr, decimalStr] = formatted.split(".");

  // Add commas for thousands
  const formattedWhole = wholeStr.replace(/\B(?=(\d{3})+(?!\d))/g, ",");

  if (decimals === 0) {
    return formattedWhole;
  }

  // Remove trailing zeros from decimal part
  const cleanedDecimal = decimalStr ? decimalStr.replace(/0+$/, "") : "";

  // Only add decimal point if there are decimal digits
  return cleanedDecimal
    ? `${formattedWhole}.${cleanedDecimal}`
    : formattedWhole;
};
