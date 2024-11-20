import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Invoice } from '../types';

interface InvoicesState {
  items: Invoice[];
  loading: boolean;
  error: string | null;
  metadata?: {
    unexpectedFields?: Record<string, string[]>;
  };
}

const initialState: InvoicesState = {
  items: [],
  loading: false,
  error: null,
  metadata: {
    unexpectedFields: {}
  }
};

const invoicesSlice = createSlice({
  name: 'invoices',
  initialState,
  reducers: {
    setInvoices: (state, action: PayloadAction<Invoice[]>) => {
      state.items = action.payload;
    },
    addInvoice: (state, action: PayloadAction<Invoice>) => {
      state.items.push(action.payload);
    },
    updateInvoice: (state, action: PayloadAction<Invoice>) => {
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
    }
  },
});

export const { setInvoices, addInvoice, updateInvoice, setLoading, setError, setMetadata } = invoicesSlice.actions;
export default invoicesSlice.reducer; 