import driftService from "./client";

// Our simplified interface that matches the properties we use from the SDK's user account
export interface UserAccount {
  totalCollateral: string;
  freeCollateral: string;
}

export const getUserAccount = async (): Promise<UserAccount | null> => {
  const client = driftService.getClient();
  if (!client) throw new Error("Drift client not initialized");

  try {
    const sdkAccount = await client.getUserAccount();
    if (!sdkAccount) return null;

    // Create our custom object without relying on SDK type properties
    const result: UserAccount = {
      totalCollateral: (sdkAccount as any).totalCollateral?.toString() || "0",
      freeCollateral: (sdkAccount as any).freeCollateral?.toString() || "0",
    };

    return result;
  } catch (error) {
    console.error("Failed to get user account:", error);
    return null;
  }
};

export const getUserStats = async () => {
  const client = driftService.getClient();
  if (!client) throw new Error("Drift client not initialized");

  try {
    const userAccount = await client.getUserAccount();
    if (!userAccount) {
      throw new Error("User account not found");
    }

    return {
      totalCollateral: (userAccount as any).totalCollateral?.toString() || "0",
      freeCollateral: (userAccount as any).freeCollateral?.toString() || "0",
      leverage: "1.0", // Simplified
      pnl: "0", // Simplified
    };
  } catch (error) {
    console.error("Failed to get user stats:", error);
    return {
      totalCollateral: "0",
      freeCollateral: "0",
      leverage: "1.0",
      pnl: "0",
    };
  }
};

export const getSubaccounts = async () => {
  const client = driftService.getClient();
  if (!client) throw new Error("Drift client not initialized");

  try {
    const userAccount = await client.getUserAccount();
    if (!userAccount) {
      return [];
    }

    // Simplified subaccount handling
    return [
      {
        index: 0,
        name: "Default",
      },
    ];
  } catch (error) {
    console.error("Failed to get subaccounts:", error);
    return [];
  }
};
