import driftService from "./client";

export interface DepositParams {
  amount: number;
  marketIndex?: number; // Default to USDC (0)
}

export const deposit = async (params: DepositParams) => {
  const client = driftService.getClient();
  if (!client) throw new Error("Drift client not initialized");

  const { amount } = params;
  const marketIndex = params.marketIndex || 0; // Default to USDC market

  // Convert amount to spot precision
  const convertedAmount = client.convertToSpotPrecision(marketIndex, amount);

  // Get associated token account
  const associatedTokenAccount = await client.getAssociatedTokenAccount(
    marketIndex
  );

  // Execute deposit
  return await client.deposit(
    convertedAmount,
    marketIndex,
    associatedTokenAccount
  );
};
