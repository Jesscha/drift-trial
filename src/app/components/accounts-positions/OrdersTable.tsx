import { useState } from "react";
import { formatBN } from "../../utils/number";
import { getTokenIconUrl } from "../../utils/url";
import { OrderType } from "@drift-labs/sdk";
import { usePerpOrder } from "../../hooks/usePerpOrder";
import { useTransactions } from "../../hooks/useTransactions";
import { ConfirmCancelModal } from "./ConfirmCancelModal";
import { TransactionSuccessActionType } from "@/services/txTracker/txTracker";

interface OrdersTableProps {
  orders: any[];
  markets: any;
  isLoadingMarkets: boolean;
}

export function OrdersTable({
  orders,
  markets,
  isLoadingMarkets,
}: OrdersTableProps) {
  const { cancelOrder, isLoading, error } = usePerpOrder();
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

  const handleOpenCancelModal = (order: any) => {
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
      <div className="py-4 text-center text-neutrals-60 dark:text-neutrals-40">
        <p>No open orders for this account.</p>
      </div>
    );
  }

  return (
    <>
      <table className="min-w-full text-sm">
        <thead>
          <tr className="text-neutrals-60 dark:text-neutrals-40 border-b border-neutrals-30 dark:border-neutrals-60">
            <th className="text-left py-2 px-4">Market</th>
            <th className="text-left py-2 px-4">Type</th>
            <th className="text-left py-2 px-4">Size</th>
            <th className="text-left py-2 px-4">Trigger / Limit</th>
            <th className="text-left py-2 px-4">Flags</th>
            <th className="text-right py-2 px-4">Action</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => {
            const marketData = markets[order.marketIndex];
            const isLimit =
              (order.orderType && "limit" in order.orderType) ||
              (order.orderType && "triggerLimit" in order.orderType);
            const isTrigger =
              (order.orderType && "triggerMarket" in order.orderType) ||
              (order.orderType && "triggerLimit" in order.orderType);

            return (
              <tr
                key={order.orderId}
                className="border-b border-neutrals-30/30 dark:border-neutrals-60/30"
              >
                <td className="py-3 px-4">
                  <div className="flex items-center">
                    <div className="w-6 h-6 mr-2 flex-shrink-0">
                      <img
                        src={getTokenIconUrl(marketData?.name?.split("-")[0])}
                        alt={marketData?.name || `Market #${order.marketIndex}`}
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          // Fallback to default icon if image fails to load
                          (
                            e.target as HTMLImageElement
                          ).src = `https://drift-public.s3.eu-central-1.amazonaws.com/assets/icons/markets/${marketData?.name
                            ?.split("-")[0]
                            .toLowerCase()}.svg`;
                        }}
                      />
                    </div>
                    <div className="flex flex-col">
                      {isLoadingMarkets
                        ? `Market #${order.marketIndex}`
                        : marketData?.name || `Market #${order.marketIndex}`}
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
                <td className="py-3 px-4">
                  {getOrderTypeDisplay(order.orderType)}
                </td>
                <td className="py-3 px-4 text-left">
                  {formatBN(order.baseAssetAmountFilled, false, 4)} /{" "}
                  {formatBN(order.baseAssetAmount, false, 4)}
                </td>
                <td className="py-3 px-4 text-left">
                  {isTrigger ? formatBN(order.triggerPrice, true, 2) : "-"} /{" "}
                  {isLimit ? formatBN(order.price, true, 2) : "-"}
                </td>
                <td className="py-3 px-4 text-left">
                  {order.reduceOnly && (
                    <span className="bg-blue-50/20 text-blue-400 px-2 py-0.5 rounded text-xs mr-1">
                      REDUCE ONLY
                    </span>
                  )}
                  {order.postOnly && (
                    <span className="bg-purple-50/20 text-purple-50 px-2 py-0.5 rounded text-xs mr-1">
                      POST ONLY
                    </span>
                  )}
                  {order.immediateOrCancel && (
                    <span className="bg-orange-50/20 text-orange-50 px-2 py-0.5 rounded text-xs">
                      IOC
                    </span>
                  )}
                  {!order.reduceOnly &&
                    !order.postOnly &&
                    !order.immediateOrCancel &&
                    "-"}
                </td>
                <td className="py-3 px-4 text-right">
                  <div className="flex justify-end space-x-2">
                    <button
                      className="p-2 bg-neutrals-10 dark:bg-neutrals-60 rounded hover:bg-red-50/20"
                      onClick={() => handleOpenCancelModal(order)}
                      disabled={
                        isLoading && cancelModalState.orderId === order.orderId
                      }
                    >
                      <img
                        src="/icons/trash.svg"
                        alt="Cancel order"
                        width={16}
                        height={16}
                        className={
                          isLoading &&
                          cancelModalState.orderId === order.orderId
                            ? "text-red-50 animate-pulse"
                            : ""
                        }
                      />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Confirmation Modal */}
      <ConfirmCancelModal
        isOpen={cancelModalState.isOpen}
        onClose={handleCloseCancelModal}
        onConfirm={handleConfirmCancel}
        isLoading={isLoading}
        orderDetails={cancelModalState.orderDetails}
      />
    </>
  );
}
