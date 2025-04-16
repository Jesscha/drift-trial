export const getTokenIconUrl = (tokenSymbol: string | undefined) => {
  // Handle undefined or empty token symbol
  if (!tokenSymbol)
    return `https://drift-public.s3.eu-central-1.amazonaws.com/assets/icons/markets/`;

  // Convert token symbol to lowercase and trim
  const symbol = tokenSymbol.toLowerCase().trim();

  // Special case for BONK token
  if (symbol === "bonk" || symbol === "wif") {
    return `/icons/${symbol}.webp`;
  }

  // Default case for all other tokens
  return `/icons/${symbol}.svg`;
};
