import driftService from "./client";
import { PublicKey } from "@solana/web3.js";
import { UserAccount } from "@drift-labs/sdk";

export const getUserAccount = async (): Promise<UserAccount | null> => {
  const client = driftService.getClient();
  if (!client) throw new Error("Drift client not initialized");

  try {
    const userAccount = await client.getUserAccount();
    return userAccount || null;
  } catch (error) {
    console.error("Failed to get user account:", error);
    throw error;
  }
};

export const getAllUsers = async (publicKey: PublicKey) => {
  const client = driftService.getClient();

  if (!client) throw new Error("Drift client not initialized");

  const users = await client.getUserAccountsForAuthority(publicKey);

  return users;
};

export const switchActiveUser = async (index: number) => {
  const client = driftService.getClient();
  if (!client) throw new Error("Drift client not initialized");
  await client.switchActiveUser(index);
};

export const getActiveAccount = () => {
  const client = driftService.getClient();
  if (!client) throw new Error("Drift client not initialized");
  const user = client.getUser();

  return user;
};

export const getActiveAccountId = () => {
  const client = driftService.getClient();
  if (!client) throw new Error("Drift client not initialized");
  return client.activeSubAccountId;
};
