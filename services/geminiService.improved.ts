import { GoogleGenAI, Type } from "@google/genai";
import type { 
  Story, Chapter, Character, BetaReaderFeedback, 
  ScriptIssue, GrammarSuggestion, RepetitionIssue, 
  Message, WorldEntry, WorldEntryCategory, 
  StoryContent, Relationship 
} from '../types';

// Configuration
const API_KEY = process.env.API_KEY || process.env.GEMINI_API_KEY;

if (!API_KEY) {
  throw new Error("API Key não configurada. Por favor, configure a variável GEMINI_API_KEY.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

// Helper function for safe API calls
async function safeApiCall<T>(
  apiCall: () => Promise<T>,
  fallback: T,
  errorMessage: string
): Promise<T> {
  try {
    return await apiCall();
  } catch (error) {
    console.error(errorMessage, error);
    return fallback;
  }
}

// Helper function for logging
function logError(context: string, error: unknown): void {
  if (process.env.NODE_ENV === 'development') {
    console.error(`[${context}]`, error);
  } else {
    // In production, you might want to send to an error tracking service
    console.error(`[${context}]`, error instanceof Error ? error.message : 'Unknown error');
  }
}

export const extractCharacterAppearance = async (fullText: string, characterName: string): Promise<string> => {
  const prompt = `
    Analise o texto completo a seguir e extraia uma descrição consolidada da aparência física do personagem "${characterName}".
    Concentre-se em detalhes visuais como cabelo, olhos, altura, constituição, roupas e características distintivas.
    Retorne apenas a descrição da aparência, em uma ou duas frases. Se nenhuma descrição física for encontrada, retorne uma estimativa com base no contexto.

    Texto:
    ---
    ${fullText}
    ---
  `;
  
  return safeApiCall(
    async () => {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });
      return response.text.trim();
    },
    "Nenhuma descrição física específica encontrada.",
    `Error extracting appearance for ${characterName}`
  );
};

export const generateCharacterAvatar = async (
  appearance: string, 
  genre: string, 
  style: string
): Promise<string> => {
  const prompt = `
    Crie um retrato de personagem, focado no rosto e ombros, no estilo de ${style}.
    Gênero da história: ${genre}.
    Descrição da aparência física do personagem: ${appearance}.
    O retrato deve ser artístico, evocativo e fiel à descrição. Sem texto na imagem.
  `;

  try {
    const response = await ai.models.generateImages({
      model: 'imagen-3.0-generate-002',
      prompt: prompt,
      config: {
        numberOfImages: 1,
        outputMimeType: 'image/png',
        aspectRatio: '1:1',
      },
    });

    const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
    return `data:image/png;base64,${base64ImageBytes}`;
  } catch (error) {
    logError("Error generating character avatar", error);
    // Return a fallback image on error
    const seed = appearance.replace(/\s/g, '').slice(0, 10);
    return `https://picsum.photos/seed/${seed}/200`;
  }
};

const initialAnalysisState = {
  scriptIssues: { results: [], ignored: [], lastAnalyzed: null },
  repetitions: { results: [], ignored: [], lastAnalyzed: null },
};

interface CharacterData {
  name: string;
  description: string;
  role: string;
}

interface ChapterData {
  title: string;
  summary: string;
  content: string;
}

interface StoryGenerationResponse {
  title: string;
  synopsis: string;
  characters: CharacterData[];
  chapters: ChapterData[];
}

