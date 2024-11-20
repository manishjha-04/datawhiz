import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Alert,
  Box,
} from '@mui/material';
import { motion } from 'framer-motion';
import { ValidationFeedback } from '../components/ValidationFeedback';
import { ValidationState } from '../types';

interface Column {
  id: string;
  label: string;
  format?: (value: any) => string;
}

interface DataTableProps {
  columns: Column[];
  data: any[];
  loading?: boolean;
  error?: string | null;
  validationStates?: ValidationState[];
  onFieldFocus?: (field: string) => void;
}

export const DataTable: React.FC<DataTableProps> = ({
  columns,
  data,
  loading = false,
  error = null,
  validationStates = [],
  onFieldFocus
}) => {
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <Alert severity="error">{error}</Alert>
      </motion.div>
    );
  }

  return (
    <>
      {validationStates.length > 0 && (
        <ValidationFeedback 
          validationStates={validationStates}
          onFieldFocus={onFieldFocus}
        />
      )}
      <TableContainer 
        component={Paper}
        sx={{ 
          borderRadius: 2,
          overflow: 'hidden',
          '& .MuiTableRow-root:hover': {
            backgroundColor: 'rgba(0, 0, 0, 0.04)',
            transition: 'background-color 0.2s ease-in-out'
          }
        }}
      >
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: 'primary.light' }}>
              {columns.map((column) => (
                <TableCell 
                  key={column.id}
                  sx={{ 
                    color: 'white',
                    fontWeight: 600
                  }}
                >
                  {column.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((row, index) => (
              <motion.tr
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                {columns.map((column) => (
                  <TableCell key={column.id}>
                    {column.format ? column.format(row[column.id]) : row[column.id]}
                  </TableCell>
                ))}
              </motion.tr>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
}; 