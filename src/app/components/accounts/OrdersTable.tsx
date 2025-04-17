import { useState } from "react";
import { formatBN } from "@/utils/formatting";
import { getTokenIconUrl } from "@/utils/assets";
import { Order, OrderType } from "@drift-labs/sdk";
import { usePerpOrder } from "../../hooks/usePerpOrder";
import { useTransactions } from "../../hooks/useTransactions";
import { ConfirmCancelModal } from "./ConfirmCancelModal";
import { TransactionSuccessActionType } from "@/services/txTracker/txTracker";
import { CancelIcon } from "../../assets/icons";
import Image from "next/image";

interface Market {
  name?: string;
  marketIndex: number;
}

interface MarketMap {
  [key: number]: Market;
}

interface OrdersTableProps {
  orders: Order[];
  markets: MarketMap;
  isLoadingMarkets: boolean;
  viewOnly?: boolean;
}

export function OrdersTable({
  orders,
  markets,
  isLoadingMarkets,
  viewOnly = false,
}: OrdersTableProps) {
  const { cancelOrder, isLoading } = usePerpOrder();
  const { trackTransaction } = useTransactions();
  const [cancelModalState, setCancelModalState] = useState({
    isOpen: false,
    orderId: null as number | null,
    orderDetails: null as {
      marketName: string;
      orderType: string;
      orderSize: string;
      direction: string;
    } | null,
  });

  // Helper function to get order type display text
  const getOrderTypeDisplay = (orderType: OrderType): string => {
    if (orderType && "market" in orderType) return "MARKET";
    if (orderType && "limit" in orderType) return "LIMIT";
    if (orderType && "triggerMarket" in orderType) return "TRIGGER MARKET";
    if (orderType && "triggerLimit" in orderType) return "TRIGGER LIMIT";
    if (orderType && "oracle" in orderType) return "ORACLE";
    return "UNKNOWN";
  };

  const handleOpenCancelModal = (order: Order) => {
    const orderTypeDisplay = getOrderTypeDisplay(order.orderType);
    const marketName =
      markets[order.marketIndex]?.name || `Market #${order.marketIndex}`;
    const isLong = order.direction && "long" in order.direction;

    setCancelModalState({
      isOpen: true,
      orderId: order.orderId,
      orderDetails: {
        marketName,
        orderType: orderTypeDisplay,
        orderSize: `${formatBN(order.baseAssetAmount, false, 4)}`,
        direction: isLong ? "Long" : "Short",
      },
    });
  };

  const handleCloseCancelModal = () => {
    setCancelModalState({
      isOpen: false,
      orderId: null,
      orderDetails: null,
    });
  };

  const handleConfirmCancel = async () => {
    if (cancelModalState.orderId === null) return;

    try {
      const result = await cancelOrder(cancelModalState.orderId);

      if (result.success && result.txid) {
        trackTransaction(result.txid, "Cancel Order", [
          { type: TransactionSuccessActionType.UPDATE_USER_ACCOUNT },
          { type: TransactionSuccessActionType.REFRESH_ALL },
        ]);

        // Close the modal after successful cancellation
        handleCloseCancelModal();
      } else if (result.error) {
        console.error("Error canceling order:", result.error);
      }
    } catch (err) {
      console.error("Error canceling order:", err);
    }
  };

  if (orders.length === 0) {
    return (
      <div className="py-6 text-center text-neutrals-60 dark:text-neutrals-40">
        <p>No open orders for this account.</p>
      </div>
    );
  }

  return (
    <>
      <table className="min-w-full">
        <thead>
          <tr className="text-neutrals-60 dark:text-neutrals-40 border-b border-neutrals-20 dark:border-neutrals-70">
            <th className="text-left py-3 px-4 font-medium text-xs">Market</th>
            <th className="text-left py-3 px-4 font-medium text-xs">Type</th>
            <th className="text-left py-3 px-4 font-medium text-xs">Size</th>
            <th className="text-left py-3 px-4 font-medium text-xs">
              Trigger / Limit
            </th>
            <th className="text-left py-3 px-4 font-medium text-xs">Flags</th>
            {!viewOnly && (
              <th className="text-right py-3 px-4 font-medium text-xs">
                Action
              </th>
            )}
          </tr>
        </thead>
        <tbody className="text-sm">
          {orders.map((order) => {
            const marketData = markets[order.marketIndex];
            const isLimit =
              (order.orderType && "limit" in order.orderType) ||
              (order.orderType && "triggerLimit" in order.orderType);
            const isTrigger =
              (order.orderType && "triggerMarket" in order.orderType) ||
              (order.orderType && "triggerLimit" in order.orderType);

            const marketSymbol = marketData?.name?.split("-")[0] || "unknown";

            return (
              <tr
                key={order.orderId}
                className="border-b border-neutrals-20/20 dark:border-neutrals-70/20 hover:bg-neutrals-10/50 dark:hover:bg-neutrals-80/50"
              >
                <td className="py-2 px-4">
                  <div className="flex items-center">
                    <div className="w-6 h-6 mr-2 flex-shrink-0 bg-neutrals-5 dark:bg-neutrals-90 rounded-full flex items-center justify-center">
                      <Image
                        src={getTokenIconUrl(marketSymbol)}
                        alt={marketData?.name || `Market #${order.marketIndex}`}
                        width={16}
                        height={16}
                        className="w-4 h-4 object-contain"
                        onError={(e) => {
                          // Fallback to default icon if image fails to load
                          (
                            e.target as HTMLImageElement
                          ).src = `https://drift-public.s3.eu-central-1.amazonaws.com/assets/icons/markets/${marketSymbol.toLowerCase()}.svg`;
                        }}
                      />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-medium text-sm">
                        {isLoadingMarkets
                          ? `Market #${order.marketIndex}`
                          : marketData?.name || `Market #${order.marketIndex}`}
                      </span>
                      <div
                        className={`text-xs ${
                          order.direction && "long" in order.direction
                            ? "text-green-50"
                            : "text-red-50"
                        }`}
                      >
                        {order.direction && "long" in order.direction
                          ? "Long"
                          : "Short"}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="py-2 px-4 font-medium text-sm">
                  {getOrderTypeDisplay(order.orderType)}
                </td>
                <td className="py-2 px-4 text-left font-medium text-sm">
                  <div>
                    {formatBN(order.baseAssetAmountFilled, false, 4)} /{" "}
                    {formatBN(order.baseAssetAmount, false, 4)}
                  </div>
                </td>
                <td className="py-2 px-4 text-left font-medium text-sm">
                  <div>
                    {isTrigger ? formatBN(order.triggerPrice, true, 2) : "-"} /{" "}
                    {isLimit ? formatBN(order.price, true, 2) : "-"}
                  </div>
                </td>
                <td className="py-2 px-4 text-left">
                  <div className="flex flex-wrap gap-1">
                    {order.reduceOnly && (
                      <span className="bg-blue-50/10 text-blue-300 px-2 py-0.5 rounded text-xs">
                        REDUCE
                      </span>
                    )}
                    {order.postOnly && (
                      <span className="bg-purple-50/10 text-purple-50 px-2 py-0.5 rounded text-xs">
                        POST
                      </span>
                    )}
                    {order.immediateOrCancel && (
                      <span className="bg-orange-50/10 text-orange-50 px-2 py-0.5 rounded text-xs">
                        IOC
                      </span>
                    )}
                    {!order.reduceOnly &&
                      !order.postOnly &&
                      !order.immediateOrCancel &&
                      "-"}
                  </div>
                </td>
                {!viewOnly && (
                  <td className="py-2 px-4 text-right">
                    <div className="flex justify-end space-x-2">
                      <button
                        className="p-1.5 bg-neutrals-5 dark:bg-neutrals-90 rounded hover:bg-red-50/10 transition-colors"
                        onClick={() => handleOpenCancelModal(order)}
                        disabled={
                          isLoading &&
                          cancelModalState.orderId === order.orderId
                        }
                      >
                        <div className="relative w-4 h-4">
                          <CancelIcon
                            size="sm"
                            className={`text-red-50 ${
                              isLoading &&
                              cancelModalState.orderId === order.orderId
                                ? "animate-pulse"
                                : ""
                            }`}
                          />
                        </div>
                      </button>
                    </div>
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Confirmation Modal */}
      {!viewOnly && (
        <ConfirmCancelModal
          isOpen={cancelModalState.isOpen}
          onClose={handleCloseCancelModal}
          onConfirm={handleConfirmCancel}
          isLoading={isLoading}
          orderDetails={cancelModalState.orderDetails}
        />
      )}
    </>
  );
}
