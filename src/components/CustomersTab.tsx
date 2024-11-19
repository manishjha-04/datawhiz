import React from 'react';
import { useSelector } from 'react-redux';
import { DataTable } from './DataTable';
import { RootState } from '../store';
import { Box } from '@mui/material';

export const CustomersTab: React.FC = () => {
  const { items, loading, error } = useSelector((state: RootState) => state.customers);

  const columns = [
    { id: 'name', label: 'Customer Name' },
    { id: 'phoneNumber', label: 'Phone Number' },
    { 
      id: 'totalPurchaseAmount', 
      label: 'Total Purchase Amount',
      format: (value: number) => `$${value.toFixed(2)}`
    },
    { id: 'email', label: 'Email' },
    { id: 'address', label: 'Address' },
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