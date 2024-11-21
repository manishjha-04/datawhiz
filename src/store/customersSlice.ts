import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Customer, Invoice } from '../types';
import { setInvoices } from './invoicesSlice';

interface CustomersState {
  items: Customer[];
  loading: boolean;
  error: string | null;
}

const initialState: CustomersState = {
  items: [],
  loading: false,
  error: null,
};

const customersSlice = createSlice({
  name: 'customers',
  initialState,
  reducers: {
    setCustomers: (state, action: PayloadAction<Customer[]>) => {
      state.items = action.payload;
    },
    addCustomer: (state, action: PayloadAction<Customer>) => {
      state.items.push(action.payload);
    },
    updateCustomer: (state, action: PayloadAction<Customer>) => {
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
  },
});

export const updateCustomerWithDependencies = (customer: Customer) => (dispatch: any, getState: any) => {
  // Get the old customer data before updating
  const state = getState();
  const oldCustomer = state.customers.items.find((c: Customer) => c.id === customer.id);
  
  // Update the customer
  dispatch(updateCustomer(customer));

  // Get current invoices
  const invoices = state.invoices.items;

  // Calculate total purchase amount from invoices
  const customerInvoices = invoices.filter(
    (invoice: Invoice) => invoice.customerName === oldCustomer?.name
  );
  
  const totalPurchaseAmount = customerInvoices.reduce(
    (sum: number, invoice: Invoice) => sum + invoice.totalAmount,
    0
  );

  // Update customer with new total
  const updatedCustomer = {
    ...customer,
    totalPurchaseAmount: Number(totalPurchaseAmount.toFixed(2))
  };
  dispatch(updateCustomer(updatedCustomer));

  // Update related invoices
  const updatedInvoices = invoices.map((invoice: Invoice) => {
    if (invoice.customerName === oldCustomer?.name) {
      return {
        ...invoice,
        customerName: customer.name
      };
    }
    return invoice;
  });

  dispatch(setInvoices(updatedInvoices));
};

export const { setCustomers, addCustomer, updateCustomer, setLoading, setError } = customersSlice.actions;
export default customersSlice.reducer; 