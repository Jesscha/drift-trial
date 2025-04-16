import { formatBN } from "../../utils/number";
import Image from "next/image";

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
    <div>
      <div className="flex items-center mb-4">
        <div className="bg-neutrals-10 dark:bg-neutrals-80 rounded-full h-8 w-8 flex items-center justify-center mr-3">
          <div className="relative h-4 w-4">
            <Image
              src="/icons/chart.svg"
              alt="Portfolio Chart"
              width={16}
              height={16}
              className="text-purple-50"
            />
          </div>
        </div>
        <h2 className="text-lg font-medium">Portfolio Summary</h2>
      </div>
      <div className="bg-neutrals-10 dark:bg-neutrals-80 rounded-lg p-5">
        <div className="grid grid-cols-3 gap-8">
          <div className="flex flex-col">
            <p className="text-neutrals-60 dark:text-neutrals-40 text-sm mb-2">
              Total Deposits
            </p>
            <p className="font-medium text-xl">
              {formatBN(totalDepositAmount, true)}
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
              {formatBN(totalUnsettledPnl, true)}
            </p>
          </div>
          <div className="flex flex-col">
            <p className="text-neutrals-60 dark:text-neutrals-40 text-sm mb-2">
              Net Value
            </p>
            <p className="font-medium text-xl">
              {formatBN(totalNetValue, true)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
