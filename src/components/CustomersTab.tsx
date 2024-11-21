import React from 'react';
import { useAppSelector, useAppDispatch } from '../hooks/redux';
import { DataTable } from './DataTable';
import type { RootState } from '../store';
import { Box } from '@mui/material';
import { updateCustomerWithDependencies } from '../store/customersSlice';
import type { Customer } from '../types';

export const CustomersTab: React.FC = () => {
  const dispatch = useAppDispatch();
  const { items, loading, error } = useAppSelector((state: RootState) => state.customers);

  const columns = [
    { id: 'name', label: 'Customer Name', editable: true },
    { id: 'phoneNumber', label: 'Phone Number', editable: true },
    { 
      id: 'totalPurchaseAmount', 
      label: 'Total Purchase Amount',
      format: (value: number) => `$${value.toFixed(2)}`,
      editable: true
    },
    { id: 'email', label: 'Email', editable: true },
    { id: 'address', label: 'Address', editable: true },
  ];

  const handleUpdate = (id: string, updates: Record<string, any>) => {
    const currentCustomer = items.find((item: Customer) => item.id === id);
    if (!currentCustomer) return;

    const updatedCustomer = {
      ...currentCustomer,
      ...updates,
    };

    if (updates.totalPurchaseAmount !== undefined) {
      if (typeof updates.totalPurchaseAmount === 'number') {
        updatedCustomer.totalPurchaseAmount = updates.totalPurchaseAmount;
      } else {
        updatedCustomer.totalPurchaseAmount = Number(
          updates.totalPurchaseAmount.toString().replace(/[^0-9.-]+/g, '')
        );
      }
    }

    dispatch(updateCustomerWithDependencies(updatedCustomer));
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