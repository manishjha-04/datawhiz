import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { DataTable } from './DataTable';
import { RootState } from '../store';
import { Box, Alert, Snackbar } from '@mui/material';

export const InvoicesTab: React.FC = () => {
  const { items, loading, error } = useSelector((state: RootState) => state.invoices);
  const metadata = useSelector((state: RootState) => state.invoices.metadata);
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
      />
      <Snackbar
        open={openWarnings}
        autoHideDuration={6000}
        onClose={() => setOpenWarnings(false)}
      >
        <Alert 
          onClose={() => setOpenWarnings(false)} 
          severity="warning" 
          sx={{ width: '100%' }}
        >
          {metadata?.unexpectedFields && 
            Object.entries(metadata.unexpectedFields).map(([field, warnings]) =>
              warnings.map((warning, index) => (
                <div key={`${field}-${index}`}>{warning}</div>
              ))
            )}
          
        </Alert>
      </Snackbar>
    </Box>
  );
}; 