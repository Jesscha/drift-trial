import { useContext } from "react";
import {
  TransactionContextType,
  TransactionContext,
} from "../providers/TransactionProvider";

export function useTransactions(): TransactionContextType {
  const context = useContext(TransactionContext);
  if (!context) {
    throw new Error(
      "useTransactions must be used within a TransactionProvider"
    );
  }
  return context;
}
