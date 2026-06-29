export type TransactionType = 'DEPOSIT' | 'WITHDRAW' | 'TRANSFER' | 'PAYMENT';
export type TransactionDirection = 'CREDIT' | 'DEBIT';
export type PaymentMethod = 'CREDIT_CARD' | 'WALLET_TARGET';

export interface Transaction {
  id: number;
  type: TransactionType;
  direction: TransactionDirection;
  amount: number;
  fee: number;
  balanceAfter: number;
  currency: string;
  counterpartyPhone: string | null;
  reference: string | null;
  description: string | null;
  createdAt: string;
}

export interface DepositRequest {
  amount: number;
  paymentMethod: PaymentMethod;
}

export interface WithdrawRequest {
  phoneNumber: string;
  amount: number;
}

export interface WithdrawResponse {
  phoneNumber: string;
  amount: number;
  fee: number;
  totalDebited: number;
  balanceAfter: number;
  currency: string;
}

export interface TransferRequest {
  senderPhone: string;
  receiverPhone: string;
  amount: number;
}

export interface TransferResponse {
  senderPhone: string;
  receiverPhone: string;
  amount: number;
  senderBalanceAfter: number;
  receiverBalanceAfter: number;
  currency: string;
}

export interface PayRequest {
  phoneNumber: string;
  serviceName: string;
  amount: number;
}

export interface PayFacturesRequest {
  phoneNumber: string;
  serviceName: string;
  factureReferences: string[];
}

export interface PaymentResponse {
  phoneNumber: string;
  serviceName: string;
  paidFactures: string[];
  totalPaid: number;
  balanceAfter: number;
  currency: string;
}
