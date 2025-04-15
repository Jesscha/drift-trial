import { PositionDirection } from "@drift-labs/sdk";
import { useTradingStore } from "@/app/stores/tradingStore";

export const OrderDirectionToggle = () => {
  const selectedDirection = useTradingStore((state) => state.selectedDirection);
  const setSelectedDirection = useTradingStore(
    (state) => state.setSelectedDirection
  );

  return (
    <div>
      <div className="flex bg-neutrals-10 dark:bg-neutrals-80 p-1 rounded-lg">
        <button
          onClick={() => setSelectedDirection(PositionDirection.LONG)}
          className={`flex-1 py-1.5 text-sm rounded-md text-center font-medium transition-colors ${
            selectedDirection === PositionDirection.LONG
              ? "bg-green-60 text-white"
              : "text-neutrals-60 dark:text-neutrals-40"
          }`}
        >
          Long
        </button>
        <button
          onClick={() => setSelectedDirection(PositionDirection.SHORT)}
          className={`flex-1 py-1.5 text-sm rounded-md text-center font-medium transition-colors ${
            selectedDirection === PositionDirection.SHORT
              ? "bg-red-60 text-white"
              : "text-neutrals-60 dark:text-neutrals-40"
          }`}
        >
          Short
        </button>
      </div>
    </div>
  );
};
