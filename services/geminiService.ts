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
    Analyze this ${documentType} which is either a receipt or a policy document.
    Extract the following information and return ONLY a valid JSON object with these exact fields:
    
    {
      "productName": "The main product or policy name",
      "purchaseDate": "Purchase or start date in YYYY-MM-DD format",
      "expiryDate": "Expiry date in YYYY-MM-DD format (or null if not mentioned)",
      "warrantyPeriod": "Warranty duration like '1 year' or '90 days'",
      "retailer": "Store or issuer name"
    }
    
    Return ONLY the JSON object, no other text.
  `;

  try {
    const API_KEY = import.meta.env.VITE_GOOGLE_GENAI_API_KEY;
    if (!API_KEY) {
      throw new Error("VITE_GOOGLE_GENAI_API_KEY not set in environment variables");
    }

    const ai = new GoogleGenerativeAI(API_KEY);
    const model = ai.getGenerativeModel({ model: "gemini-1.5-flash" });

    const result = await model.generateContent([prompt, filePart]);
    const response = await result.response;
    const text = response.text().trim();
    const cleanedText = text.replace(/```json|```/g, '').trim();
    const data = JSON.parse(cleanedText);

    return {
      productName: data.productName || null,
      purchaseDate: data.purchaseDate || null,
      expiryDate: data.expiryDate || null,
      warrantyPeriod: data.warrantyPeriod || 'Not specified',
      retailer: data.retailer || null,
    };
  } catch (error) {
    console.error("Error extracting receipt data:", error);
    throw new Error("Failed to analyze receipt. Please try again.");
  }
}
