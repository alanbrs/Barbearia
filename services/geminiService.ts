
import { GoogleGenAI } from "@google/genai";

export const getBarberInsights = async (appointmentCount: number) => {
  try {
    const env = (window as any).process?.env || {};
    const apiKey = env.API_KEY;
    
    if (!apiKey) {
      return "Foque na experiência do cliente hoje. Um bom atendimento fideliza mais que um bom corte.";
    }

    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Sou um barbeiro e tenho ${appointmentCount} agendamentos hoje. Me dê uma frase curta e motivacional para começar o dia e um breve conselho sobre atendimento premium.`,
    });
    
    return response.text || "O sucesso é a soma de pequenos esforços repetidos dia após dia.";
  } catch (error) {
    console.warn("AI indisponível.");
    return "Excelência não é um ato, mas um hábito.";
  }
};
