import driftService from "./client";
import { PublicKey } from "@solana/web3.js";

export const getUserAccount = async () => {
  const client = driftService.getClient();
  if (!client) throw new Error("Drift client not initialized");

  try {
    return await client.getUserAccount();
  } catch (error) {
    console.error("Failed to get user account:", error);
    throw error;
  }
};
