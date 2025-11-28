import { GoogleGenAI } from "@google/genai";
import { PodConfiguration, AddressData, ContactData } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generatePodSummary = async (
  config: PodConfiguration,
  address: AddressData,
  contact: ContactData
): Promise<string> => {
  try {
    const prompt = `
      You are a helpful sales assistant for a backyard pod company.
      Generate a single, engaging sentence summarizing the customer's configuration.
      Do not mention the price. Focus on the benefits.

      Configuration:
      - Use Case: ${config.useCase}
      - Exterior Color: ${config.exteriorColor}
      - Flooring: ${config.flooring}
      - HVAC: ${config.hvac}
      - Location: ${address.fullAddress}
      - User Name: ${contact.fullName}
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "Your custom backyard pod configuration is ready for review.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return `A custom ${config.useCase} pod with ${config.exteriorColor} exterior and ${config.flooring} flooring.`;
  }
};