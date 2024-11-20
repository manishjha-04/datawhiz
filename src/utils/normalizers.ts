export const normalizeNumericValues = (data: any): any => {
  const normalized = { ...data };
  
  // List of fields that should be normalized as numbers
  const numericFields = [
    'quantity',
    'tax',
    'totalAmount',
    'makingCharges',
    'debitCardCharges',
    'shippingCharges',
    'taxableAmount',
    'cgst',
    'sgst'
  ];

  numericFields.forEach(field => {
    if (normalized[field] !== undefined) {
      // Convert string numbers to actual numbers and round to 2 decimal places
      normalized[field] = Number(Number(normalized[field]).toFixed(2));
    }
  });

  return normalized;
}; 