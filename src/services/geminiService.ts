import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.REACT_APP_GEMINI_API_KEY || '')
export const processFileWithGemini = async (file: File) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    // Convert file to base64
    const base64Data = await fileToBase64(file);
    
    // For the free version, we'll send the file content as text
    const result = await model.generateContent([
      { text: `Process this document content: ${base64Data}` }
    ]);
    
    const response = await result.response;
    const text = response.text();
    
    return {
      invoices: [], // Parse the response to extract relevant data
      products: [],
      customers: []
    };
  } catch (error) {
    console.error('Error processing file with Gemini:', error);
    throw error;
  }
};

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
}; 