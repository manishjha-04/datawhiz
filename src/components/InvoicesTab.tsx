import React, { useEffect } from 'react';
import { useAppSelector } from '../hooks/redux';
import { DataTable } from './DataTable';
import type { RootState } from '../store';
import { Box, Alert, Snackbar } from '@mui/material';

export const InvoicesTab: React.FC = () => {
  const { items, loading, error } = useAppSelector((state: RootState) => state.invoices);
  const metadata = useAppSelector((state: RootState) => state.invoices.metadata);
  const [openWarnings, setOpenWarnings] = React.useState(false);

  useEffect(() => {
    if (metadata?.unexpectedFields && Object.values(metadata.unexpectedFields).flat().length > 0) {
      setOpenWarnings(true);
    }
  }, [metadata]);

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
        readOnly={true}
      />
      <Snackbar
        open={openWarnings}
        autoHideDuration={6000}
        onClose={() => setOpenWarnings(false)}
      >
        <Alert severity="warning" onClose={() => setOpenWarnings(false)}>
          {metadata?.unexpectedFields &&
            Object.entries(metadata.unexpectedFields).map(([field, warnings]) =>
              (warnings as string[]).map((warning: string, index: number) => (
                <div key={`${field}-${index}`}>{warning}</div>
              ))
            )}
        </Alert>
      </Snackbar>
    </Box>
  );
}; 