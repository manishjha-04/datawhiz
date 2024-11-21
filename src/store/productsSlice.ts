import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Product, Invoice, Customer } from '../types';
import { setInvoices } from './invoicesSlice';
import { setCustomers } from './customersSlice';

interface ProductsState {
  items: Product[];
  loading: boolean;
  error: string | null;
  metadata?: {
    unexpectedFields?: Record<string, string[]>;
  };
}

const initialState: ProductsState = {
  items: [],
  loading: false,
  error: null,
  metadata: {
    unexpectedFields: {}
  }
};

const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    setProducts: (state, action: PayloadAction<Product[]>) => {
      state.items = action.payload;
    },
    addProduct: (state, action: PayloadAction<Product>) => {
      state.items.push(action.payload);
    },
    updateProduct: (state, action: PayloadAction<Product>) => {
      const index = state.items.findIndex(item => item.id === action.payload.id);
      if (index !== -1) {
        state.items[index] = action.payload;
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setMetadata: (state, action: PayloadAction<typeof initialState.metadata>) => {
      state.metadata = action.payload;
    },
    addUnexpectedFields: (state, action: PayloadAction<{ productId: string, fields: string[] }>) => {
      const { productId, fields } = action.payload;
      if (state.metadata?.unexpectedFields) {
        state.metadata.unexpectedFields[productId] = fields;
      }
    }
  },
});

export const { 
  setProducts, 
  addProduct, 
  updateProduct, 
  setLoading, 
  setError, 
  setMetadata,
  addUnexpectedFields 
} = productsSlice.actions;

export const updateProductWithDependencies = (product: Product) => (dispatch: any, getState: any) => {
  // Get current state before update
  const state = getState();
  const oldProduct = state.products.items.find((p: Product) => p.id === product.id);
  
  // Update the product
  dispatch(updateProduct(product));

  // Get current invoices
  const invoices = state.invoices.items;

  // Update related invoices
  const updatedInvoices = invoices.map((invoice: Invoice) => {
    // Check if this invoice contains the updated product
    if (invoice.productName.includes(oldProduct.name)) {
      // Replace old product name with new product name in the invoice
      const newProductName = invoice.productName.replace(oldProduct.name, product.name);
      
      // Recalculate quantities and amounts
      const invoiceProducts = newProductName.split(', ');
      let totalQuantity = 0;
      let totalAmount = 0;
      let totalTax = 0;
      let taxableAmount = 0;

      // Get all products for this invoice
      const allProducts = state.products.items;
      invoiceProducts.forEach((prodName: string) => {
        const prod = allProducts.find((p: Product) => p.name === prodName);
        if (prod) {
          totalQuantity += prod.quantity;
          taxableAmount += prod.quantity * prod.unitPrice;
          totalTax += prod.tax;
          totalAmount += prod.priceWithTax;
        }
      });

      return {
        ...invoice,
        productName: newProductName,
        quantity: totalQuantity,
        tax: totalTax,
        totalAmount: totalAmount,
        taxableAmount: taxableAmount
      };
    }
    return invoice;
  });

  // Update customer total purchase amounts
  const customerPurchases = new Map<string, number>();
  updatedInvoices.forEach((invoice: Invoice) => {
    const currentTotal = customerPurchases.get(invoice.customerName) || 0;
    customerPurchases.set(invoice.customerName, currentTotal + invoice.totalAmount);
  });

  const customers = state.customers.items;
  const updatedCustomers = customers.map((customer: Customer) => {
    const newTotal = customerPurchases.get(customer.name);
    if (newTotal !== undefined) {
      return {
        ...customer,
        totalPurchaseAmount: Number(newTotal.toFixed(2))
      };
    }
    return customer;
  });

  // Dispatch updates
  dispatch(setInvoices(updatedInvoices));
  dispatch(setCustomers(updatedCustomers));
};
 
const calculateNewTotal = (quantity: number, product: Product): number => {
  const basePrice = quantity * product.unitPrice;
  const taxAmount = basePrice * (product.tax / 100);
  const totalBeforeDiscount = basePrice + taxAmount;
  
  if (product.discount) {
    const discountAmount = totalBeforeDiscount * (product.discount / 100);
    return Number((totalBeforeDiscount - discountAmount).toFixed(2));
  }
  return Number(totalBeforeDiscount.toFixed(2));
};

export default productsSlice.reducer; 