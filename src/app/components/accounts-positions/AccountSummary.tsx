import { formatBN } from "../../utils/number";

interface AccountSummaryProps {
  depositAmount: any;
  netUnsettledPnl: any;
  netTotal: any;
}

export function AccountSummary({
  depositAmount,
  netUnsettledPnl,
  netTotal,
}: AccountSummaryProps) {
  return (
    <div className="grid grid-cols-3 gap-4 mb-4 bg-neutrals-10/50 dark:bg-neutrals-80/50 p-3 rounded-lg">
      <div>
        <p className="text-neutrals-60 dark:text-neutrals-40 text-sm">
          Deposits
        </p>
        <p className="font-bold">{formatBN(depositAmount, true)}</p>
      </div>
      <div>
        <p className="text-neutrals-60 dark:text-neutrals-40 text-sm">
          Unsettled PnL
        </p>
        <p
          className={`font-bold ${
            netUnsettledPnl.isNeg()
              ? "text-red-50"
              : netUnsettledPnl.isZero()
              ? ""
              : "text-green-50"
          }`}
        >
          {formatBN(netUnsettledPnl, true)}
        </p>
      </div>
      <div>
        <p className="text-neutrals-60 dark:text-neutrals-40 text-sm">
          Net Value
        </p>
        <p className="font-bold">{formatBN(netTotal, true)}</p>
      </div>
    </div>
  );
}
