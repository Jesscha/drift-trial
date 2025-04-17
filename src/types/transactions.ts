/**
 * Action types that can be performed after a transaction is confirmed
 */
export enum TransactionSuccessActionType {
  UPDATE_USER_ACCOUNT = "UPDATE_USER_ACCOUNT",
  UPDATE_POSITIONS = "UPDATE_POSITIONS",
  UPDATE_ORDERS = "UPDATE_ORDERS",
  REFRESH_ALL = "REFRESH_ALL",
}

/**
 * Action to be performed after a transaction is confirmed
 */
export type TransactionSuccessAction = {
  type: TransactionSuccessActionType;
  params?: Record<string, unknown>;
};

/**
 * Status of a transaction
 */
export type TransactionStatus = "processing" | "confirmed" | "failed";

/**
 * Information about a transaction being tracked
 */
export type TransactionInfo = {
  signature: string;
  status: TransactionStatus;
  timestamp: number;
  description: string;
  error?: string;
  successActions?: TransactionSuccessAction[];
};

/**
 * Storage structure for transaction history
 */
export type TransactionStorageData = {
  transactions: TransactionInfo[];
  lastUpdated: number;
};
