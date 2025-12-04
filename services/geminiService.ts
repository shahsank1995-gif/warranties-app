import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
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
    You are an intelligent assistant for a warranty tracking application.
    Analyze the following ${documentType} which is either a receipt or a policy document.
    Extract the requested information in a structured JSON format.
    - productName: The main product or policy name. Be specific (e.g., "Bajaj Avenger 150 Insurance", "Sony WH-1000XM4 Headphones").
    - purchaseDate: The date of purchase or policy start date in YYYY-MM-DD format.
    - expiryDate: The explicit expiry date if mentioned (e.g., policy expiry). If present, use this over calculating from a warranty period. Format: YYYY-MM-DD.
    - warrantyPeriod: The warranty or policy duration (e.g., "1 year", "90 days"). If not mentioned, use "Not specified".
    - retailer: The name of the store, retailer, or policy issuer (e.g., "Best Buy", "ACKO General Insurance").

    If any information is unclear or not present, use a null value for that field.
    Your response must be only the JSON object, without any surrounding text or markdown formatting.
  `;

  try {
    const API_KEY = import.meta.env.VITE_GOOGLE_GENAI_API_KEY;
    if (!API_KEY) {
      throw new Error("VITE_GOOGLE_GENAI_API_KEY not set in environment variables");
    }

    const ai = new GoogleGenerativeAI(API_KEY);
    const genModel = ai.getGenerativeModel({ 
      model: "gemini-pro",
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: SchemaType.OBJECT,
          properties: {
            productName: { type: SchemaType.STRING },
            purchaseDate: { type: SchemaType.STRING },
            expiryDate: { type: SchemaType.STRING, nullable: true },
            warrantyPeriod: { type: SchemaType.STRING },
            retailer: { type: SchemaType.STRING },
          },
          required: ["productName", "purchaseDate", "warrantyPeriod"],
        },
      },
    });

    const response = await genModel.generateContent([filePart, { text: prompt }]);
    const text = response.response.text().trim();
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
