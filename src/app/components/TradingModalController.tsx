import { useState, useEffect } from "react";
import { usePerpMarketAccounts } from "../hooks/usePerpMarketAccounts";
import { useActiveAccount } from "../providers/ActiveAccountProvider";
import { OrderType, PositionDirection } from "@drift-labs/sdk";
import { TradingModal } from "./modal/TradingModal";
import { CustomDropdown, DropdownOption } from "./CustomDropdown";
import { usePNLUserData } from "../hooks/usePNLUserData";
import { useWallet } from "@solana/wallet-adapter-react";
import { useTradingStore } from "../stores/tradingStore";

export const TradingModalController = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [orderDirection, setOrderDirection] = useState<PositionDirection>(
    PositionDirection.LONG
  );
  const [selectedMarketIndex, setSelectedMarketIndex] = useState(0);
  const resetState = useTradingStore((state) => state.resetState);

  const { marketsList, isLoading: isLoadingMarkets } = usePerpMarketAccounts();

  const { activeAccountId, switchActiveAccount } = useActiveAccount();
  const { publicKey } = useWallet();
  const { subaccounts, isLoading: isLoadingSubaccounts } =
    usePNLUserData(publicKey);

  const [subaccountOptions, setSubaccountOptions] = useState<
    Array<DropdownOption>
  >([]);
  const [marketOptions, setMarketOptions] = useState<Array<DropdownOption>>([]);

  useEffect(() => {
    if (subaccounts.length > 0) {
      const options = subaccounts.map((account) => ({
        value: account.subAccountId,
        label: String.fromCharCode(...account.name).trim(),
      }));
      setSubaccountOptions(options);
    }
  }, [subaccounts.length]);

  useEffect(() => {
    if (marketsList && marketsList.length > 0) {
      const options = marketsList.map((market) => ({
        value: market.marketIndex,
        label: market.name,
      }));
      setMarketOptions(options);
    }
  }, [marketsList.length]);

  const handleMarketChange = (value: string | number) => {
    setSelectedMarketIndex(Number(value));
  };

  const handleSubaccountChange = (value: string | number) => {
    const newSubaccountId = Number(value);
    switchActiveAccount(newSubaccountId);
  };

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const isLongDirection = () => {
    return orderDirection === PositionDirection.LONG;
  };

  const isShortDirection = () => {
    return orderDirection === PositionDirection.SHORT;
  };

  return (
    <div className="bg-neutrals-5 dark:bg-neutrals-80 rounded-lg p-4 shadow-sm mb-4 sticky top-0">
      <h2 className="text-xl font-medium text-neutrals-100 dark:text-neutrals-0 mb-4">
        Trading Controls
      </h2>

      <div className="space-y-4">
        {/* Subaccount selection */}
        <CustomDropdown
          label="Select Sub-account"
          options={subaccountOptions}
          value={activeAccountId}
          onChange={handleSubaccountChange}
          placeholder={
            isLoadingSubaccounts
              ? "Loading accounts..."
              : "Select sub-account..."
          }
          disabled={isLoadingSubaccounts}
        />

        <CustomDropdown
          label="Select Market"
          options={marketOptions}
          value={selectedMarketIndex}
          onChange={handleMarketChange}
          placeholder={
            isLoadingMarkets ? "Loading markets..." : "Select market..."
          }
          disabled={isLoadingMarkets}
        />

        <div>
          <div className="text-xs text-neutrals-80 dark:text-neutrals-30 mb-1.5">
            Position Direction
          </div>
          <div className="flex rounded-md overflow-hidden">
            <button
              onClick={() => setOrderDirection(PositionDirection.LONG)}
              className={`flex-1 py-2 text-sm font-medium transition-colors ${
                isLongDirection()
                  ? "bg-green-50 text-white"
                  : "bg-neutrals-10 dark:bg-neutrals-80 text-neutrals-60 dark:text-neutrals-40 hover:bg-neutrals-20 dark:hover:bg-neutrals-70"
              }`}
            >
              Long
            </button>
            <button
              onClick={() => setOrderDirection(PositionDirection.SHORT)}
              className={`flex-1 py-2 text-sm font-medium transition-colors ${
                isShortDirection()
                  ? "bg-red-50 text-white"
                  : "bg-neutrals-10 dark:bg-neutrals-80 text-neutrals-60 dark:text-neutrals-40 hover:bg-neutrals-20 dark:hover:bg-neutrals-70"
              }`}
            >
              Short
            </button>
          </div>
        </div>

        <button
          onClick={handleOpenModal}
          className="w-full bg-purple-50 hover:bg-purple-60 text-white py-2 px-4 rounded-md transition-colors"
        >
          {orderDirection === PositionDirection.LONG ? "Long" : "Short"}{" "}
          {marketsList[selectedMarketIndex]?.name || "Market"}
        </button>
      </div>

      {isModalOpen && (
        <TradingModal
          marketIndex={selectedMarketIndex}
          orderDirection={orderDirection}
          orderType={OrderType.MARKET}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            resetState();
          }}
        />
      )}
    </div>
  );
};
