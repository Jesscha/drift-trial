import { formatBN } from "../../utils/number";

interface PortfolioSummaryProps {
  totalDepositAmount: any;
  totalUnsettledPnl: any;
  totalNetValue: any;
}

export function PortfolioSummary({
  totalDepositAmount,
  totalUnsettledPnl,
  totalNetValue,
}: PortfolioSummaryProps) {
  return (
    <div className="mb-4">
      <h2 className="text-xl font-bold mb-3">Portfolio Summary</h2>
      <div className="bg-neutrals-20 dark:bg-neutrals-70 rounded-lg p-3 mb-4">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-neutrals-60 dark:text-neutrals-40 text-sm">
              Total Deposits
            </p>
            <p className="font-bold">{formatBN(totalDepositAmount, true)}</p>
          </div>
          <div>
            <p className="text-neutrals-60 dark:text-neutrals-40 text-sm">
              Total Unsettled PnL
            </p>
            <p
              className={`font-bold ${
                totalUnsettledPnl?.isNeg()
                  ? "text-red-50"
                  : totalUnsettledPnl?.isZero()
                  ? ""
                  : "text-green-50"
              }`}
            >
              {formatBN(totalUnsettledPnl, true)}
            </p>
          </div>
          <div>
            <p className="text-neutrals-60 dark:text-neutrals-40 text-sm">
              Net Value
            </p>
            <p className="font-bold">{formatBN(totalNetValue, true)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
