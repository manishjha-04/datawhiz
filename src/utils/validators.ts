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

export const validateInvoiceData = (invoice: any): string[] => {
  const errors: string[] = [];
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
      errors.push(`Missing required field: ${field}`);
    }
  });

  if (invoice.quantity && invoice.quantity <= 0) {
    errors.push('Quantity must be greater than 0');
  }

  if (invoice.tax && (invoice.tax < 0 || invoice.tax > 100)) {
    errors.push('Tax must be between 0 and 100');
  }

  if (invoice.totalAmount && invoice.totalAmount <= 0) {
    errors.push('Total amount must be greater than 0');
  }

  return errors;
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