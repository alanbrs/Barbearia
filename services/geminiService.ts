
import { GoogleGenAI } from "@google/genai";

export const getBarberInsights = async (appointmentCount: number) => {
  try {
    // Acessa o process.env de forma segura dentro da função
    const apiKey = (typeof process !== 'undefined' && process.env.API_KEY) ? process.env.API_KEY : '';
    
    if (!apiKey) {
      return "A arte de barbear é o toque final na confiança de um homem. Tenha um ótimo dia!";
    }

    const ai = new GoogleGenAI({ apiKey });
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
    return "Excelência não é um ato, mas um hábito. Transforme cada corte em uma obra de arte.";
  }
};
