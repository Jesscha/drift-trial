import { formatBN } from "../../utils/number";
import { BN } from "@drift-labs/sdk";

interface PortfolioSummaryProps {
  totalDepositAmount: BN;
  totalUnsettledPnl: BN;
  totalNetValue: BN;
}

export function PortfolioSummary({
  totalDepositAmount,
  totalUnsettledPnl,
  totalNetValue,
}: PortfolioSummaryProps) {
  return (
    <div>
      <div className="flex items-center mb-4">
        <h2 className="text-lg font-medium">Account Summary</h2>
      </div>
      <div className="bg-neutrals-10 dark:bg-neutrals-80 rounded-lg p-5">
        <div className="grid grid-cols-3 gap-8">
          <div className="flex flex-col">
            <p className="text-neutrals-60 dark:text-neutrals-40 text-sm mb-2">
              Total Deposits
            </p>
            <p className="font-medium text-xl">
              ${formatBN(totalDepositAmount, true)}
            </p>
          </div>
          <div className="flex flex-col">
            <p className="text-neutrals-60 dark:text-neutrals-40 text-sm mb-2">
              Total Unsettled PnL
            </p>
            <p
              className={`font-medium text-xl ${
                totalUnsettledPnl?.isNeg()
                  ? "text-red-50"
                  : totalUnsettledPnl?.isZero()
                  ? ""
                  : "text-green-50"
              }`}
            >
              ${formatBN(totalUnsettledPnl, true)}
            </p>
          </div>
          <div className="flex flex-col">
            <p className="text-neutrals-60 dark:text-neutrals-40 text-sm mb-2">
              Net Value
            </p>
            <p className="font-medium text-xl">
              ${formatBN(totalNetValue, true)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
