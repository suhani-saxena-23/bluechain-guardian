export type UserRole = 'generator' | 'validator' | 'consumer';

export type TabType = 'home' | 'generator' | 'validator' | 'consumer' | 'wallet' | 'signin' | 'login';

export interface UserAuth {
  role: UserRole;
  name: string;
  email?: string;
  isLoggedIn: boolean;
}

export interface Project {
  id: string;
  name: string;
  hectares: number;
  location: {
    lat: number;
    lng: number;
    address?: string;
  } | null;
  photos: File[];
  video: File | null;
  date: string;
  status: 'submitted' | 'under-review' | 'verified' | 'rejected';
  co2Tons?: number;
}

export interface Asset {
  id: string;
  name: string;
  symbol: string;
  balance: number;
  inrValue: number;
  icon: string;
}

export interface Transaction {
  id: string;
  type: 'received' | 'sent' | 'swap' | 'buy';
  token: string;
  amount: number;
  inrValue: number;
  date: string;
  fromAddress?: string;
  toAddress?: string;
  status: 'completed' | 'pending' | 'failed';
}

export interface Purchase {
  id: string;
  credits: number;
  pricePerCredit: number;
  inrAmount: number;
  date: string;
  walletHash: string;
  status: 'completed' | 'pending';
}

export interface WalletState {
  address: string | null;
  balance: number;
  assets: Asset[];
  transactions: Transaction[];
  isConnected: boolean;
  showBalance: boolean;
}

export interface SensorData {
  temperature: number;
  salinity: number;
  ph: number;
  dissolvedO2: number;
  turbidity: number;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  description?: string;
}
