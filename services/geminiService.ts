
import { GoogleGenAI } from "@google/genai";

export const getBarberInsights = async (appointmentCount: number) => {
  try {
    const apiKey = (window as any).process?.env?.API_KEY || 
                   (typeof process !== 'undefined' ? process.env.API_KEY : '');
    
    if (!apiKey) {
      return "Foque na experiência do cliente. Um sorriso e um bom café valem tanto quanto um degradê perfeito.";
    }

    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Sou um barbeiro e tenho ${appointmentCount} agendamentos hoje. Me dê uma frase curta e motivacional de barbeiro para começar o dia.`,
    });
    
    return response.text || "Qualidade é a nossa marca registrada.";
  } catch (error) {
    return "O sucesso é o resultado da sua dedicação diária.";
  }
};
