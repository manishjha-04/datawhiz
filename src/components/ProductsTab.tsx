import React from 'react';
import { useSelector } from 'react-redux';
import { DataTable } from './DataTable';
import { RootState } from '../store';
import { Box } from '@mui/material';

export const ProductsTab: React.FC = () => {
  const { items, loading, error } = useSelector((state: RootState) => state.products);

  const columns = [
    { id: 'name', label: 'Name' },
    { 
      id: 'quantity', 
      label: 'Quantity',
      format: (value: number) => value.toString()
    },
    { 
      id: 'unitPrice', 
      label: 'Unit Price',
      format: (value: number) => `$${value.toFixed(2)}`
    },
    { 
      id: 'tax', 
      label: 'Tax',
      format: (value: number) => `${value}%`
    },
    { 
      id: 'priceWithTax', 
      label: 'Price with Tax',
      format: (value: number) => `$${value.toFixed(2)}`
    },
    { 
      id: 'discount', 
      label: 'Discount',
      format: (value: number) => value ? `${value}%` : 'N/A'
    },
  ];

  return (
    <Box sx={{ p: 2 }}>
      <DataTable
        columns={columns}
        data={items}
        loading={loading}
        error={error}
      />
    </Box>
  );
}; 