/**
 * Gets the URL for a token's icon based on its symbol
 * @param tokenSymbol The symbol of the token (e.g., "SOL", "BTC")
 * @returns URL string for the token's icon
 */
export const getTokenIconUrl = (tokenSymbol: string | undefined) => {
  // Handle undefined or empty token symbol
  if (!tokenSymbol)
    return `https://drift-public.s3.eu-central-1.amazonaws.com/assets/icons/markets/`;

  // Convert token symbol to lowercase and trim
  const symbol = tokenSymbol.toLowerCase().trim();

  // Special case for meme tokens that use webp format
  if (symbol === "bonk" || symbol === "wif") {
    return `/icons/${symbol}.webp`;
  }

  // Default case for all other tokens (using SVG format)
  return `/icons/${symbol}.svg`;
};
