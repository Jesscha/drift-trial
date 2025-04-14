import {
  OrderType,
  PositionDirection,
  BN,
  OrderTriggerCondition,
  MarketType,
  OrderParams,
  DefaultOrderParams,
} from "@drift-labs/sdk";
import driftService from "./client";
import { TransactionSuccessActionType } from "@/services/txTracker/txTracker";

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
  triggerCondition?: any;
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
  params: PlacePerpOrderParams
): Promise<OrderResult> => {
  console.log("Step 1: Validating client and account");
  const client = driftService.getClient();
  if (!client) {
    const error = new Error("Drift client not initialized");
    return { success: false, error };
  }

  try {
    console.log("Step 3: Destructuring parameters");
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

    console.log("Step 4: Converting size to base asset precision");
    const baseAssetAmount = client.convertToPerpPrecision(size);

    console.log("Step 5: Building base order parameters");
    const orderParams: OrderParams = {
      ...DefaultOrderParams,
      orderType,
      marketIndex,
      direction,
      baseAssetAmount,
      marketType: MarketType.PERP,
    };

    console.log("Step 6: Adding optional price parameters");
    if (price !== undefined) {
      orderParams.price = client.convertToPricePrecision(price);
    }

    if (oraclePriceOffset !== undefined) {
      orderParams.oraclePriceOffset = client
        .convertToPricePrecision(oraclePriceOffset)
        .toNumber();
    }

    console.log("Step 7: Adding trigger parameters if provided");
    if (triggerPrice !== undefined) {
      orderParams.triggerPrice = client.convertToPricePrecision(triggerPrice);
    }

    if (triggerCondition !== undefined) {
      orderParams.triggerCondition =
        getTriggerConditionObject(triggerCondition);
    }

    console.log("Step 8: Adding reduce only flag if provided");
    if (reduceOnly !== undefined) {
      orderParams.reduceOnly = reduceOnly;
    }

    console.log("Step 9: Adding auction parameters if provided");
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

    console.log("Step 10: Adding max timestamp if provided");
    if (maxTs !== undefined) {
      orderParams.maxTs = maxTs;
    }

    console.log("Step 11: Placing the order", orderParams);
    const tx = await client.placePerpOrder(orderParams);
    console.log("Step 11: Order placed", tx);
    const txid = tx.toString();

    console.log("Step 12: Creating transaction description");
    const market =
      client.getPerpMarketAccount(marketIndex)?.name ||
      `Market #${marketIndex}`;
    const directionText = direction === PositionDirection.LONG ? "Buy" : "Sell";
    const orderTypeText = getOrderTypeLabel(orderType);
    const triggerText = triggerPrice ? ` (Trigger: ${triggerPrice})` : "";
    const priceText = price ? `@${price}` : "at market";

    const description = `${directionText} ${size} ${market} ${orderTypeText} ${priceText}${triggerText}`;

    return { success: true, txid, description };
  } catch (err) {
    console.log("Step 15: Handling error", err);
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
  size: number
): Promise<OrderResult> => {
  console.log("Placing market order");
  return placePerpOrder({
    marketIndex,
    direction,
    size,
    orderType: OrderType.MARKET,
  });
};

/**
 * Convenience method for placing a limit order
 */
export const placeLimitOrder = async (
  marketIndex: number,
  direction: PositionDirection,
  size: number,
  price: number
): Promise<OrderResult> => {
  return placePerpOrder({
    marketIndex,
    direction,
    size,
    price,
    orderType: OrderType.LIMIT,
  });
};

/**
 * Convenience method for placing an oracle-based order
 */
export const placeOracleOrder = async (
  marketIndex: number,
  direction: PositionDirection,
  size: number,
  oraclePriceOffset: number
): Promise<OrderResult> => {
  return placePerpOrder({
    marketIndex,
    direction,
    size,
    orderType: OrderType.ORACLE,
    oraclePriceOffset,
  });
};

/**
 * Convenience method for placing a trigger market order (stop market)
 */
export const placeTriggerMarketOrder = async (
  marketIndex: number,
  direction: PositionDirection,
  size: number,
  triggerPrice: number,
  triggerCondition: any,
  reduceOnly: boolean = false
): Promise<OrderResult> => {
  return placePerpOrder({
    marketIndex,
    direction,
    size,
    orderType: OrderType.TRIGGER_MARKET,
    triggerPrice,
    triggerCondition,
    reduceOnly,
  });
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
  triggerCondition: any,
  reduceOnly: boolean = false
): Promise<OrderResult> => {
  return placePerpOrder({
    marketIndex,
    direction,
    size,
    price,
    orderType: OrderType.TRIGGER_LIMIT,
    triggerPrice,
    triggerCondition,
    reduceOnly,
  });
};

/**
 * Places multiple perpetual futures orders with the Drift protocol
 * @param orderParamsArray Array of order parameters
 * @returns OrderResult with success status and transaction ID
 */
export const placeOrders = async (
  orderParamsArray: PlacePerpOrderParams[]
): Promise<OrderResult> => {
  console.log("Step 1: Validating client and account");
  const client = driftService.getClient();
  if (!client) {
    const error = new Error("Drift client not initialized");
    return { success: false, error };
  }

  try {
    console.log("Step 2: Processing multiple orders");
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

    console.log("Step 3: Placing multiple orders", driftOrderParams);
    const tx = await client.placeOrders(driftOrderParams);
    console.log("Step 4: Orders placed", tx);
    const txid = tx.toString();

    console.log("Step 5: Creating transaction description");
    // Create a description that summarizes all orders
    const orderDescriptions = orderParamsArray.map((params) => {
      const {
        marketIndex,
        direction,
        size,
        price,
        orderType = OrderType.LIMIT,
        triggerPrice,
      } = params;

      const market =
        client.getPerpMarketAccount(marketIndex)?.name ||
        `Market #${marketIndex}`;
      const directionText =
        direction === PositionDirection.LONG ? "Buy" : "Sell";
      const orderTypeText = getOrderTypeLabel(orderType);
      const triggerText = triggerPrice ? ` (Trigger: ${triggerPrice})` : "";
      const priceText = price ? `@${price}` : "at market";

      return `${directionText} ${size} ${market} ${orderTypeText} ${priceText}${triggerText}`;
    });

    const description = `Multiple Orders: ${orderDescriptions.join(", ")}`;

    return { success: true, txid, description };
  } catch (err) {
    console.log("Step 6: Handling error", err);
    const error = err instanceof Error ? err : new Error(String(err));
    return { success: false, error };
  }
};
