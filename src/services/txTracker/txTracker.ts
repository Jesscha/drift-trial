import { Connection, TransactionSignature } from "@solana/web3.js";
import { EventEmitter } from "events";

export enum TransactionSuccessActionType {
  UPDATE_USER_ACCOUNT = "UPDATE_USER_ACCOUNT",
  UPDATE_POSITIONS = "UPDATE_POSITIONS",
  UPDATE_ORDERS = "UPDATE_ORDERS",
  REFRESH_ALL = "REFRESH_ALL",
}

export type TransactionSuccessAction = {
  type: TransactionSuccessActionType;
  params?: Record<string, any>;
};

export type TransactionStatus =
  | "pending"
  | "processing"
  | "confirmed"
  | "failed";

export type TransactionInfo = {
  signature: string;
  status: TransactionStatus;
  timestamp: number;
  description: string;
  error?: string;
  successActions?: TransactionSuccessAction[];
};

type StorageData = {
  transactions: TransactionInfo[];
  lastUpdated: number;
};

class TxTrackerService extends EventEmitter {
  private transactions: TransactionInfo[] = [];
  private connection: Connection | null = null;
  private txListeners: Map<string, number> = new Map();
  private lastUpdateTimestamp = 0;
  private updateLock = false;

  private actionQueue: Set<TransactionSuccessActionType> = new Set();
  private batchTimeout: NodeJS.Timeout | null = null;
  private batchDelay = 500; // 500ms batch window

  constructor() {
    super();
    this.loadFromStorage();

    // Listen for storage events from other tabs
    if (typeof window !== "undefined") {
      window.addEventListener("storage", (e) => {
        if (e.key === "drift-transactions") {
          this.loadFromStorage();
        }
      });
    }
  }

  initialize(connection: Connection) {
    this.connection = connection;

    // Re-setup listeners for pending transactions
    this.transactions
      .filter((tx) => tx.status === "processing")
      .forEach((tx) => this.setupListener(tx.signature));
  }

  async trackTransaction(
    signature: string,
    description: string,
    successActions?: TransactionSuccessAction[]
  ): Promise<TransactionInfo> {
    return this.updateWithLock(() => {
      if (this.transactions.some((tx) => tx.signature === signature)) {
        return this.transactions.find((tx) => tx.signature === signature)!;
      }

      const newTx: TransactionInfo = {
        signature,
        status: "processing",
        timestamp: Date.now(),
        description,
        successActions,
      };

      this.transactions = [...this.transactions, newTx];
      this.saveToStorage();
      this.emit("updated", [...this.transactions]);

      if (this.connection) {
        this.setupListener(signature);
      }

      return newTx;
    });
  }

  private setupListener(signature: string) {
    if (!this.connection) return;

    if (this.txListeners.has(signature)) {
      const existingId = this.txListeners.get(signature)!;
      this.connection.removeSignatureListener(existingId);
    }

    const id = this.connection.onSignature(
      signature,
      (result) => {
        this.updateTransaction(
          signature,
          result.err ? "failed" : "confirmed",
          result.err ? JSON.stringify(result.err) : undefined
        );
      },
      "confirmed"
    );

    this.txListeners.set(signature, id);
  }

  private async updateTransaction(
    signature: string,
    status: TransactionStatus,
    error?: string
  ) {
    return this.updateWithLock(async () => {
      const index = this.transactions.findIndex(
        (tx) => tx.signature === signature
      );
      if (index >= 0) {
        const transaction = this.transactions[index];

        const updatedTransactions = [...this.transactions];
        updatedTransactions[index] = {
          ...transaction,
          status,
          error,
        };

        this.transactions = updatedTransactions;
        this.saveToStorage();

        if (
          status === "confirmed" &&
          transaction.successActions &&
          transaction.successActions.length > 0
        ) {
          await this.executeSuccessActions(transaction.successActions);
        }

        this.emit("updated", [...this.transactions]);
        this.emit(`tx:${signature}`, { ...this.transactions[index] });

        if (status === "confirmed" || status === "failed") {
          this.cleanupTxListener(signature);
        }
      }
    });
  }

