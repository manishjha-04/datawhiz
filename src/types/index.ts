export interface Invoice {
  id: string;
  serialNumber: string;
  customerName: string;
  productName: string;
  quantity: number;
  tax: number;
  totalAmount: number;
  date: string;
  makingCharges?: number;
  debitCardCharges?: number;
  shippingCharges?: number;
  taxableAmount?: number;
  cgst?: number;
  sgst?: number;
  gstIn?: string;
  [key: string]: any;
}

export interface Product {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
  tax: number;
  priceWithTax: number;
  discount?: number;
}

export interface Customer {
  id: string;
  name: string;
  phoneNumber: string;
  totalPurchaseAmount: number;
  email?: string;
  address?: string;
}

export interface ExtractedData {
  invoices: Invoice[];
  products: Product[];
  customers: Customer[];
  metadata?: {
    unexpectedFields?: {
      invoices?: Record<string, string[]>;
      products?: Record<string, string[]>;
      customers?: Record<string, string[]>;
    };
  };
} 