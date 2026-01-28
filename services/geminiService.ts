
import { GoogleGenAI } from "@google/genai";

export const getBarberInsights = async (appointmentCount: number) => {
  try {
    // Acesso seguro ao process.env
    const safeProcess = (typeof process !== 'undefined' ? process : (window as any).process) || { env: {} };
    const apiKey = safeProcess.env?.API_KEY || '';
    
    if (!apiKey) {
      return "Um bom corte começa com uma boa conversa. Tenha um excelente dia de trabalho!";
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
    console.warn("Dica do Mestre temporariamente indisponível.");
    return "A excelência está nos detalhes. Transforme cada atendimento em uma experiência única.";
  }
};
