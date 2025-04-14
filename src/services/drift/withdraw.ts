import driftService from "./client";

export interface WithdrawParams {
  amount: number;
  marketIndex?: number; // Default to USDC (0)
  reduceOnly?: boolean;
  subAccountId?: number; // Optional subaccount ID
}

export const withdraw = async (params: WithdrawParams) => {
  const client = driftService.getClient();
  if (!client) throw new Error("Drift client not initialized");

  const { amount, reduceOnly = false, subAccountId } = params;
  const marketIndex = params.marketIndex || 0; // Default to USDC market

  // Convert amount to spot precision
  const convertedAmount = client.convertToSpotPrecision(marketIndex, amount);

  // Get associated token account
  const associatedTokenAccount = await client.getAssociatedTokenAccount(
    marketIndex
  );

  // Execute withdrawal - parameter order from SDK:
  // amount, marketIndex, associatedTokenAddress, reduceOnly, subAccountId, txParams, updateFuel
  return await client.withdraw(
    convertedAmount,
    marketIndex,
    associatedTokenAccount,
    reduceOnly,
    subAccountId
  );
};
