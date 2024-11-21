import { GoogleGenerativeAI ,GoogleGenerativeAIFetchError} from '@google/generative-ai';
import { ExtractedData, Invoice, Product, Customer } from '../types';
import { validateInvoiceData, validateProductData, validateCustomerData, validateProductQuantities, normalizeNumericValues, normalizeProductTax } from '../utils/validators';
import { createWorker } from 'tesseract.js';
import * as XLSX from 'xlsx';
import * as pdfjsLib from 'pdfjs-dist';

// Initialize Gemini API with your key
const genAI = new GoogleGenerativeAI(process.env.REACT_APP_GEMINI_API_KEY || '');

const SYSTEM_PROMPT = `Extract invoice, product, and customer information from the provided document. 
Format the response as a JSON object with three arrays: invoices, products, and customers. 
Each array should contain objects with the following required fields:

Invoices: serialNumber, customerName, productName, quantity, tax, totalAmount, date
Products: name, quantity, unitPrice, tax, priceWithTax, discount (if applicable)
Customers: name, phoneNumber, totalPurchaseAmount

Note: For products, extract any applicable discount percentage. If no discount is mentioned, omit the field.
Additional fields are optional. Ensure all numeric values are properly formatted.`;

export async function extractDataFromFile(file: File): Promise<ExtractedData> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    let fileContent: string;
    
    if (file.type.includes('excel') || file.type.includes('spreadsheet')) {
      fileContent = await processExcel(file);
    } else if (file.type.includes('pdf')) {
      fileContent = await processPDF(file);
    } else if (file.type.includes('image')) {
      fileContent = await processImage(file);
    } else {
      throw new Error('Unsupported file type');
    }
    
    const result = await model.generateContent([
      { text: SYSTEM_PROMPT },
      { text: fileContent }
    ]);
    
    const response = await result.response;
    const text = response.text();
    
    // Log the raw extracted text
    console.log('Extracted Text:', text);
    
    // Add a check to ensure we have a valid response
    if (!text) {
      throw new Error('No response received from the AI model');
    }
    
    return validateAndProcessResponse(text);
  } catch (error) {
    if (error instanceof GoogleGenerativeAIFetchError && error.message.includes('503')) {
      console.error('Service overload error:', error);
      throw new Error('The model is currently overloaded Check logs. Please try again later.');
    }
    console.error('Detailed error processing file:', error);
    throw new Error('Failed to process file. Please check the file and try again.');
  }
}

async function processExcel(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer);
  const worksheet = workbook.Sheets[workbook.SheetNames[0]];
  const data = XLSX.utils.sheet_to_json(worksheet);
  return JSON.stringify(data);
}

async function processImage(file: File): Promise<string> {
  const worker = await createWorker();
  const { data: { text } } = await worker.recognize(file);
  await worker.terminate();
  return text;
}

async function processPDF(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const page = await pdf.getPage(1);
  const textContent = await page.getTextContent();
  return textContent.items.map(item => 'str' in item ? item.str : '').join(' ');
}

const validateAndProcessResponse = (text: string): ExtractedData => {
  try {
    const cleanedText = text.replace(/```json\n?|\n?```/g, '').trim();
    const parsed = JSON.parse(cleanedText);
    console.log('Parsed Data:', parsed);

    const validatedData: ExtractedData = {
      invoices: [],
      products: [],
      customers: [],
      metadata: {
        unexpectedFields: {
          invoices: {},
          products: {},
          customers: {}
        },
        warnings: []
      },
      validationState: {
        invoices: {},
        products: {},
        customers: {}
      }
    };

    // Helper function to ensure array format
    const ensureArray = (data: any) => {
      if (!data) return [];
      if (Array.isArray(data)) return data;
      return [data];
    };

    // Helper function to generate UUID
    const generateId = () => {
      return Math.random().toString(36).substring(2) + Date.now().toString(36);
    };

    // Process products with validation feedback
    const products = ensureArray(parsed.products);
    products.forEach((product: any) => {
      const normalizedProduct = normalizeProductTax(product);
      const validation = validateProductData(normalizedProduct);
      
      // Add the product even if it has validation errors
      if (!normalizedProduct.id) {
        normalizedProduct.id = generateId();
      }
      validatedData.products.push(normalizedProduct);
      
      // Ensure validationState is initialized
      validatedData.validationState = validatedData.validationState || {
        invoices: {},
        products: {},
        customers: {}
      };

      if (validation.length > 0) {
        validatedData.validationState.products[normalizedProduct.id] = validation.map(message => ({
          field: 'product',
          message,
          severity: 'error',
          type: 'error'
        }));
      }
    });

    // Process invoices with normalized tax values
    const invoices = ensureArray(parsed.invoices);
    invoices.forEach((invoice: any) => {
      const normalizedInvoice = normalizeNumericValues(invoice);
      const { errors, warnings, unexpectedFields } = validateInvoiceData(normalizedInvoice);
      
      if (errors.length === 0) {
        const invoiceId = normalizedInvoice.id || generateId();
        normalizedInvoice.id = invoiceId;
        
        // Store unexpected fields in metadata
        if (unexpectedFields.length > 0) {
          validatedData.metadata!.unexpectedFields!.invoices![invoiceId] = unexpectedFields;
        }
        
        // Store warnings in metadata
        if (warnings.length > 0) {
          validatedData.metadata!.warnings = validatedData.metadata!.warnings || [];
          validatedData.metadata!.warnings.push(...warnings);
        }
        
        validatedData.invoices.push(normalizedInvoice);
      } else {
        console.error('Critical invoice validation errors:', errors);
      }
    });

    // Validate and add customers
    const customers = ensureArray(parsed.customers);
    customers.forEach((customer: any) => {
      const errors = validateCustomerData(customer);
      if (errors.length === 0) {
        if (!customer.id) {
          customer.id = generateId();
        }
        validatedData.customers.push(customer);
      } else {
        console.warn('Customer validation errors:', errors);
      }
    });

    return validatedData;
  } catch (error) {
    console.error('Error processing response:', error);
    throw error;
  }
};

// Add a utility function to analyze unexpected fields
export const analyzeUnexpectedFields = (extractedData: ExtractedData): void => {
  const { metadata } = extractedData;
  if (!metadata?.unexpectedFields) return;

  console.log('=== Unexpected Fields Analysis ===');
  
  Object.entries(metadata.unexpectedFields).forEach(([type, fieldsMap]) => {
    const allFields = new Set<string>();
    Object.values(fieldsMap).forEach(fields => fields.forEach(field => allFields.add(field)));
    
    if (allFields.size > 0) {
      console.log(`\n${type} unexpected fields:`);
      console.log(Array.from(allFields).join(', '));
    }
  });
};
