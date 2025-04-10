import { Connection, PublicKey, Keypair } from "@solana/web3.js";
import {
  Wallet,
  DriftClient,
  BulkAccountLoader,
  DRIFT_PROGRAM_ID,
} from "@drift-labs/sdk";

export class DriftService {
  private client: DriftClient | null = null;
  private accountLoader: BulkAccountLoader | null = null;

  async initialize(connection: Connection, wallet: Wallet) {
    // Create account loader with appropriate commitment level
    this.accountLoader = new BulkAccountLoader(connection, "confirmed", 1000);

    // Initialize Drift client
    this.client = new DriftClient({
      connection,
      wallet,
      programID: new PublicKey(DRIFT_PROGRAM_ID),
      accountSubscription: {
        type: "polling",
        accountLoader: this.accountLoader,
      },
    });

    await this.client.subscribe();
    return this.client;
  }

  getClient(): DriftClient | null {
    return this.client;
  }

  async disconnect() {
    if (this.client) {
      await this.client.unsubscribe();
      this.client = null;
    }
  }
}

export default new DriftService();
