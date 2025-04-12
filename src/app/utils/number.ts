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
  const formattedWhole = wholeStr.replace(/\B(?=(\d{3})+(?!\d))/g, ",");

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
