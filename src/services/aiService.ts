import { GoogleGenerativeAI ,GoogleGenerativeAIFetchError} from '@google/generative-ai';
import { ExtractedData, Invoice, Product, Customer } from '../types';
import { validateInvoiceData, validateProductData, validateCustomerData } from '../utils/validators';
import { createWorker } from 'tesseract.js';
import * as XLSX from 'xlsx';
import * as pdfjsLib from 'pdfjs-dist';

// Initialize Gemini API with your key
const genAI = new GoogleGenerativeAI(process.env.REACT_APP_GEMINI_API_KEY || '');

const SYSTEM_PROMPT = `Extract invoice, product, and customer information from the provided document. 
Format the response as a JSON object with three arrays: invoices, products, and customers. 
Each array should contain objects with the following required fields:

Invoices: serialNumber, customerName, productName, quantity, tax, totalAmount, date
Products: name, quantity, unitPrice, tax, priceWithTax
Customers: name, phoneNumber, totalPurchaseAmount

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

function validateAndProcessResponse(text: string): ExtractedData {
  try {
    const cleanedText = text.replace(/```json\n?|\n?```/g, '').trim();
    const parsed = JSON.parse(cleanedText);

    // Log the parsed data
    console.log('Parsed Data:', parsed);

    const validatedData: ExtractedData = {
      invoices: [],
      products: [],
      customers: []
    };

    // Safely handle potential array or object responses
    const invoices = Array.isArray(parsed.invoices) ? parsed.invoices : 
                     (parsed.invoices ? [parsed.invoices] : []);
    const products = Array.isArray(parsed.products) ? parsed.products : 
                     (parsed.products ? [parsed.products] : []);
    const customers = Array.isArray(parsed.customers) ? parsed.customers : 
                      (parsed.customers ? [parsed.customers] : []);

    invoices.forEach((invoice: any) => {
      const errors = validateInvoiceData(invoice);
      if (errors.length === 0) {
        validatedData.invoices.push(invoice);
      }
    });

    products.forEach((product: any) => {
      const errors = validateProductData(product);
      if (errors.length === 0) {
        validatedData.products.push(product);
      }
    });

    customers.forEach((customer: any) => {
      const errors = validateCustomerData(customer);
      if (errors.length === 0) {
        validatedData.customers.push(customer);
      }
    });

    return validatedData;
  } catch (error) {
    console.error('Error parsing AI response:', error);
    
    // Optional: Add more detailed error logging
    console.error('Original text:', text);
    
    throw new Error('Failed to parse extracted data. The AI response may not be in the expected JSON format.');
  }
}
