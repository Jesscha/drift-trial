export interface OrderBookEntry {
  price: string;
  size: string;
  sources: {
    vamm?: string;
    dlob?: string;
  };
}

export interface OracleData {
  price: string;
  slot: string;
  confidence: string;
  hasSufficientNumberOfDataPoints: boolean;
  twap: string;
  twapConfidence: string;
}

export interface OrderBookData {
  bids: OrderBookEntry[];
  asks: OrderBookEntry[];
  marketName: string;
  marketType: string;
  marketIndex: number;
  ts: number;
  slot: number;
  oracle: number;
  oracleData: OracleData;
  marketSlot: number;
}
