// Types
export interface Token {
  asset: string;
  available: number;
  inOrders: number;
  total: number;
  usdValue: number;
}

export interface Position {
  market: string;
  size: string;
  entryPrice: number;
  markPrice: number;
  pnl: number;
}

export interface Order {
  market: string;
  side: "Long" | "Short";
  type: "Market" | "Limit" | "Stop";
  size: number;
  price: number;
  status: "Open" | "Triggered" | "Filled";
}

export interface Subaccount {
  id: number;
  name: string;
  balances: Token[];
  positions: Position[];
  openOrders: Order[];
  totalValueUSD: number;
}

// Mock Subaccounts
export const mockSubaccounts: Subaccount[] = [
  {
    id: 1,
    name: "Main Account",
    balances: [
      {
        asset: "SOL",
        available: 10.5,
        inOrders: 2.0,
        total: 12.5,
        usdValue: 1250,
      },
      {
        asset: "USDC",
        available: 500,
        inOrders: 100,
        total: 600,
        usdValue: 600,
      },
      {
        asset: "BTC",
        available: 0.01,
        inOrders: 0,
        total: 0.01,
        usdValue: 400,
      },
    ],
    positions: [
      {
        market: "SOL-PERP",
        size: "10L",
        entryPrice: 100,
        markPrice: 110,
        pnl: 100,
      },
      {
        market: "BTC-PERP",
        size: "0.1S",
        entryPrice: 40000,
        markPrice: 39000,
        pnl: 100,
      },
    ],
    openOrders: [
      {
        market: "SOL-PERP",
        side: "Long",
        type: "Limit",
        size: 5,
        price: 95,
        status: "Open",
      },
      {
        market: "BTC-PERP",
        side: "Short",
        type: "Stop",
        size: 0.05,
        price: 42000,
        status: "Triggered",
      },
    ],
    totalValueUSD: 2250,
  },
  {
    id: 2,
    name: "Trading Account",
    balances: [
      {
        asset: "SOL",
        available: 5.0,
        inOrders: 1.0,
        total: 6.0,
        usdValue: 600,
      },
      {
        asset: "USDC",
        available: 1000,
        inOrders: 200,
        total: 1200,
        usdValue: 1200,
      },
    ],
    positions: [
      {
        market: "SOL-PERP",
        size: "5L",
        entryPrice: 95,
        markPrice: 110,
        pnl: 75,
      },
    ],
    openOrders: [
      {
        market: "SOL-PERP",
        side: "Long",
        type: "Limit",
        size: 2,
        price: 90,
        status: "Open",
      },
    ],
    totalValueUSD: 1800,
  },
  {
    id: 3,
    name: "HODL Account",
    balances: [
      {
        asset: "SOL",
        available: 20.0,
        inOrders: 0,
        total: 20.0,
        usdValue: 2000,
      },
      {
        asset: "BTC",
        available: 0.05,
        inOrders: 0,
        total: 0.05,
        usdValue: 2000,
      },
    ],
    positions: [],
    openOrders: [],
    totalValueUSD: 4000,
  },
];

// Markets for trading
export const markets = [
  { id: "SOL-PERP", name: "SOL-PERP", price: 110 },
  { id: "BTC-PERP", name: "BTC-PERP", price: 40000 },
  { id: "ETH-PERP", name: "ETH-PERP", price: 2500 },
];
