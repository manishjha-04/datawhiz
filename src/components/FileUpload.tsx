import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Button, CircularProgress, Alert, Box } from '@mui/material';
import { extractDataFromFile } from '../services/aiService';
import { setInvoices, setLoading as setInvoicesLoading } from '../store/invoicesSlice';
import { setProducts, setLoading as setProductsLoading } from '../store/productsSlice';
import { setCustomers, setLoading as setCustomersLoading } from '../store/customersSlice';
import { validateFileType } from '../utils/validators';
import { GlobalWorkerOptions } from 'pdfjs-dist';
import { motion } from 'framer-motion';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';


export const FileUpload: React.FC = () => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files?.length) return;

    try {
      setLoading(true);
      setError(null);
      
      dispatch(setInvoicesLoading(true));
      dispatch(setProductsLoading(true));
      dispatch(setCustomersLoading(true));

      const file = files[0];
      if (!validateFileType(file)) {
        throw new Error('Unsupported file type');
      }

      const extractedData = await extractDataFromFile(file);
      
      dispatch(setInvoices(extractedData.invoices));
      dispatch(setProducts(extractedData.products));
      dispatch(setCustomers(extractedData.customers));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error processing file');
    } finally {
      setLoading(false);
      dispatch(setInvoicesLoading(false));
      dispatch(setProductsLoading(false));
      dispatch(setCustomersLoading(false));
    }
  };

  return (
    <Box 
      sx={{ 
        m: 2, 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center',
        p: 4
      }}
    >
      <input
        accept=".pdf,.xlsx,.xls,.png,.jpg,.jpeg"
        style={{ display: 'none' }}
        id="file-upload"
        type="file"
        onChange={handleFileUpload}
      />
      <label htmlFor="file-upload">
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button
            variant="contained"
            component="span"
            disabled={loading}
            startIcon={<CloudUploadIcon />}
            sx={{
              py: 2,
              px: 4,
              borderRadius: 2,
              background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
              boxShadow: '0 3px 5px 2px rgba(33, 203, 243, .3)',
              color: 'white',
              '&:hover': {
                background: 'linear-gradient(45deg, #1976D2 30%, #2196F3 90%)',
              }
            }}
          >
            {loading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              'Upload Document'
            )}
          </Button>
        </motion.div>
      </label>
      
      {error && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
        >
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        </motion.div>
      )}
    </Box>
  );
}; 