export type StorageMode = "neon" | "local";

export type TransactionDirection = "debit" | "credit" | "request";

export type TransactionStatus =
  | "Completed"
  | "Pending"
  | "Initiated"
  | "Requested"
  | "Canceled"
  | "Expired"
  | "Refunded"
  | "Failed";

export interface WalletSummary {
  id: number;
  ownerName: string;
  khaltiId: string;
  balancePaisa: number;
  savingPaisa: number;
  billsPaisa: number;
  currency: string;
  updatedAt: string;
}

export interface Transaction {
  id: number;
  title: string;
  counterparty: string;
  counterpartyPhone: string | null;
  category: string;
  direction: TransactionDirection;
  status: TransactionStatus;
  amountPaisa: number;
  provider: "khalti" | "nova";
  khaltiPidx: string | null;
  khaltiTransactionId: string | null;
  purchaseOrderId: string | null;
  paymentUrl: string | null;
  note: string | null;
  createdAt: string;
}

export interface Goal {
  id: number;
  name: string;
  targetPaisa: number;
  savedPaisa: number;
  targetDate: string;
  createdAt: string;
}

export interface DashboardResponse {
  storageMode: StorageMode;
  khaltiMode: "live" | "sandbox";
  wallet: WalletSummary;
  transactions: Transaction[];
  goals: Goal[];
  stats: {
    monthIncomePaisa: number;
    monthSpendPaisa: number;
    monthBillsPaisa: number;
    pendingRequestsCount: number;
    pendingRequestsPaisa: number;
    goalsSavedPaisa: number;
    goalsTargetPaisa: number;
  };
}

export interface OverviewCategoryStat {
  name: string;
  amountPaisa: number;
  percent: number;
  count: number;
}

export interface OverviewResponse {
  storageMode: StorageMode;
  selectedMonth: string;
  availableMonths: string[];
  wallet: WalletSummary;
  totals: {
    incomePaisa: number;
    spendPaisa: number;
    billsPaisa: number;
    netSavingsPaisa: number;
    spendRatio: number;
    savingsRatio: number;
    taxEstimateRatio: number;
  };
  weekly: {
    label: string;
    amountPaisa: number;
    percentOfMax: number;
  }[];
  categories: OverviewCategoryStat[];
  recentTransactions: Transaction[];
}
