import React from 'react';
import { useAppSelector, useAppDispatch } from '../hooks/redux';
import { DataTable } from './DataTable';
import type { RootState } from '../store';
import { Box, Typography } from '@mui/material';
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
      format: (value: number) => value !== null ? `$${value.toFixed(2)}` : 'N/A',
      // editable: true
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
      {loading ? (
        <Typography>Loading...</Typography>
      ) : error ? (
        <Typography color="error">{error}</Typography>
      ) : items.length === 0 ? (
        <Typography>No data available Or missing Required Fields</Typography>
      ) : (
        <DataTable
          columns={columns}
          data={items.map((customer: Customer) => ({
            ...customer,
            phoneNumber: customer.phoneNumber || 'N/A', // Display 'N/A' if phoneNumber is null
            totalPurchaseAmount: customer.totalPurchaseAmount !== null ? customer.totalPurchaseAmount : 'N/A' // Display 'N/A' if totalPurchaseAmount is null
          }))}
          loading={loading}
          error={error}
          onUpdate={handleUpdate}
        />
      )}
    </Box>
  );
}; 