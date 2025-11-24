import { GoogleGenAI, Type } from "@google/genai";
import { CoupleData, GeneratedContent } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateWeddingContent = async (data: CoupleData): Promise<GeneratedContent> => {
  const model = "gemini-2.5-flash";
  
  const eventContext = data.eventType === 'KHITANAN' 
    ? `Anak yang dikhitan: ${data.groomName} (Panggilan: ${data.groomNickname}). Acara: Khitanan / Sunatan.`
    : `Pasangan: Pria ${data.groomName} (${data.groomNickname}) & Wanita ${data.brideName} (${data.brideNickname}). Acara: ${data.eventType === 'TUNANGAN' ? 'Pertunangan / Lamaran' : 'Pernikahan'}.`;

  const prompt = `
    Berperanlah sebagai sesepuh adat Jawa yang sangat bijaksana dan berwibawa.
    Tugasmu adalah membuatkan konten untuk undangan digital dengan nuansa sakral dan puitis sesuai jenis acara.

    Data Acara:
    Jenis: ${data.eventType}
    ${eventContext}
    Tanggal: ${data.weddingDate}

    Saya membutuhkan output JSON (tanpa markdown code block) dengan dua field:
    1. "quote": Sebuah paragraf (3-4 kalimat) ucapan doa restu. Gunakan Bahasa Jawa Krama Inggil yang halus dicampur dengan Bahasa Indonesia yang puitis.
       - Jika Pernikahan: Doa untuk keluarga Sakinah, Mawaddah, Warahmah.
       - Jika Tunangan: Doa agar dilancarkan sampai hari H dan saling menjaga komitmen.
       - Jika Khitanan: Doa agar anak menjadi anak sholeh, berbakti, dan segera pulih/sehat.
    2. "wetonAnalysis": Analisis filosofis singkat (maksimal 30 kata) mengenai tanggal acara (${data.weddingDate}). Kaitkan dengan filosofi alam atau mangsa dalam budaya Jawa.

    Contoh Tone:
    "Mugi-mugi Gusti Allah tansah paring berkah..."
  `;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            quote: { type: Type.STRING },
            wetonAnalysis: { type: Type.STRING }
          },
          required: ["quote", "wetonAnalysis"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    return JSON.parse(text) as GeneratedContent;
  } catch (error) {
    console.error("Error generating content:", error);
    return {
      quote: "Mugi-mugi Gusti Allah tansah paring berkah lan rahmat dumateng sedoyo, binerkahan ing ndonya lan akhirat.",
      wetonAnalysis: "Hari yang penuh berkah dan cahaya untuk memulai lembaran baru."
    };
  }
};