import {
  OrderType,
  PositionDirection,
  OrderTriggerCondition,
  MarketType,
  OrderParams,
  DefaultOrderParams,
} from "@drift-labs/sdk";
import driftService from "./client";
import { getMarketSymbol } from "./market";

export interface PlacePerpOrderParams {
  marketIndex: number;
  direction: PositionDirection;
  size: number;
  price?: number;
  orderType?: OrderType;
  oraclePriceOffset?: number;
  auctionStartPrice?: number;
  auctionEndPrice?: number;
  auctionDuration?: number;
  maxTs?: number;
  triggerPrice?: number;
  triggerCondition?: TriggerCondition;
  reduceOnly?: boolean;
}

export interface OrderResult {
  success: boolean;
  error?: Error;
  txid?: string;
  description?: string;
}

// Define trigger condition types for UI usage
export enum TriggerCondition {
  ABOVE = 0,
  BELOW = 1,
}

// Helper function to convert from our numeric enum to SDK OrderTriggerCondition
export function getTriggerConditionObject(triggerCondition: number) {
  if (triggerCondition === TriggerCondition.ABOVE) {
    return OrderTriggerCondition.ABOVE;
  } else if (triggerCondition === TriggerCondition.BELOW) {
    return OrderTriggerCondition.BELOW;
  }
  return OrderTriggerCondition.ABOVE; // Default
}

// Helper function to get readable order type label
export const getOrderTypeLabel = (orderType: OrderType): string => {
  switch (orderType) {
    case OrderType.MARKET:
      return "Market";
    case OrderType.LIMIT:
      return "Limit";
    case OrderType.TRIGGER_MARKET:
      return "Stop Market";
    case OrderType.TRIGGER_LIMIT:
      return "Stop Limit";
    case OrderType.ORACLE:
      return "Oracle";
    default:
      return "Order";
  }
};

/**
 * Places a perpetual futures order with the Drift protocol
 * @param params Order parameters
 * @returns OrderResult with success status and transaction ID
 */
export const placePerpOrder = async (
  params: PlacePerpOrderParams,
  subAccountId?: number
): Promise<OrderResult> => {
  const client = driftService.getClient();
  if (!client) {
    const error = new Error("Drift client not initialized");
    return { success: false, error };
  }

  try {
    const {
      marketIndex,
      direction,
      size,
      price,
      orderType = OrderType.LIMIT,
      oraclePriceOffset,
      auctionStartPrice,
      auctionEndPrice,
      auctionDuration,
      maxTs,
      triggerPrice,
      triggerCondition,
      reduceOnly,
    } = params;

    const baseAssetAmount = client.convertToPerpPrecision(size);

    const orderParams: OrderParams = {
      ...DefaultOrderParams,
      orderType,
      marketIndex,
      direction,
      baseAssetAmount,
      marketType: MarketType.PERP,
    };

    if (price !== undefined) {
      orderParams.price = client.convertToPricePrecision(price);
    }

    if (oraclePriceOffset !== undefined) {
      orderParams.oraclePriceOffset = client
        .convertToPricePrecision(oraclePriceOffset)
        .toNumber();
    }

    if (triggerPrice !== undefined) {
      orderParams.triggerPrice = client.convertToPricePrecision(triggerPrice);
    }

    if (triggerCondition !== undefined) {
      orderParams.triggerCondition =
        getTriggerConditionObject(triggerCondition);
    }

    if (reduceOnly !== undefined) {
      orderParams.reduceOnly = reduceOnly;
    }

    if (auctionStartPrice !== undefined) {
      orderParams.auctionStartPrice =
        client.convertToPricePrecision(auctionStartPrice);
    }

    if (auctionEndPrice !== undefined) {
      orderParams.auctionEndPrice =
        client.convertToPricePrecision(auctionEndPrice);
    }

    if (auctionDuration !== undefined) {
      orderParams.auctionDuration = auctionDuration;
    }

    if (maxTs !== undefined) {
      orderParams.maxTs = maxTs;
    }

    const tx = await client.placePerpOrder(
      orderParams,
      undefined,
      subAccountId
    );
    const txid = tx.toString();

    const directionText = direction === PositionDirection.LONG ? "Buy" : "Sell";
    const symbol = getMarketSymbol(marketIndex);
    const description = `${directionText} ${size.toFixed(5)} ${symbol}`;

    return { success: true, txid, description };
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    return { success: false, error };
  }
};

/**
 * Convenience method for placing a market order
 */
export const placeMarketOrder = async (
  marketIndex: number,
  direction: PositionDirection,
  size: number,
  subAccountId?: number
): Promise<OrderResult> => {
  return placePerpOrder(
    {
      marketIndex,
      direction,
      size,
      orderType: OrderType.MARKET,
    },
    subAccountId
  );
};

/**
 * Convenience method for placing a limit order
 */
export const placeLimitOrder = async (
  marketIndex: number,
  direction: PositionDirection,
  size: number,
  price: number,
  subAccountId?: number
): Promise<OrderResult> => {
  return placePerpOrder(
    {
      marketIndex,
      direction,
      size,
      price,
      orderType: OrderType.LIMIT,
    },
    subAccountId
  );
};

