import driftService from "./client";

export const getUserAccount = async () => {
  const client = driftService.getClient();
  if (!client) throw new Error("Drift client not initialized");

  try {
    return await client.getUserAccount();
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
      totalCollateral: userAccount.totalCollateral?.toString() || "0",
      freeCollateral: userAccount.freeCollateral?.toString() || "0",
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
