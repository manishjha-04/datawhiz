import React from 'react';
import { Alert, Box, Typography, Chip } from '@mui/material';
import { ValidationState } from '../types';

interface ValidationFeedbackProps {
  validationStates: ValidationState[];
  onFieldFocus?: (field: string) => void;
}

export const ValidationFeedback: React.FC<ValidationFeedbackProps> = ({
  validationStates,
  onFieldFocus
}) => {
  if (!validationStates.length) return null;

  return (
    <Box sx={{ mt: 2 }}>
      <Alert severity="warning">
        <Typography variant="subtitle2" gutterBottom>
          Please complete the following required fields:
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
          {validationStates.map((state, index) => (
            <Chip
              key={index}
              label={state.message}
              color={state.severity === 'error' ? 'error' : 'warning'}
              onClick={() => onFieldFocus?.(state.field)}
              sx={{ cursor: 'pointer' }}
            />
          ))}
        </Box>
      </Alert>
    </Box>
  );
}; 