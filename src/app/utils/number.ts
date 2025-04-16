import { BASE_PRECISION, BN, PRICE_PRECISION } from "@drift-labs/sdk";

export const formatBN = (
  bn: BN | null,
  isUSDValue = false,
  decimals = 2
): string => {
  if (!bn) return "N/A";

  const precision = isUSDValue ? PRICE_PRECISION : BASE_PRECISION;

  const fullStr = bn.toString();
  const precisionDigits = precision.toString().length - 1;

  const paddedStr = fullStr.padStart(precisionDigits + 1, "0");

  const wholeStr = paddedStr.slice(0, -precisionDigits) || "0";
  const decimalStr = paddedStr.slice(-precisionDigits);
  let formattedWhole = wholeStr.replace(/\B(?=(\d{3})+(?!\d))/g, ",");

  // Fix for negative decimals with zero in ones place (e.g. -0.4)
  if (bn.isNeg() && (wholeStr === "-" || wholeStr === "-0")) {
    formattedWhole = "-0";
  }

  if (decimals === 0) {
    return formattedWhole;
  }

  // Get decimal digits up to specified precision
  let decimalPart = decimalStr.slice(0, decimals);

  // Remove trailing zeros
  decimalPart = decimalPart.replace(/0+$/, "");

  console.log("decimalPart", decimalPart);
  console.log("formattedWhole", formattedWhole);

  // Only add decimal point if there are decimal digits
  return decimalPart ? `${formattedWhole}.${decimalPart}` : formattedWhole;
};

export const formatNumber = (
  num: number | null,
  isUSDValue = false,
  decimals = 2
): string => {
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