  private async executeSuccessActions(actions: TransactionSuccessAction[]) {
    let shouldScheduleBatch = false;

    for (const action of actions) {
      try {
        // Only handle standard action types
        this.actionQueue.add(action.type);
        shouldScheduleBatch = true;
      } catch (error) {
        console.error(`Error queueing success action ${action.type}:`, error);
      }
    }

    if (shouldScheduleBatch && !this.batchTimeout) {
      this.batchTimeout = setTimeout(
        () => this.processBatchedActions(),
        this.batchDelay
      );
    }
  }

  private processBatchedActions() {
    if (this.actionQueue.size > 0) {
      const actions = Array.from(this.actionQueue);
      this.actionQueue.clear();

      if (actions.includes(TransactionSuccessActionType.REFRESH_ALL)) {
        this.emit("action:refreshAll");
      } else {
        if (
          actions.includes(TransactionSuccessActionType.UPDATE_USER_ACCOUNT)
        ) {
          this.emit("action:updateUserAccount");
        }

        if (actions.includes(TransactionSuccessActionType.UPDATE_POSITIONS)) {
          this.emit("action:updatePositions");
        }

        if (actions.includes(TransactionSuccessActionType.UPDATE_ORDERS)) {
          this.emit("action:updateOrders");
        }
      }
    }

    // Clear the timeout reference
    this.batchTimeout = null;
  }

  private cleanupTxListener(signature: string) {
    if (this.connection && this.txListeners.has(signature)) {
      const id = this.txListeners.get(signature)!;
      this.connection.removeSignatureListener(id);
      this.txListeners.delete(signature);
    }
  }

  getTransactions() {
    return [...this.transactions]; // Return a copy
  }

  async clearTransaction(signature: string) {
    return this.updateWithLock(() => {
      this.cleanupTxListener(signature);
      this.transactions = this.transactions.filter(
        (tx) => tx.signature !== signature
      );
      this.saveToStorage();
      this.emit("updated", [...this.transactions]);
    });
  }

  async clearAllTransactions() {
    return this.updateWithLock(() => {
      // Clean up all listeners
      this.txListeners.forEach((id, sig) => {
        if (this.connection) {
          this.connection.removeSignatureListener(id);
        }
      });
      this.txListeners.clear();

      this.transactions = [];
      this.saveToStorage();
      this.emit("updated", []);
    });
  }

  setBatchDelay(delayMs: number) {
    this.batchDelay = delayMs;
  }

  getBatchDelay(): number {
    return this.batchDelay;
  }

  private async updateWithLock<T>(updateFn: () => T): Promise<T> {
    if (this.updateLock) {
      // Wait and retry if locked
      await new Promise((resolve) => setTimeout(resolve, 10));
      return this.updateWithLock(updateFn);
    }

    this.updateLock = true;
    try {
      return updateFn();
    } finally {
      this.updateLock = false;
    }
  }

  private saveToStorage() {
    if (typeof window === "undefined") return;

    const currentTime = Date.now();
    this.lastUpdateTimestamp = currentTime;

    const data: StorageData = {
      transactions: this.transactions,
      lastUpdated: currentTime,
    };

    localStorage.setItem("drift-transactions", JSON.stringify(data));
  }

  private loadFromStorage() {
    if (typeof window === "undefined") return;

    try {
      const stored = localStorage.getItem("drift-transactions");
      if (stored) {
        const data = JSON.parse(stored) as StorageData;

        // Only update if newer
        if (
          !this.lastUpdateTimestamp ||
          data.lastUpdated > this.lastUpdateTimestamp
        ) {
          this.transactions = data.transactions;
          this.lastUpdateTimestamp = data.lastUpdated;
          this.emit("updated", [...this.transactions]);
        }
      }
    } catch (error) {
      console.error("Failed to load transactions from storage:", error);
    }
  }
}

// Singleton instance
const txTracker = new TxTrackerService();
export default txTracker;
