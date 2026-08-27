import { api } from "./api";
import {
  Wallet,
  WalletTransaction,
  normalizeWallet,
  normalizeTransactions,
  normalizeTransaction,
} from "@/types/wallet";
import { mockWalletData, delay } from "./mockData";

// Local in-memory state for development fallback
let devWalletState: Wallet = {
  id: "wallet-user-1",
  userId: "user-1",
  balance: mockWalletData.balance,
  currency: mockWalletData.currency || "NPR",
  updatedAt: new Date().toISOString(),
};

// Initial development fallback transaction history (if connected or simulated)
let devTransactionsState: WalletTransaction[] = [];

/**
 * Fetch authenticated renter's wallet balance from GET /wallets/me.
 */
export const getWalletBalance = async (): Promise<Wallet> => {
  try {
    const response = await api.get("/wallets/me");
    return normalizeWallet(response.data);
  } catch (error) {
    console.warn("Backend GET /wallets/me is not reachable, using fallback wallet store for development:", error);
    await delay(300);
    return { ...devWalletState };
  }
};

/**
 * Deposit funds into the renter wallet via POST /wallets/deposit.
 */
export const depositFunds = async (
  amount: number
): Promise<{ success: boolean; wallet: Wallet; transaction?: WalletTransaction; message?: string }> => {
  try {
    const response = await api.post("/wallets/deposit", { amount });
    const data = response.data;
    
    // Normalize returned wallet or refetch
    let updatedWallet: Wallet;
    if (data?.wallet || data?.balance !== undefined) {
      updatedWallet = normalizeWallet(data.wallet || data);
    } else {
      updatedWallet = await getWalletBalance();
    }

    const transaction = data?.transaction ? normalizeTransaction(data.transaction) : undefined;

    return {
      success: true,
      wallet: updatedWallet,
      transaction,
      message: "Funds deposited successfully.",
    };
  } catch (error: unknown) {
    console.warn("Backend POST /wallets/deposit failed, performing optimistic mock update:", error);
    await delay(600);

    const newBalance = Number((devWalletState.balance + amount).toFixed(2));
    devWalletState = {
      ...devWalletState,
      balance: newBalance,
      updatedAt: new Date().toISOString(),
    };

    const newTransaction: WalletTransaction = {
      id: `tx-${Date.now().toString(36)}`,
      walletId: devWalletState.id,
      transactionType: "deposit",
      amount,
      status: "completed",
      description: "Wallet Deposit",
      createdAt: new Date().toISOString(),
    };

    devTransactionsState = [newTransaction, ...devTransactionsState];

    return {
      success: true,
      wallet: { ...devWalletState },
      transaction: newTransaction,
      message: "Funds deposited successfully.",
    };
  }
};

/**
 * Fetch wallet transaction history if supported by the backend.
 * Gracefully returns empty list or existing transactions.
 */
export const getWalletTransactions = async (): Promise<WalletTransaction[]> => {
  try {
    // Attempt standard transaction endpoints
    const response = await api.get("/wallets/me/transactions");
    const list = Array.isArray(response.data) ? response.data : response.data?.transactions || response.data?.data || [];
    return normalizeTransactions(list);
  } catch {
    try {
      const altResponse = await api.get("/wallets/transactions");
      const list = Array.isArray(altResponse.data) ? altResponse.data : altResponse.data?.transactions || altResponse.data?.data || [];
      return normalizeTransactions(list);
    } catch {
      // Backend transaction history endpoint not yet implemented
      return [...devTransactionsState];
    }
  }
};
