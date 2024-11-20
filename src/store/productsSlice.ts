import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Product } from '../types';

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

export default productsSlice.reducer; 