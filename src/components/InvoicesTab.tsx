import React from 'react';
import { useSelector } from 'react-redux';
import { DataTable } from './DataTable';
import { RootState } from '../store';
import { Box } from '@mui/material';

export const InvoicesTab: React.FC = () => {
  const { items, loading, error } = useSelector((state: RootState) => state.invoices);

  const columns = [
    { id: 'serialNumber', label: 'Serial Number' },
    { id: 'customerName', label: 'Customer Name' },
    { id: 'productName', label: 'Product Name' },
    { id: 'quantity', label: 'Quantity' },
    { 
      id: 'tax', 
      label: 'Tax',
      format: (value: number) => `${value}%`
    },
    { 
      id: 'totalAmount', 
      label: 'Total Amount',
      format: (value: number) => `$${value.toFixed(2)}`
    },
    { 
      id: 'date', 
      label: 'Date',
      format: (value: string) => new Date(value).toLocaleDateString()
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