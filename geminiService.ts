
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getWorkoutTip = async (blockName: string, exercises: string[], language: string = 'en') => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Provide a single short, professional tip (under 20 words) in ${language} for performing a workout involving: ${exercises.join(', ')}. Focus on form or intensity.`,
      config: {
        temperature: 0.7,
      }
    });
    return response.text?.trim() || "Stay focused on your form and keep the intensity high.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Push yourself and maintain perfect control throughout each rep.";
  }
};
