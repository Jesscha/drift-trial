import { Connection, PublicKey, Keypair } from "@solana/web3.js";
import {
  Wallet,
  DriftClient,
  BulkAccountLoader,
  DRIFT_PROGRAM_ID,
  IWallet,
} from "@drift-labs/sdk";
import { EventEmitter } from "events";

export class DriftService extends EventEmitter {
  private client: DriftClient | null = null;
  private accountLoader: BulkAccountLoader | null = null;
  private wallet: IWallet | null = null;
  private connection: Connection | null = null;
  private isInitialized = false;

  constructor() {
    super();
  }

  async initialize(connection: Connection, wallet: IWallet) {
    if (this.isInitialized) {
      return this.client;
    }

    this.emit("loading");

    this.connection = connection;
    this.wallet = wallet;
    this.accountLoader = new BulkAccountLoader(connection, "confirmed", 1000);

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
    this.isInitialized = true;
    this.emit("initialized", this.client);
    return this.client;
  }

  getClient(): DriftClient | null {
    return this.client;
  }

  getIsInitialized(): boolean {
    return this.isInitialized;
  }

  async disconnect() {
    if (this.client) {
      await this.client.unsubscribe();
      this.client = null;
    }
    this.wallet = null;
    this.connection = null;
    this.isInitialized = false;
    this.emit("disconnected");
  }

  async reconnect() {
    if (this.wallet && this.connection && !this.isInitialized) {
      return this.initialize(this.connection, this.wallet);
    }
    return this.client;
  }
}

export default new DriftService();
