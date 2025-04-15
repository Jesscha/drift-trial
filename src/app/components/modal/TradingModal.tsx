"use client";

import { OrderType, PositionDirection } from "@drift-labs/sdk";
import { Modal } from "./Modal";
import { useOrderBook } from "@/app/hooks/useOrderBook";
import { usePerpMarketAccounts } from "@/app/hooks/usePerpMarketAccounts";
import { OrderBook } from "../trading/OrderBook";
import { useEffect, useRef } from "react";
import { useTradingStore } from "@/app/stores/tradingStore";
import {
  formatMarketName,
  isTriggerOrderType,
  OrderTypeOption,
} from "./TradingModal.util";
import { OrderConfirmationModal } from "./OrderConfirmationModal";
import { useOrderPrice, useOrderExecution } from "@/app/hooks/trading";
import { OrderButton } from "@/app/components/trading/OrderButton";
import { OrderSizeInputs } from "@/app/components/trading/OrderSizeInputs";
import { OrderDirectionToggle } from "@/app/components/trading/OrderDirectionToggle";
import { OrderTypeTabs } from "@/app/components/trading/OrderTypeTabs";
import { ScaleOrdersSection } from "@/app/components/trading/ScaleOrdersSection";
import { TakeProfitStopLossSection } from "@/app/components/trading/TakeProfitStopLossSection";
import { TriggerConditionDropdown } from "@/app/components/trading/TriggerConditionDropdown";
import { OrderInputSection } from "../trading/OrderInputSection";

export const TradingModal = ({
  isOpen,
  onClose,
  marketIndex,
  orderDirection: initialOrderDirection,
  orderType: initialOrderType,
  orderSize,
}: {
  isOpen: boolean;
  onClose: () => void;
  marketIndex: number;
  orderDirection: PositionDirection;
  orderType: OrderType;
  orderSize?: number;
}) => {
  const { marketsList } = usePerpMarketAccounts();
  const { data, isLoading } = useOrderBook(marketsList[marketIndex]?.name);
  const selectedCustomOrderType = useTradingStore(
    (state) => state.selectedCustomOrderType
  );

  const initializeState = useTradingStore((state) => state.initializeState);
  const resetState = useTradingStore((state) => state.resetState);

  const { handlePriceClick } = useOrderPrice(marketIndex);

  const { showConfirmation, handleCloseConfirmation, executeOrder } =
    useOrderExecution(marketIndex, onClose);

  const initializedRef = useRef(false);

  useEffect(() => {
    if (isOpen && !initializedRef.current) {
      initializedRef.current = true;
      initializeState(orderSize, initialOrderType, initialOrderDirection);
    } else if (!isOpen) {
      initializedRef.current = false;
    }
  }, [
    isOpen,
    orderSize,
    initialOrderType,
    initialOrderDirection,
    initializeState,
  ]);

  useEffect(() => {
    if (!isOpen) {
      resetState();
    }
  }, [isOpen, resetState]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <div className="bg-neutrals-10 dark:bg-neutrals-80 rounded-full h-8 w-8 flex items-center justify-center">
            <svg
              viewBox="0 0 24 24"
              width="14"
              height="14"
              className="text-purple-50"
            >
              <circle
                cx="12"
                cy="12"
                r="10"
                fill="currentColor"
                opacity="0.2"
              />
              <path
                d="M12 6v12M6 12h12"
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
              />
            </svg>
          </div>
          <div className="text-base font-medium text-neutrals-100 dark:text-neutrals-0">
            {formatMarketName(marketsList[marketIndex]?.name) || "Market"}
          </div>
        </div>
      }
    >
      <div className="flex flex-row h-full w-[700px]">
        <div className="sticky top-0 h-full overflow-hidden">
          <OrderBook
            orderBookData={data}
            isLoading={isLoading}
            onPriceClick={handlePriceClick}
          />
        </div>

        <div className="flex-1 flex flex-col gap-4 ml-4 p-3 pt-0 bg-neutrals-5 dark:bg-neutrals-90 rounded-lg">
          <OrderTypeTabs marketIndex={marketIndex} />

          <OrderDirectionToggle />

          <OrderInputSection marketIndex={marketIndex} />

          {isTriggerOrderType(selectedCustomOrderType) && (
            <TriggerConditionDropdown marketIndex={marketIndex} />
          )}

          <OrderSizeInputs
            marketName={marketsList[marketIndex]?.name || ""}
            marketIndex={marketIndex}
          />

          {selectedCustomOrderType === OrderTypeOption.LIMIT && (
            <ScaleOrdersSection marketIndex={marketIndex} />
          )}

          <TakeProfitStopLossSection />

          <OrderButton
            marketName={marketsList[marketIndex]?.name || ""}
            marketIndex={marketIndex}
            onOrderConfirmed={onClose}
          />
        </div>
      </div>

      <OrderConfirmationModal
        showConfirmation={showConfirmation}
        onClose={handleCloseConfirmation}
        onConfirm={executeOrder}
        marketsList={marketsList}
        marketIndex={marketIndex}
      />
    </Modal>
  );
};