export const generateStoryStructure = async (
  genre: string, 
  theme: string, 
  userPrompt: string
): Promise<Story> => {
  const prompt = `
    Gere uma estrutura de história completa em Português com base nos seguintes parâmetros.
    Gênero: ${genre}
    Tema: ${theme}
    Prompt do Usuário: ${userPrompt}

    Crie um título, uma sinopse, uma lista de personagens e um esboço de capítulos com conteúdo inicial.
    A história deve ser coesa, criativa e seguir as convenções do gênero especificado.
  `;
  
  const generationSchema = {
    type: Type.OBJECT,
    properties: {
      title: {
        type: Type.STRING,
        description: "Um título criativo e cativante para a história."
      },
      synopsis: {
        type: Type.STRING,
        description: "Uma sinopse curta (2-3 frases) da história."
      },
      characters: {
        type: Type.ARRAY,
        description: "Uma lista de 3 a 5 personagens principais.",
        items: {
          type: Type.OBJECT,
          properties: {
            name: { 
              type: Type.STRING, 
              description: "Nome completo do personagem." 
            },
            description: { 
              type: Type.STRING, 
              description: "Uma breve descrição da personalidade e motivações do personagem. NÃO inclua aparência física aqui." 
            },
            role: { 
              type: Type.STRING, 
              description: "O papel do personagem na história (ex: Protagonista, Antagonista, Mentor, Alívio Cômico)." 
            },
          },
          required: ["name", "description", "role"]
        }
      },
      chapters: {
        type: Type.ARRAY,
        description: "Uma lista de 5 a 10 capítulos iniciais que estruturam a história.",
        items: {
          type: Type.OBJECT,
          properties: {
            title: { 
              type: Type.STRING, 
              description: "O título do capítulo." 
            },
            summary: { 
              type: Type.STRING, 
              description: "Um resumo de uma frase dos principais eventos do capítulo." 
            },
            content: { 
              type: Type.STRING, 
              description: "O conteúdo completo do capítulo inicial, que deve introduzir os personagens e a trama."
            }
          },
          required: ["title", "summary", "content"]
        }
      }
    },
    required: ["title", "synopsis", "characters", "chapters"]
  };

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: generationSchema,
      },
    });

    const storyData: StoryGenerationResponse = JSON.parse(response.text);
    const fullText = storyData.chapters.map((c: ChapterData) => c.content).join('\n\n');

    const charactersWithDetails = await Promise.all(
      storyData.characters.map(async (char: CharacterData, index: number) => {
        const appearance = await extractCharacterAppearance(fullText, char.name);
        const avatarUrl = await generateCharacterAvatar(appearance, genre, "Arte Digital");
        return {
          ...char,
          id: `char-${Date.now()}-${index}`,
          appearance,
          avatarUrl,
          narrativeArc: "",
          relationships: [] as Relationship[],
        };
      })
    );
    
    // Augment data with IDs and placeholders
    const storyWithIds: Story = {
      id: `story-${Date.now()}`,
      genre,
      title: storyData.title,
      synopsis: storyData.synopsis,
      characters: charactersWithDetails,
      chapters: storyData.chapters.map((chap, index) => ({
        ...chap,
        id: `chap-${Date.now()}-${index}`,
      })),
      analysis: initialAnalysisState,
      chatHistory: [],
      world: [],
      versions: [],
      actionLog: [
        { 
          id: `log-${Date.now()}`, 
          timestamp: new Date().toISOString(), 
          actor: 'agent', 
          action: 'História criada com sucesso.' 
        }
      ],
      autosaveEnabled: false,
    };
    
    return storyWithIds;
  } catch (error) {
    logError("Error generating story structure", error);
    throw new Error("Falha ao gerar a história. Por favor, tente novamente.");
  }
};

export const continueWriting = async (context: string): Promise<string> => {
  const prompt = `Você é um assistente de escrita criativa. Continue a seguinte história a partir do ponto onde ela parou, adicionando um ou dois parágrafos. Mantenha o tom, o estilo e os personagens consistentes.

História até agora:
---
${context}
---
`;
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    logError("Error continuing writing", error);
    throw new Error("Falha ao continuar a escrita. Tente novamente.");
  }
};

export const modifyText = async (
  text: string, 
  context: string, 
  instruction: string
): Promise<string> => {
  const prompt = `Você é um editor de texto habilidoso. Siga esta instrução para modificar o trecho de texto fornecido: "${instruction}"

Contexto completo do capítulo (para referência de tom e estilo):
---
${context}
---

Texto a ser modificado:
---
${text}
---

Retorne APENAS o texto modificado, sem explicações adicionais.`;
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });
    return response.text.trim();
  } catch (error) {
    logError("Error modifying text", error);
    throw new Error("Falha ao modificar o texto. Tente novamente.");
  }
};

export const getBetaReaderFeedback = async (chapter: Chapter): Promise<BetaReaderFeedback> => {
  const feedbackSchema = {
    type: Type.OBJECT,
    properties: {
      overallImpression: { 
        type: Type.STRING, 
        description: "Impressão geral do capítulo em 2-3 frases." 
      },
      pacing: { 
        type: Type.STRING, 
        description: "Comentários sobre o ritmo da narrativa." 
      },
      dialogue: { 
        type: Type.STRING, 
        description: "Feedback sobre os diálogos e vozes dos personagens." 
      },
      characterConsistency: { 
        type: Type.STRING, 
        description: "Análise da consistência dos personagens." 
      },
      suggestionsForImprovement: {
        type: Type.ARRAY,
        description: "Lista de 3-5 sugestões específicas para melhorar o capítulo.",
        items: { type: Type.STRING }
      }
    },
    required: ["overallImpression", "pacing", "dialogue", "characterConsistency", "suggestionsForImprovement"]
  };
  
  const prompt = `Você é um beta reader experiente. Analise o seguinte capítulo e forneça feedback construtivo:

Título: ${chapter.title}
Conteúdo:
---
${chapter.content}
---`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: feedbackSchema,
      },
    });
    return JSON.parse(response.text);
  } catch (error) {
    logError("Error getting beta reader feedback", error);
    throw new Error("Falha ao obter feedback. Tente novamente.");
  }
};

// Export all other functions from the original file
export { 
  analyzeScriptContinuity,
  checkGrammar,
  analyzeRepetitions,
  importStoryFromText,
  aiAgentChat,
  generateInspiration,
  analyzeTextForWorldEntries,
  suggestCharacterRelationships 
} from './geminiService';