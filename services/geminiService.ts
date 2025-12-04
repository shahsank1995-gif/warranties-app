import { GoogleGenerativeAI } from "@google/generative-ai";
import type { ExtractedData } from '../types';
function fileToGenerativePart(base64: string, mimeType: string) {
  return {
    inlineData: {
      data: base64,
      mimeType,
    },
  };
}
export async function extractReceiptData(
  fileBase64: string,
  mimeType: string
): Promise<ExtractedData> {
  const filePart = fileToGenerativePart(fileBase64, mimeType);
  const documentType = mimeType.includes('pdf') ? 'PDF document' : 'image';
  const prompt = `
    Analyze this ${documentType} (receipt or policy document).
    Extract and return ONLY a JSON object with these fields:
    
    {
      "productName": "product or policy name",
      "purchaseDate": "YYYY-MM-DD format",
      "expiryDate": "YYYY-MM-DD or null",
      "warrantyPeriod": "e.g. 1 year",
      "retailer": "store name"
    }
  `;
  try {
    const API_KEY = import.meta.env.VITE_GOOGLE_GENAI_API_KEY;
    if (!API_KEY) {
      throw new Error("API key not set");
    }
    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent([prompt, filePart]);
    const response = result.response;
    const text = response.text();
    
    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("No JSON found in response");
    }
    
    const data = JSON.parse(jsonMatch[0]);
    return {
      productName: data.productName || null,
      purchaseDate: data.purchaseDate || null,
      expiryDate: data.expiryDate || null,
      warrantyPeriod: data.warrantyPeriod || 'Not specified',
      retailer: data.retailer || null,
    };
  } catch (error) {
    console.error("Error:", error);
    throw new Error("Failed to analyze receipt");
  }
}
