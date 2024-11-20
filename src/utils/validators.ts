export const validateFileType = (file: File): boolean => {
  const allowedTypes = [
    'application/pdf',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'image/jpeg',
    'image/png'
  ];
  return allowedTypes.includes(file.type);
};

const KNOWN_INVOICE_FIELDS = new Set([
  'id',
  'serialNumber',
  'customerName',
  'productName',
  'quantity',
  'tax',
  'totalAmount',
  'date',
  'makingCharges',
  'debitCardCharges',
  'shippingCharges',
  'taxableAmount',
  'cgst',
  'sgst',
  'gstIn'
]);

interface ValidationResult {
  errors: string[];
  warnings: string[];
  unexpectedFields: string[];
}

export const validateInvoiceData = (invoice: any): ValidationResult => {
  const result: ValidationResult = {
    errors: [],
    warnings: [],
    unexpectedFields: []
  };

  // Validate required fields
  const requiredFields = [
    'serialNumber',
    'customerName',
    'productName',
    'quantity',
    'tax',
    'totalAmount',
    'date'
  ];

  requiredFields.forEach(field => {
    if (!invoice[field]) {
      result.errors.push(`Missing required field: ${field}`);
    }
  });

  // Track unexpected fields
  Object.keys(invoice).forEach(field => {
    if (!KNOWN_INVOICE_FIELDS.has(field)) {
      result.unexpectedFields.push(field);
      result.warnings.push(`Unexpected field found: ${field} with value: ${invoice[field]}`);
    }
  });

  // Validate numeric fields (both known and unknown)
  Object.entries(invoice).forEach(([field, value]) => {
    if (typeof value === 'number' && value < 0) {
      result.errors.push(`Invalid ${field}: negative values are not allowed`);
    }
  });

  // Validate tax breakdown if present
  if (invoice.cgst || invoice.sgst) {
    const taxErrors = validateTaxBreakdown(invoice);
    result.errors.push(...taxErrors);
  }

  return result;
};

// Helper function to detect and convert numeric strings
export const normalizeNumericValues = (obj: any): any => {
  const normalized = { ...obj };
  
  Object.entries(normalized).forEach(([key, value]) => {
    if (typeof value === 'string' && !isNaN(Number(value))) {
      normalized[key] = Number(value);
    }
  });
  
  return normalized;
};

export const validateProductData = (product: any): string[] => {
  const errors: string[] = [];
  const requiredFields = ['name', 'quantity', 'unitPrice', 'tax', 'priceWithTax'];

  requiredFields.forEach(field => {
    if (!product[field]) {
      errors.push(`Missing required field: ${field}`);
    }
  });

  if (product.quantity && product.quantity <= 0) {
    errors.push('Quantity must be greater than 0');
  }

  if (product.unitPrice && product.unitPrice <= 0) {
    errors.push('Unit price must be greater than 0');
  }

  if (product.tax && (product.tax < 0 || product.tax > 100)) {
    errors.push('Tax must be between 0 and 100');
  }

  return errors;
};

export const validateCustomerData = (customer: any): string[] => {
  const errors: string[] = [];
  const requiredFields = ['name', 'phoneNumber', 'totalPurchaseAmount'];

  requiredFields.forEach(field => {
    if (!customer[field]) {
      errors.push(`Missing required field: ${field}`);
    }
  });

  if (customer.phoneNumber && !/^\+?[\d\s-]{10,}$/.test(customer.phoneNumber)) {
    errors.push('Invalid phone number format');
  }

  if (customer.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.email)) {
    errors.push('Invalid email format');
  }

  if (customer.totalPurchaseAmount && customer.totalPurchaseAmount < 0) {
    errors.push('Total purchase amount cannot be negative');
  }

  return errors;
};

export const validateTaxBreakdown = (invoice: any): string[] => {
  const errors: string[] = [];
  
  if (invoice.cgst && invoice.sgst) {
    const totalTax = Number((invoice.cgst + invoice.sgst).toFixed(2));
    if (invoice.tax !== totalTax) {
      errors.push(`Tax amount (${invoice.tax}) doesn't match CGST (${invoice.cgst}) + SGST (${invoice.sgst}) = ${totalTax}`);
    }
  }

  if (invoice.taxableAmount && invoice.totalAmount) {
    const calculatedTotal = Number((invoice.taxableAmount + invoice.tax).toFixed(2));
    if (invoice.totalAmount !== calculatedTotal) {
      errors.push(`Total amount (${invoice.totalAmount}) doesn't match taxable amount (${invoice.taxableAmount}) + tax (${invoice.tax}) = ${calculatedTotal}`);
    }
  }

  return errors;
};

export const validateProductQuantities = (invoice: any, products: any[]): string[] => {
  const errors: string[] = [];
  
  const totalQuantity = products.reduce((sum, product) => sum + product.quantity, 0);
  if (invoice.quantity !== totalQuantity) {
    errors.push(`Invoice quantity (${invoice.quantity}) doesn't match sum of product quantities (${totalQuantity})`);
  }

  return errors;
}; 