/**
 * Convenience method for placing an oracle-based order
 */
export const placeOracleOrder = async (
  marketIndex: number,
  direction: PositionDirection,
  size: number,
  oraclePriceOffset: number,
  subAccountId?: number
): Promise<OrderResult> => {
  return placePerpOrder(
    {
      marketIndex,
      direction,
      size,
      orderType: OrderType.ORACLE,
      oraclePriceOffset,
    },
    subAccountId
  );
};

/**
 * Convenience method for placing a trigger market order (stop market)
 */
export const placeTriggerMarketOrder = async (
  marketIndex: number,
  direction: PositionDirection,
  size: number,
  triggerPrice: number,
  triggerCondition: TriggerCondition,
  reduceOnly: boolean = false,
  subAccountId?: number
): Promise<OrderResult> => {
  return placePerpOrder(
    {
      marketIndex,
      direction,
      size,
      orderType: OrderType.TRIGGER_MARKET,
      triggerPrice,
      triggerCondition,
      reduceOnly,
    },
    subAccountId
  );
};

/**
 * Convenience method for placing a trigger limit order (stop limit)
 */
export const placeTriggerLimitOrder = async (
  marketIndex: number,
  direction: PositionDirection,
  size: number,
  price: number,
  triggerPrice: number,
  triggerCondition: TriggerCondition,
  reduceOnly: boolean = false,
  subAccountId?: number
): Promise<OrderResult> => {
  return placePerpOrder(
    {
      marketIndex,
      direction,
      size,
      price,
      orderType: OrderType.TRIGGER_LIMIT,
      triggerPrice,
      triggerCondition,
      reduceOnly,
    },
    subAccountId
  );
};

/**
 * Places multiple perpetual futures orders with the Drift protocol
 * @param orderParamsArray Array of order parameters
 * @returns OrderResult with success status and transaction ID
 */
export const placeOrders = async (
  orderParamsArray: PlacePerpOrderParams[],
  subAccountId?: number
): Promise<OrderResult> => {
  const client = driftService.getClient();
  if (!client) {
    const error = new Error("Drift client not initialized");
    return { success: false, error };
  }

  try {
    const driftOrderParams = orderParamsArray.map((params) => {
      const {
        marketIndex,
        direction,
        size,
        price,
        orderType = OrderType.LIMIT,
        oraclePriceOffset,
        auctionStartPrice,
        auctionEndPrice,
        auctionDuration,
        maxTs,
        triggerPrice,
        triggerCondition,
        reduceOnly,
      } = params;

      const baseAssetAmount = client.convertToPerpPrecision(size);

      const orderParams: OrderParams = {
        ...DefaultOrderParams,
        orderType,
        marketIndex,
        direction,
        baseAssetAmount,
        marketType: MarketType.PERP,
      };

      if (price !== undefined) {
        orderParams.price = client.convertToPricePrecision(price);
      }

      if (oraclePriceOffset !== undefined) {
        orderParams.oraclePriceOffset = client
          .convertToPricePrecision(oraclePriceOffset)
          .toNumber();
      }

      if (triggerPrice !== undefined) {
        orderParams.triggerPrice = client.convertToPricePrecision(triggerPrice);
      }

      if (triggerCondition !== undefined) {
        orderParams.triggerCondition =
          getTriggerConditionObject(triggerCondition);
      }

      if (reduceOnly !== undefined) {
        orderParams.reduceOnly = reduceOnly;
      }

      if (auctionStartPrice !== undefined) {
        orderParams.auctionStartPrice =
          client.convertToPricePrecision(auctionStartPrice);
      }

      if (auctionEndPrice !== undefined) {
        orderParams.auctionEndPrice =
          client.convertToPricePrecision(auctionEndPrice);
      }

      if (auctionDuration !== undefined) {
        orderParams.auctionDuration = auctionDuration;
      }

      if (maxTs !== undefined) {
        orderParams.maxTs = maxTs;
      }

      return orderParams;
    });

    const tx = await client.placeOrders(
      driftOrderParams,
      undefined,
      subAccountId
    );
    const txid = tx.toString();

    // Create a description that summarizes all orders
    const orderDescriptions = orderParamsArray.map((params) => {
      const { direction, size, marketIndex } = params;
      const directionText =
        direction === PositionDirection.LONG ? "Buy" : "Sell";
      const symbol = getMarketSymbol(marketIndex);
      return `${directionText} ${size.toFixed(5)} ${symbol}`;
    });

    const description = `Multiple Orders: ${orderDescriptions.join(", ")}`;

    return { success: true, txid, description };
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    return { success: false, error };
  }
};

export const cancelOrder = async (orderId: number): Promise<OrderResult> => {
  const client = driftService.getClient();
  if (!client) {
    const error = new Error("Drift client not initialized");
    return { success: false, error };
  }

  try {
    const tx = await client.cancelOrder(orderId);
    const txid = tx.toString();
    return { success: true, txid };
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    return { success: false, error };
  }
};
