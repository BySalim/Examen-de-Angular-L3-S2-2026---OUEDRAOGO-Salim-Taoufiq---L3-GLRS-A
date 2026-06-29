export interface Wallet {
  id: number;
  phoneNumber: string;
  email: string;
  balance: number;
  code: string;
  currency: string;
  createdAt: string;
}

export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
  numberOfElements: number;
}

export interface CreateWalletRequest {
  phoneNumber: string;
  email: string;
  initialBalance: number;
  code: string;
  currency: string;
}

export interface BalanceResponse {
  phoneNumber: string;
  balance: number;
  currency: string;
}
