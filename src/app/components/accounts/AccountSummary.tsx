import { formatBN } from "../../utils/number";
import { BN } from "@drift-labs/sdk";

interface AccountSummaryProps {
  depositAmount: BN;
  netUnsettledPnl: BN;
  netTotal: BN;
}

export function AccountSummary({
  depositAmount,
  netUnsettledPnl,
  netTotal,
}: AccountSummaryProps) {
  return (
    <div className="grid grid-cols-3 gap-5 bg-neutrals-10 dark:bg-neutrals-80 p-4 rounded-lg">
      <div className="flex flex-col">
        <p className="text-neutrals-60 dark:text-neutrals-40 text-sm mb-1.5">
          Deposits
        </p>
        <p className="font-medium text-lg">${formatBN(depositAmount, true)}</p>
      </div>
      <div className="flex flex-col">
        <p className="text-neutrals-60 dark:text-neutrals-40 text-sm mb-1.5">
          Unsettled PnL
        </p>
        <p
          className={`font-medium text-lg ${
            netUnsettledPnl.isNeg()
              ? "text-red-50"
              : netUnsettledPnl.isZero()
              ? ""
              : "text-green-50"
          }`}
        >
          ${formatBN(netUnsettledPnl, true)}
        </p>
      </div>
      <div className="flex flex-col">
        <p className="text-neutrals-60 dark:text-neutrals-40 text-sm mb-1.5">
          Net Value
        </p>
        <p className="font-medium text-lg">${formatBN(netTotal, true)}</p>
      </div>
    </div>
  );
}
