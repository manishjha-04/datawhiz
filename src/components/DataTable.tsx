import React, { useState } from 'react';
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
  IconButton,
  TextField
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import { motion } from 'framer-motion';
import { ValidationFeedback } from '../components/ValidationFeedback';
import { ValidationState } from '../types';

interface Column {
  id: string;
  label: string;
  format?: (value: any) => string;
  editable?: boolean;
}

interface DataTableProps {
  columns: Column[];
  data: any[];
  loading?: boolean;
  error?: string | null;
  validationStates?: ValidationState[];
  onFieldFocus?: (field: string) => void;
  onUpdate?: (id: string, updates: any) => void;
  readOnly?: boolean;
}

export const DataTable: React.FC<DataTableProps> = ({
  columns,
  data,
  loading = false,
  error = null,
  validationStates = [],
  onFieldFocus,
  onUpdate,
  readOnly = false
}) => {
  const [editingRow, setEditingRow] = useState<string | null>(null);
  const [editedValues, setEditedValues] = useState<Record<string, any>>({});

  const handleEditClick = (rowId: string, rowData: any) => {
    setEditingRow(rowId);
    setEditedValues(rowData);
  };

  const handleSave = (rowId: string) => {
    if (onUpdate) {
      onUpdate(rowId, editedValues);
    }
    setEditingRow(null);
    setEditedValues({});
  };

  const handleCancel = () => {
    setEditingRow(null);
    setEditedValues({});
  };

  const handleFieldChange = (field: string, value: any) => {
    setEditedValues(prev => ({
      ...prev,
      [field]: value
    }));
  };

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
            <TableRow>
              {columns.map((column) => (
                <TableCell key={column.id}>{column.label}</TableCell>
              ))}
              {!readOnly && (
                <TableCell>Actions</TableCell>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((row) => (
              <TableRow key={row.id}>
                {columns.map((column) => (
                  <TableCell key={column.id}>
                    {editingRow === row.id && column.editable ? (
                      <TextField
                        value={editedValues[column.id] || row[column.id]}
                        onChange={(e) => handleFieldChange(column.id, e.target.value)}
                        variant="standard"
                        fullWidth
                      />
                    ) : (
                      column.format ? column.format(row[column.id]) : row[column.id]
                    )}
                  </TableCell>
                ))}
                {!readOnly && (
                  <TableCell>
                    {editingRow === row.id ? (
                      <>
                        <IconButton onClick={() => handleSave(row.id)} color="primary">
                          <SaveIcon />
                        </IconButton>
                        <IconButton onClick={handleCancel} color="error">
                          <CancelIcon />
                        </IconButton>
                      </>
                    ) : (
                      <IconButton onClick={() => handleEditClick(row.id, row)} color="primary">
                        <EditIcon />
                      </IconButton>
                    )}
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
}; 