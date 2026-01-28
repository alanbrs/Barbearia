
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getBarberInsights = async (appointmentCount: number) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Sou um barbeiro e tenho ${appointmentCount} agendamentos hoje. Me dê uma frase curta e motivacional de "Dica do Mestre" para começar o dia e um breve conselho sobre atendimento ao cliente premium.`,
      config: {
        temperature: 0.8,
        maxOutputTokens: 150
      }
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "A arte de barbear é o toque final na confiança de um homem. Tenha um ótimo dia de trabalho!";
  }
};
