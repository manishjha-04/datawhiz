import React from 'react';
import { useAppSelector, useAppDispatch } from '../hooks/redux';
import { DataTable } from './DataTable';
import type { RootState } from '../store';
import { Box } from '@mui/material';
import { updateProductWithDependencies } from '../store/productsSlice';
import type { Product } from '../types';

export const ProductsTab: React.FC = () => {
  const dispatch = useAppDispatch();
  const { items, loading, error } = useAppSelector((state: RootState) => state.products);

  const columns = [
    { id: 'name', label: 'Name', editable: true },
    { 
      id: 'quantity', 
      label: 'Quantity',
      format: (value: number) => value.toString(),
      editable: true
    },
    { 
      id: 'unitPrice', 
      label: 'Unit Price',
      format: (value: number) => `$${value.toFixed(2)}`,
      editable: true
    },
    { 
      id: 'tax', 
      label: 'Tax',
      format: (value: number) => `${value}%`,
      editable: true
    },
    { 
      id: 'priceWithTax', 
      label: 'Price with Tax',
      format: (value: number) => `$${value.toFixed(2)}`
    },
    { 
      id: 'discount', 
      label: 'Discount',
      format: (value: number) => value ? `${value}%` : 'N/A',
      editable: true
    },
  ];

  const handleUpdate = (id: string, updates: Record<string, any>) => {
    const currentProduct = items.find((item: Product) => item.id === id);
    if (!currentProduct) return;

    const parseNumericValue = (value: any, removeSymbol?: string) => {
      if (typeof value === 'number') return value;
      if (typeof value === 'string') {
        const cleanValue = removeSymbol 
          ? value.replace(removeSymbol, '')
          : value.replace(/[^0-9.-]+/g, '');
        return Number(cleanValue);
      }
      return 0;
    };

    const updatedProduct = {
      ...currentProduct,
      ...updates,
    };

    if (updates.unitPrice !== undefined) {
      updatedProduct.unitPrice = parseNumericValue(updates.unitPrice, '$');
    }
    if (updates.tax !== undefined) {
      updatedProduct.tax = parseNumericValue(updates.tax, '%');
    }
    if (updates.discount !== undefined) {
      updatedProduct.discount = parseNumericValue(updates.discount, '%');
    }

    dispatch(updateProductWithDependencies(updatedProduct));
  };

  return (
    <Box sx={{ p: 2 }}>
      <DataTable
        columns={columns}
        data={items}
        loading={loading}
        error={error}
        onUpdate={handleUpdate}
      />
    </Box>
  );
}; 