



import { apiService } from './api.service';
import type { Story, Chapter, Character, BetaReaderFeedback, ScriptIssue, GrammarSuggestion, RepetitionIssue, Message, WorldEntry, WorldEntryCategory, StoryContent, Relationship, PlotCard, PacingPoint, CharacterVoiceDeviation, ShowDontTellSuggestion, BlogPost } from '../types';

const GEMINI_FLASH_MODEL = 'gemini-flash';
const GEMINI_PRO_MODEL = 'gemini-pro';

// Helper function to call AI through backend
async function callAI(prompt: string, context?: any, model: string = GEMINI_FLASH_MODEL): Promise<any> {
  try {
    const response = await apiService.chat(prompt, context, model);
    if (response.data && response.data.response) {
      // Try to parse JSON if the response looks like JSON
      const responseText = response.data.response;
      if (typeof responseText === 'string' && (responseText.trim().startsWith('{') || responseText.trim().startsWith('['))) {
        try {
          return JSON.parse(responseText);
        } catch {
          return responseText;
        }
      }
      return responseText;
    }
    throw new Error('Invalid response from AI service');
  } catch (error) {
    console.error('Error calling AI service:', error);
    throw error;
  }
}

// Helper to strip HTML tags for AI processing
const stripHtml = (html: string) => {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || "";
};

export const generateCharacterDialogue = async (story: Story, character: Character, recentContext: string): Promise<string> => {
    const prompt = `
        Aja como um ghostwriter especialista em diálogos de personagens.
        Sua tarefa é escrever uma única e impactante linha de diálogo para um personagem específico, com base em sua personalidade e no contexto imediato da cena.

        SOBRE A HISTÓRIA:
        - Gênero: ${story.genre}
        - Sinopse: ${story.synopsis}

        SOBRE O PERSONAGEM QUE VAI FALAR:
        - Nome: ${character.name}
        - Papel: ${character.role}
        - Personalidade e Motivações: ${character.description}

        CONTEXTO DA CENA (O QUE ACONTECEU IMEDIATAMENTE ANTES):
        ---
        ${stripHtml(recentContext)}
        ---

        INSTRUÇÕES:
        - Escreva UMA linha de diálogo para ${character.name}.
        - A fala deve ser consistente com a personalidade do personagem e o tom da cena.
        - Retorne APENAS o texto do diálogo. NÃO inclua aspas, nome do personagem ou atribuições como "ele disse".

        DIÁLOGO:
    `;

    try {
        const response = await callAI(prompt, { story, character, recentContext });
        return typeof response === 'string' ? response.trim() : String(response).trim();
    } catch (error) {
        console.error("Error generating character dialogue:", error);
        throw new Error("Falha ao gerar o diálogo. Tente novamente.");
    }
};


// Note: generateBookCover needs special handling as it uses IMAGEN model
// For now, it will return a placeholder or use the backend's generateCover endpoint
export const generateBookCover = async (prompt: string, style: string): Promise<string> => {
    const fullPrompt = `Capa de livro, estilo de ${style}. A imagem deve ser puramente artística, SEM NENHUM TEXTO, letras, palavras, títulos ou nomes de autor. Foco total na arte visual evocativa e profissional. Prompt do usuário: "${prompt}"`;
    try {
        const response = await ai.models.generateImages({
            model: IMAGEN_MODEL,
            prompt: fullPrompt,
            config: {
                numberOfImages: 1,
                outputMimeType: 'image/jpeg',
                aspectRatio: '3:4',
            },
        });

        if (response?.generatedImages?.length > 0 && response.generatedImages[0].image?.imageBytes) {
            const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
            return `data:image/jpeg;base64,${base64ImageBytes}`;
        } else {
            throw new Error("A API não retornou uma imagem válida.");
        }
    } catch (error) {
        console.error("Error generating book cover:", error);
        throw new Error("Falha ao gerar a capa do livro. Tente novamente.");
    }
};

export const formatTextWithAI = async (text: string): Promise<string> => {
    const prompt = `
        Aja como um formatador de texto profissional para um manuscrito de ficção.
        Analise o seguinte texto e formate-o usando tags HTML simples (<p>, <i>, <b>).
        - Envolva cada parágrafo em tags <p></p>.
        - Use <i> para pensamentos internos ou ênfase.
        - Use <b> para um destaque forte, se aplicável.
        - Garanta que os diálogos estejam em seus próprios parágrafos.
        NÃO adicione, remova ou reescreva nenhuma palavra. A tarefa é estritamente de formatação.
        Retorne apenas o HTML formatado.

        Texto para formatar:
        ---
        ${text}
        ---
    `;
    try {
        const response = await callAI(prompt, { text });
        return typeof response === 'string' ? response.trim() : String(response).trim();
    } catch (error) {
        console.error("Error formatting text with AI:", error);
        throw new Error("Falha ao formatar o texto. Tente novamente.");
    }
};

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
  try {
    const response = await callAI(prompt, { fullText, characterName });
    return typeof response === 'string' ? response.trim() : String(response).trim();
  } catch (error) {
    console.error(`Error extracting appearance for ${characterName}:`, error);
    return "Nenhuma descrição física específica encontrada.";
  }
};


export const generateCharacterAvatar = async (appearance: string, genre: string, style: string): Promise<{ success: boolean; url: string; error?: string; }> => {
  const fallbackUrl = `https://picsum.photos/seed/${appearance.replace(/\s/g, '').slice(0, 10)}/200`;
  const prompt = `
    Crie um retrato de personagem, focado no rosto e ombros, no estilo de ${style}.
    Gênero da história: ${genre}.
    Descrição da aparência física do personagem: ${appearance}.
    O retrato deve ser artístico, evocativo e fiel à descrição. IMPORTANTE: A imagem NÃO deve conter nenhum texto, letras ou palavras.
  `;

  try {
    const response = await ai.models.generateImages({
      model: IMAGEN_MODEL,
      prompt: prompt,
      config: {
        numberOfImages: 1,
        outputMimeType: 'image/jpeg',
        aspectRatio: '1:1',
      },
    });

    if (response?.generatedImages?.length > 0 && response.generatedImages[0].image?.imageBytes) {
        const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
        return { success: true, url: `data:image/jpeg;base64,${base64ImageBytes}` };
    } else {
        throw new Error("A API não retornou uma imagem válida.");
    }
  } catch (error: any) {
    console.error("Error generating character avatar:", error);
    let errorMessage = "Falha ao gerar o avatar. Usando uma imagem de fallback.";
    
    // Make error checking more robust by stringifying the error object.
    const errorString = JSON.stringify(error);

    if (errorString.includes("quota") || errorString.includes("RESOURCE_EXHAUSTED")) {
        errorMessage = "Cota de geração de imagens excedida. Usando uma imagem de fallback.";
    }
    return { success: false, url: fallbackUrl, error: errorMessage };
  }
};

const initialAnalysisState = {
    scriptIssues: { results: [], ignored: [], lastAnalyzed: null },
    repetitions: { results: [], ignored: [], lastAnalyzed: null },
    pacing: { results: [], lastAnalyzed: null },
    characterVoices: {},
};

// FIX: Added authorId parameter to satisfy the Story type contract on return.
export const generateStoryStructure = async (genre: string, theme: string, userPrompt: string, authorId: string): Promise<Story> => {
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
              name: { type: Type.STRING, description: "Nome completo do personagem." },
              description: { type: Type.STRING, description: "Uma breve descrição da personalidade e motivações do personagem. NÃO inclua aparência física aqui." },
              role: { type: Type.STRING, description: "O papel do personagem na história (ex: Protagonista, Antagonista, Mentor, Alívio Cômico)." },
            },
            required: ["name", "description", "role"],
            propertyOrdering: ["name", "description", "role"]
          }
        },
        chapters: {
          type: Type.ARRAY,
          description: "Uma lista de 5 a 10 capítulos iniciais que estruturam a história.",
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING, description: "O título do capítulo." },
              summary: { type: Type.STRING, description: "Um resumo de uma frase dos principais eventos do capítulo." },
              content: { type: Type.STRING, description: "O conteúdo completo do capítulo inicial, que deve introduzir os personagens e a trama."}
            },
            required: ["title", "summary", "content"],
            propertyOrdering: ["title", "summary", "content"]
          }
        }
      },
      required: ["title", "synopsis", "characters", "chapters"]
  };

  try {
    const fullPrompt = prompt + `\n\nRetorne o resultado EXATAMENTE no formato JSON especificado, sem explicações adicionais.`;
    const response = await callAI(fullPrompt, { genre, theme, userPrompt });
    
    const storyData = typeof response === 'object' ? response : JSON.parse(response);
    const fullText = storyData.chapters.map((c: Chapter) => c.content).join('\n\n');

    const charactersWithDetails = [];
    for (const [index, char] of storyData.characters.entries()) {
        const appearance = await extractCharacterAppearance(fullText, char.name);
        const avatarResult = await generateCharacterAvatar(appearance, genre, "Arte Digital");
        charactersWithDetails.push({
            ...char,
            id: `char-${Date.now()}-${index}`,
            appearance,
            avatarUrl: avatarResult.url,
            narrativeArc: "",
            relationships: [],
        });
    }
    
    // Augment data with IDs and placeholders
    // FIX: Added authorId and isPublished to satisfy the Story type contract.
    const storyWithIds: Story = {
      id: `story-${Date.now()}`,
      authorId,
      isPublished: false,
      genre,
      title: storyData.title,
      synopsis: storyData.synopsis,
      characters: charactersWithDetails,
      chapters: storyData.chapters.map((chap: Omit<Chapter, 'id'>, index: number) => ({
        ...chap,
        id: `chap-${Date.now()}-${index}`,
      })),
      analysis: initialAnalysisState,
      chatHistory: [],
      world: [],
      versions: [],
      actionLog: [
        { id: `log-${Date.now()}`, timestamp: new Date().toISOString(), actor: 'user', action: 'História criada com IA.' }
      ],
      autosaveEnabled: false,
      plot: { cards: [], connections: [] },
    };

    return storyWithIds;

  } catch (error) {
    console.error("Error generating story structure:", error);
    throw new Error("Falha ao gerar a história. Por favor, tente novamente.");
  }
};

// ... (rest of the functions: continueWriting, modifyText, getBetaReaderFeedback, etc. remain the same)
export const continueWriting = async (context: string): Promise<string> => {
  const prompt = `Você é um assistente de escrita criativa. Continue a seguinte história a partir do ponto onde ela parou, adicionando um ou dois parágrafos. Mantenha o tom, o estilo e os personagens consistentes.

História até agora:
---
${stripHtml(context)}
---
`;
  try {
    const response = await ai.models.generateContent({
      model: GEMINI_FLASH_MODEL,
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Error continuing writing:", error);
    throw new Error("Falha ao continuar a escrita. Tente novamente.");
  }
};

export const modifyText = async (text: string, context: string, instruction: string): Promise<string> => {
  const prompt = `Você é um editor de texto habilidoso. Siga esta instrução para modificar o trecho de texto fornecido: "${instruction}"

Contexto completo do capítulo (para referência de tom e estilo):
---
${stripHtml(context)}
---

Trecho de texto a ser modificado:
---
${text}
---

Retorne apenas o texto modificado, sem comentários ou formatação extra.`;

  try {
    const response = await ai.models.generateContent({
      model: GEMINI_FLASH_MODEL,
      contents: prompt,
    });
    return response.text.trim();
  } catch (error) {
    console.error("Error modifying text:", error);
    throw new Error("Falha ao modificar o texto. Tente novamente.");
  }
};


const feedbackSchema = {
  type: Type.OBJECT,
  properties: {
    overallImpression: { type: Type.STRING, description: 'Feedback geral sobre o capítulo (1-2 frases).' },
    pacing: { type: Type.STRING, description: 'Comentários sobre o ritmo e o fluxo do capítulo.' },
    dialogue: { type: Type.STRING, description: 'Feedback sobre os diálogos dos personagens, se houver.' },
    characterConsistency: { type: Type.STRING, description: 'Análise da consistência da voz e das ações dos personagens.' },
    suggestionsForImprovement: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'Uma lista de 2-3 sugestões acionáveis para melhoria.' }
  },
  required: ["overallImpression", "pacing", "dialogue", "characterConsistency", "suggestionsForImprovement"]
};


export const getBetaReaderFeedback = async (chapterContent: string): Promise<BetaReaderFeedback> => {
  const prompt = `Aja como um leitor beta crítico e construtivo. Analise o capítulo de história a seguir. Forneça feedback honesto e útil com base no esquema JSON fornecido.

Conteúdo do Capítulo:
---
${stripHtml(chapterContent)}
---
`;
  try {
    const response = await ai.models.generateContent({
      model: GEMINI_FLASH_MODEL,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: feedbackSchema,
      },
    });
    return JSON.parse(response.text);
  } catch (error) {
    console.error("Error getting beta reader feedback:", error);
    throw new Error("Falha ao obter feedback. Tente novamente.");
  }
};

const scriptAnalysisSchema = {
    type: Type.ARRAY,
    items: {
        type: Type.OBJECT,
        properties: {
            description: { type: Type.STRING, description: 'Uma descrição clara e concisa do furo de roteiro ou inconsistência encontrada.' },
            involvedChapters: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'Uma lista dos títulos dos capítulos onde a inconsistência é relevante.' },
            suggestion: { type: Type.STRING, description: 'Uma sugestão construtiva sobre como o autor poderia resolver esse problema.' }
        },
        required: ["description", "involvedChapters", "suggestion"]
    }
};

export const analyzeScriptContinuity = async (story: Story): Promise<ScriptIssue[]> => {
    const storyContext = `
        Título: ${story.title}
        Sinopse: ${story.synopsis}

        Personagens:
        ${story.characters.map(c => `- ${c.name}: ${c.role}. ${c.description}`).join('\n')}

        Resumo dos Capítulos:
        ${story.chapters.map((c, i) => `Capítulo ${i + 1}: ${c.title} - ${c.summary}`).join('\n')}
    `;

    const prompt = `
        Aja como um editor de roteiro meticuloso e experiente (script doctor). Analise o resumo da história a seguir em busca de furos de roteiro, erros de continuidade e inconsistências no comportamento dos personagens.
        Se nenhum problema for encontrado, retorne uma matriz vazia.
        Forneça suas descobertas no formato JSON solicitado.

        Contexto da História:
        ---
        ${storyContext}
        ---
    `;

    try {
        const response = await ai.models.generateContent({
            model: GEMINI_FLASH_MODEL,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: scriptAnalysisSchema,
            },
        });
        return JSON.parse(response.text);
    } catch (error) {
        console.error("Error analyzing script continuity:", error);
        throw new Error("Falha ao analisar o roteiro. Tente novamente.");
    }
};

const grammarSchema = {
    type: Type.ARRAY,
    items: {
        type: Type.OBJECT,
        properties: {
            originalText: { type: Type.STRING, description: 'O trecho exato de texto com o erro.' },
            suggestedText: { type: Type.STRING, description: 'A versão corrigida e sugerida do texto.' },
            explanation: { type: Type.STRING, description: 'Uma breve explicação do erro gramatical ou de estilo.' }
        },
        required: ["originalText", "suggestedText", "explanation"]
    }
};

export const checkGrammar = async (text: string): Promise<GrammarSuggestion[]> => {
    const prompt = `
        Aja como um revisor de gramática e estilo meticuloso. Analise o seguinte texto em busca de erros de gramática, pontuação, concordância e estilo.
        Retorne uma lista de sugestões em formato JSON. Se nenhum erro for encontrado, retorne uma matriz vazia.

        Texto para analisar:
        ---
        ${stripHtml(text)}
        ---
    `;

    try {
        const response = await ai.models.generateContent({
            model: GEMINI_FLASH_MODEL,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: grammarSchema,
            },
        });
        return JSON.parse(response.text);
    } catch (error) {
        console.error("Error checking grammar:", error);
        throw new Error("Falha ao verificar a gramática. Tente novamente.");
    }
};

const repetitionSchema = {
    type: Type.ARRAY,
    items: {
        type: Type.OBJECT,
        properties: {
            text: { type: Type.STRING, description: 'A palavra ou frase repetida.' },
            count: { type: Type.NUMBER, description: 'O número de vezes que o texto foi repetido.' },
            locations: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'Uma lista dos títulos dos capítulos onde a repetição ocorre.' }
        },
        required: ["text", "count", "locations"]
    }
};

export const analyzeRepetitions = async (story: Story): Promise<RepetitionIssue[]> => {
    const fullText = story.chapters.map(c => `--- Início do Capítulo: ${c.title} ---\n${stripHtml(c.content)}`).join('\n\n');
    const prompt = `
        Aja como um editor de estilo. Analise o texto completo do livro a seguir em busca de palavras e frases repetidas que possam enfraquecer a prosa.
        Ignore palavras comuns (artigos, preposições, etc.). Concentre-se em substantivos, verbos, adjetivos e frases específicas que são usados com muita frequência.
        Retorne uma lista de problemas de repetição encontrados. Se nenhum problema for encontrado, retorne uma matriz vazia.

        Texto do Livro:
        ---
        ${fullText}
        ---
    `;

    try {
        const response = await ai.models.generateContent({
            model: GEMINI_FLASH_MODEL,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: repetitionSchema,
            },
        });

        const textResponse = response.text;
        if (!textResponse) {
            console.warn("AI returned an empty response for repetition analysis. Assuming no issues found.");
            return [];
        }
        
        return JSON.parse(textResponse);
    } catch (error) {
        console.error("Error analyzing repetitions:", error);
        throw new Error("Falha ao analisar repetições. Tente novamente.");
    }
};


// FIX: Added authorId parameter to satisfy the Story type contract on return.
export const importStoryFromText = async (textContent: string, authorId: string): Promise<Story> => {
  const importedStorySchema = {
    type: Type.OBJECT,
    properties: {
        title: { type: Type.STRING, description: "O título do livro, extraído do texto. Se não houver um explícito, crie um." },
        synopsis: { type: Type.STRING, description: "Uma sinopse curta (2-3 frases) gerada com base no conteúdo geral do texto." },
        genre: { type: Type.STRING, description: "O gênero principal do livro (ex: Fantasia, Ficção Científica, Mistério), inferido do texto." },
        characters: {
            type: Type.ARRAY,
            description: "Uma lista dos 3-5 personagens principais identificados no texto.",
            items: {
                type: Type.OBJECT,
                properties: {
                    name: { type: Type.STRING, description: "Nome completo do personagem." },
                    description: { type: Type.STRING, description: "Uma breve descrição da personalidade e motivações do personagem com base em suas ações e diálogos no texto." },
                    role: { type: Type.STRING, description: "O papel do personagem na história (ex: Protagonista, Antagonista)." }
                },
                required: ["name", "description", "role"]
            }
        }
    },
    required: ["title", "synopsis", "genre", "characters"]
  };
    
  const prompt = `
    Aja como um estruturalista literário. Analise o seguinte manuscrito completo. Sua tarefa é extrair os metadados da história e retorná-los em um único objeto JSON válido, sem nenhum texto extra ou markdown.

    1.  **Título**: Identifique o título da obra. Se não houver um título explícito, crie um apropriado com base no conteúdo.
    2.  **Sinopse**: Leia o texto inteiro e gere uma sinopse concisa de 2-3 frases.
    3.  **Gênero**: Leia o texto e infira o gênero principal (ex: Fantasia, Ficção Científica).
    4.  **Personagens**: Identifique de 3 a 5 personagens principais. Para cada um, forneça seu nome, uma breve descrição de personalidade e motivações com base em suas ações, e seu papel na história.

    NÃO divida o texto em capítulos. O texto inteiro será tratado como um único manuscrito.

    Manuscrito para analisar:
    ---
    ${textContent}
    ---
  `;

  try {
    const response = await ai.models.generateContent({
      model: GEMINI_FLASH_MODEL,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: importedStorySchema,
      },
    });

    let jsonString = response.text.trim();
    const storyData = JSON.parse(jsonString);

    const charactersWithDetails = [];
    for (const [index, char] of storyData.characters.entries()) {
        const appearance = await extractCharacterAppearance(textContent, char.name);
        const avatarResult = await generateCharacterAvatar(appearance, storyData.genre, "Arte Digital");
        charactersWithDetails.push({
            ...char,
            id: `char-${Date.now()}-${index}`,
            appearance,
            avatarUrl: avatarResult.url,
            narrativeArc: "",
            relationships: [],
        });
    }

    // FIX: Added authorId and isPublished to satisfy the Story type contract.
    const storyWithIds: Story = {
      id: `story-${Date.now()}`,
      authorId,
      isPublished: false,
      title: storyData.title,
      synopsis: storyData.synopsis,
      genre: storyData.genre,
      characters: charactersWithDetails,
      chapters: [
          {
              id: `chap-${Date.now()}-0`,
              title: "Manuscrito Importado",
              summary: `Manuscrito completo importado em ${new Date().toLocaleDateString()}.`,
              content: textContent,
          }
      ],
      analysis: initialAnalysisState,
      chatHistory: [],
      world: [],
      versions: [],
      actionLog: [
        { id: `log-${Date.now()}`, timestamp: new Date().toISOString(), actor: 'user', action: 'História importada de um arquivo.' }
      ],
      autosaveEnabled: false,
      plot: { cards: [], connections: [] },
    };
    return storyWithIds;

  } catch (error) {
    console.error("Error importing story from text:", error);
    throw new Error("Falha ao importar e estruturar o livro. Verifique o formato do arquivo e tente novamente.");
  }
};

// --- Schemas for AI Agent Chat ---
const summarizedStoryForAgent = (story: Story): Partial<Story> => {
    // Return a version of the story object that's safe to send to the AI,
    // avoiding excessively large fields.
    return {
        ...story,
        // Omit fields that are too large or irrelevant for the agent's decision making
        chapters: story.chapters.map(({ id, title, summary }) => ({ id, title, summary, content: '' })), // Send summaries only
        versions: [], // Omit huge version history
    };
};

const agentResponseSchema = {
    type: Type.OBJECT,
    properties: {
        conversationalResponse: {
            type: Type.STRING,
            description: "Sua resposta amigável e conversacional para o usuário. Use formatação Markdown e emojis para clareza."
        },
        updatedStory: {
            type: Type.OBJECT,
            nullable: true,
            description: "O objeto da história completo e atualizado se uma edição foi realizada. Caso contrário, nulo.",
            properties: {
                title: { type: Type.STRING },
                genre: { type: Type.STRING },
                synopsis: { type: Type.STRING },
                characters: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            id: { type: Type.STRING },
                            name: { type: Type.STRING },
                            description: { type: Type.STRING },
                            appearance: { type: Type.STRING },
                            role: { type: Type.STRING },
                            avatarUrl: { type: Type.STRING },
                            narrativeArc: { type: Type.STRING },
                            relationships: {
                                type: Type.ARRAY,
                                items: {
                                    type: Type.OBJECT,
                                    properties: {
                                        characterId: { type: Type.STRING },
                                        type: { type: Type.STRING },
                                        description: { type: Type.STRING }
                                    }
                                }
                            }
                        }
                    }
                },
                chapters: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            id: { type: Type.STRING },
                            title: { type: Type.STRING },
                            summary: { type: Type.STRING },
                            content: { type: Type.STRING }
                        }
                    }
                },
                world: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            id: { type: Type.STRING },
                            name: { type: Type.STRING },
                            category: { type: Type.STRING },
                            description: { type: Type.STRING }
                        }
                    }
                }
            }
        }
    },
    required: ["conversationalResponse"]
};


export const chatWithAgent = async (story: Story, conversation: Message[], newMessage: string): Promise<{conversationalResponse: string; updatedStory: Story | null}> => {
    
    const prompt = `
        Você é um agente literário de IA, um parceiro de escrita para um autor. Você é prestativo, encorajador e muito capaz. Seja amigável e expressivo. Use formatação Markdown (listas, negrito, etc.) e emojis apropriados (como ✨, 📚, 🤔) para tornar suas respostas mais claras e engajantes.
        
        Converse com o autor sobre sua história. Se ele pedir para você fazer uma alteração na história (por exemplo, "mude a sinopse", "reescreva o capítulo 2", "torne este personagem mais sombrio"), você deve:
        1. Realizar a alteração solicitada no objeto da história fornecido.
        2. Retornar a estrutura JSON completa da história modificada na chave 'updatedStory'.
        3. Fornecer uma resposta conversacional amigável confirmando a alteração na chave 'conversationalResponse'.
        
        Se o usuário estiver apenas conversando, fazendo uma pergunta ou pedindo uma sugestão sem solicitar uma alteração direta, responda na chave 'conversationalResponse' e omita a chave 'updatedStory' ou a defina como nula.
        
        NUNCA modifique o ID de uma história, personagem ou capítulo. Mantenha os IDs existentes.

        Histórico da Conversa:
        ${conversation.map(turn => `${turn.role}: ${turn.parts}`).join('\n')}

        Nova Mensagem do Usuário:
        ${newMessage}

        Objeto da história atual para referência e modificação:
        ${JSON.stringify(summarizedStoryForAgent(story))}
    `;

    try {
        const response = await ai.models.generateContent({
            model: GEMINI_FLASH_MODEL,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: agentResponseSchema,
            },
        });

        const result = JSON.parse(response.text);
        
        if (result.updatedStory) {
            // Re-integrate the full story data that was summarized
            return {
                ...result,
                updatedStory: {
                    ...story, // Start with the original full story
                    ...result.updatedStory // Overwrite with AI's changes
                }
            };
        }

        return result;

    } catch (error) {
        console.error("Error with AI Agent chat:", error);
        throw new Error("O Agente de IA encontrou um problema. Por favor, tente reformular sua solicitação.");
    }
};

export const generateInspiration = async (type: 'what-if' | 'plot-twist' | 'name' | 'dialogue', context: string): Promise<string> => {
  let prompt = `Aja como um muso da criatividade para um escritor. Gere uma ideia concisa e inspiradora com base no tipo e contexto fornecidos.\n\nContexto da História: ${context}\n\n`;
  switch (type) {
    case 'what-if':
      prompt += 'Tipo de Ideia: Cenário "E se?". Gere uma pergunta intrigante que desafie a premissa da história.';
      break;
    case 'plot-twist':
      prompt += 'Tipo de Ideia: Reviravolta na Trama. Sugira uma reviravolta inesperada que poderia acontecer a seguir.';
      break;
    case 'name':
      prompt += 'Tipo de Ideia: Nomes. Gere 5 nomes (personagens ou lugares) que se encaixem no tom e gênero da história.';
      break;
    case 'dialogue':
      prompt += 'Tipo de Ideia: Diálogo. Escreva um pequeno trecho de diálogo (2-3 trocas) com base na seguinte descrição de cena. Descrição da Cena:';
      break;
  }
  
  try {
    const response = await ai.models.generateContent({
      model: GEMINI_FLASH_MODEL,
      contents: prompt,
    });
    return response.text.trim();
  } catch (error) {
    console.error("Error generating inspiration:", error);
    throw new Error("Falha ao gerar inspiração. Tente novamente.");
  }
};


const worldEntrySchemaForAnalysis = {
    type: Type.ARRAY,
    items: {
        type: Type.OBJECT,
        properties: {
            name: { type: Type.STRING, description: 'O nome do personagem, lugar, item, etc.' },
            category: { type: Type.STRING, description: "A categoria: 'Personagem', 'Lugar', 'Item', 'Organização' ou 'Evento'." },
            description: { type: Type.STRING, description: 'Uma breve descrição de uma frase.' }
        },
        required: ["name", "category", "description"]
    }
};


export const analyzeTextForWorldEntries = async (text: string): Promise<Omit<WorldEntry, 'id'>[]> => {
    const prompt = `
        Aja como um arquivista de mundos. Analise o seguinte texto e identifique substantivos próprios (nomes de pessoas, lugares, organizações, itens específicos, eventos nomeados) que poderiam ser entradas em uma enciclopedias do mundo (lore bible).
        Ignore nomes de personagens já muito comuns e foque em termos únicos do universo.
        Retorne uma lista de sugestões. Se nada for encontrado, retorne uma matriz vazia.

        Texto para analisar:
        ---
        ${stripHtml(text)}
        ---
    `;

    try {
        const response = await ai.models.generateContent({
            model: GEMINI_FLASH_MODEL,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: worldEntrySchemaForAnalysis,
            },
        });
        const results = JSON.parse(response.text);
        // Ensure category is valid
        return results.filter((r: any) => ['Personagem', 'Lugar', 'Item', 'Organização', 'Evento'].includes(r.category));
    } catch (error) {
        console.error("Error analyzing text for world entries:", error);
        throw new Error("Falha ao analisar o texto para entradas do mundo. Tente novamente.");
    }
};

const relationshipsSchema = {
    type: Type.ARRAY,
    description: "Uma lista de relacionamentos sugeridos entre o personagem principal e outros.",
    items: {
        type: Type.OBJECT,
        properties: {
            characterId: { type: Type.STRING, description: "O ID do outro personagem no relacionamento." },
            type: { type: Type.STRING, description: "O tipo de relacionamento (ex: Aliado, Inimigo, Parente, Interesse Amoroso, Mentor)." },
            description: { type: Type.STRING, description: "Uma breve descrição justificando o relacionamento com base no texto." },
        },
        required: ["characterId", "type", "description"]
    }
};

export const suggestCharacterRelationships = async (story: Story, characterId: string): Promise<Relationship[]> => {
    const mainCharacter = story.characters.find(c => c.id === characterId);
    if (!mainCharacter) return [];

    const otherCharacters = story.characters.filter(c => c.id !== characterId);
    const fullText = story.chapters.map(c => stripHtml(c.content)).join("\n\n");

    const prompt = `
        Aja como um analista de personagens. Analise o texto da história fornecida e as interações entre "${mainCharacter.name}" e os outros personagens.
        Sugira relacionamentos significativos entre "${mainCharacter.name}" e os outros personagens listados.
        Baseie suas sugestões em diálogos, ações e subtexto. Se nenhum relacionamento claro for encontrado, retorne uma matriz vazia.
        
        Personagem Principal:
        - ${mainCharacter.name} (ID: ${mainCharacter.id})
        
        Outros Personagens (com IDs):
        ${otherCharacters.map(c => `- ${c.name} (ID: ${c.id})`).join("\n")}
        
        Texto da História:
        ---
        ${fullText}
        ---
    `;

    try {
        const response = await ai.models.generateContent({
            model: GEMINI_FLASH_MODEL,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: relationshipsSchema,
            },
        });
        const results = JSON.parse(response.text);
        // Validate that the returned character IDs exist
        const validCharacterIds = new Set(otherCharacters.map(c => c.id));
        return results.filter((r: Relationship) => validCharacterIds.has(r.characterId));
    } catch (error) {
        console.error("Error suggesting character relationships:", error);
        throw new Error("Falha ao sugerir relacionamentos. Tente novamente.");
    }
};

const plotPointsSchema = {
    type: Type.ARRAY,
    items: {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING, description: 'Um título curto e descritivo para o ponto da trama (máximo 5 palavras).' },
            description: { type: Type.STRING, description: 'Uma descrição detalhada do evento ou cena (2-3 frases).' },
            chapterId: { type: Type.STRING, description: 'O ID do capítulo correspondente.' },
            characterNames: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: 'Uma lista dos nomes dos personagens principais envolvidos neste ponto da trama.'
            }
        },
        required: ["title", "description", "chapterId", "characterNames"]
    }
};

export const suggestPlotPointsFromSummaries = async (story: Story): Promise<Omit<PlotCard, 'id' | 'position'>[]> => {
    const chapterContext = story.chapters.map(c => `- ID do Capítulo: ${c.id}\n- Título: ${c.title}\n- Resumo: ${c.summary}\n`).join('\n');
    const characterContext = story.characters.map(c => `- ID: ${c.id}\n- Nome: ${c.name}`).join('\n');

    const prompt = `
        Aja como um roteirista. Analise os resumos dos capítulos de uma história e divida-os em pontos de trama ou cenas principais.
        Para cada ponto da trama, forneça um título curto, uma descrição detalhada, o ID do capítulo correspondente e os nomes dos personagens envolvidos.
        Retorne os resultados em um array JSON.

        Personagens disponíveis (com IDs):
        ---
        ${characterContext}
        ---

        Capítulos (com IDs e resumos):
        ---
        ${chapterContext}
        ---
    `;

    try {
        const response = await ai.models.generateContent({
            model: GEMINI_FLASH_MODEL,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: plotPointsSchema,
            },
        });
        const results = JSON.parse(response.text);

        const characterNameToIdMap = new Map(story.characters.map(c => [c.name.toLowerCase(), c.id]));

        // Map AI response to PlotCard structure
        return results.map((r: any) => ({
            title: r.title,
            description: r.description,
            chapterId: r.chapterId,
            characterIds: (r.characterNames || [])
                .map((name: string) => characterNameToIdMap.get(name.toLowerCase()))
                .filter(Boolean) as string[],
        }));

    } catch (error) {
        console.error("Error suggesting plot points:", error);
        throw new Error("Falha ao sugerir pontos de trama. Tente novamente.");
    }
};

const pacingAnalysisSchema = {
    type: Type.ARRAY,
    items: {
        type: Type.OBJECT,
        properties: {
          chapterId: { type: Type.STRING, description: 'O ID exato do capítulo fornecido.' },
          chapterTitle: { type: Type.STRING, description: 'O título exato do capítulo fornecido.' },
          tensionScore: { type: Type.NUMBER, description: 'Uma pontuação de tensão de 1 (muito baixo, reflexivo) a 10 (muito alto, clímax de ação).' },
          justification: { type: Type.STRING, description: 'Uma breve justificativa para a pontuação, explicando os fatores considerados.' },
        },
        required: ["chapterId", "chapterTitle", "tensionScore", "justification"],
    },
};

export const analyzePacingAndTension = async (story: Story): Promise<PacingPoint[]> => {
    const chapterContext = story.chapters.map(c => `
---
ID do Capítulo: ${c.id}
Título do Capítulo: ${c.title}
Conteúdo:
${stripHtml(c.content).substring(0, 8000)}
---
    `).join('\n');

    const prompt = `
        Aja como um editor de desenvolvimento experiente. Analise o ritmo e a tensão de cada capítulo da história fornecida. Para cada capítulo, forneça uma pontuação de tensão de 1 (muito baixo, reflexivo) a 10 (muito alto, clímax de ação) e uma breve justificativa para sua pontuação.

        Considere os seguintes fatores para determinar a pontuação de tensão:
        - Comprimento da frase e do parágrafo: Frases curtas e parágrafos aumentam o ritmo.
        - Diálogo vs. Descrição: Cenas com muito diálogo tendem a ser mais rápidas.
        - Verbos de Ação: O uso de verbos fortes e ativos indica maior tensão.
        - Conflito e Risco: Identifique quando os personagens enfrentam perigo, obstáculos ou conflitos interpessoais significativos.

        Retorne os resultados em um array JSON, onde cada objeto corresponde a um capítulo. Certifique-se de que os IDs e títulos dos capítulos correspondam exatamente aos fornecidos.

        Capítulos para analisar:
        ${chapterContext}
    `;

    try {
        const response = await ai.models.generateContent({
            model: GEMINI_FLASH_MODEL,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: pacingAnalysisSchema,
            },
        });
        const results = JSON.parse(response.text) as PacingPoint[];
        // Validate that chapterIds match
        const validChapterIds = new Set(story.chapters.map(c => c.id));
        return results.filter(r => validChapterIds.has(r.chapterId));
    } catch (error) {
        console.error("Error analyzing pacing and tension:", error);
        throw new Error("Falha ao analisar o ritmo da história. Tente novamente.");
    }
};

const characterVoiceDeviationSchema = {
    type: Type.ARRAY,
    items: {
        type: Type.OBJECT,
        properties: {
            chapterId: { type: Type.STRING, description: 'O ID do capítulo onde a inconsistência ocorre.' },
            chapterTitle: { type: Type.STRING, description: 'O título do capítulo onde a inconsistência ocorre.' },
            dialogueSnippet: { type: Type.STRING, description: 'A fala exata que soa inconsistente.' },
            explanation: { type: Type.STRING, description: 'Uma breve explicação de por que a fala é inconsistente com a voz do personagem.' }
        },
        required: ["chapterId", "chapterTitle", "dialogueSnippet", "explanation"]
    }
};


export const analyzeCharacterVoice = async (story: Story, character: Character): Promise<CharacterVoiceDeviation[]> => {
    const prompt = `
        Aja como um editor literário meticuloso, especialista em voz de personagem. Sua tarefa é analisar a consistência da voz de um personagem específico em uma história.

        Personagem para Analisar:
        - Nome: ${character.name}
        - Papel: ${character.role}
        - Descrição: ${character.description}

        Manuscrito Completo (com metadados de capítulo):
        ---
        ${story.chapters.map(c => `[INÍCIO DO CAPÍTULO ID=${c.id} TÍTULO="${c.title}"]\n${stripHtml(c.content)}\n[FIM DO CAPÍTULO TÍTULO="${c.title}"]`).join('\n\n')}
        ---

        Instruções:
        1. **Identificar Diálogo:** Leia todo o manuscrito e identifique todas as falas ditas por "${character.name}". Preste atenção às marcações de diálogo (ex: "ele disse", "ela sussurrou") e ao contexto para atribuir a fala corretamente.
        2. **Construir Perfil de Voz:** Com base no diálogo que você identificou para "${character.name}", crie um perfil de voz consistente. Observe seu vocabulário típico (simples/complexo), comprimento das frases, uso de gírias ou linguagem formal, tom (ex: sarcástico, otimista, cansado) e quaisquer tiques verbais.
        3. **Encontrar Inconsistências:** Reexamine todo o diálogo de "${character.name}". Identifique quaisquer falas que se desviem significativamente do perfil de voz que você estabeleceu.
        4. **Formatar Saída:** Retorne suas descobertas como um array JSON de acordo com o esquema fornecido. Para cada inconsistência, forneça o ID do capítulo, o título do capítulo, a fala exata e uma explicação concisa do porquê ela é inconsistente. Se nenhuma inconsistência for encontrada, retorne um array vazio.
    `;

    try {
        const response = await ai.models.generateContent({
            model: GEMINI_FLASH_MODEL,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: characterVoiceDeviationSchema,
            },
        });
        const results = JSON.parse(response.text);
        const validChapterIds = new Set(story.chapters.map(c => c.id));
        return results.filter((r: CharacterVoiceDeviation) => validChapterIds.has(r.chapterId));
    } catch (error) {
        console.error("Error analyzing character voice:", error);
        throw new Error("Falha ao analisar a voz do personagem. Tente novamente.");
    }
};

export const chatWithCharacter = async (story: Story, character: Character, conversation: Message[], newMessage: string): Promise<string> => {
    const prompt = `
        Você deve interpretar um personagem fictício. Não quebre o personagem. Não se refira a si mesmo como uma IA.

        Você é ${character.name}.
        Sua personalidade e história: ${character.description}
        Seu papel na história: ${character.role}
        A história em que você está é do gênero ${story.genre}, intitulada "${story.title}". Sinopse: ${story.synopsis}

        Para entender sua voz, aqui está o texto completo da história. Preste muita atenção em como você fala, o que você diz e como interage com os outros.
        ---
        ${story.chapters.map(c => stripHtml(c.content)).join('\n\n')}
        ---

        Agora, o autor da sua história está falando com você. Responda a ele *como ${character.name}*.

        Histórico da Conversa:
        ${conversation.map(turn => `${turn.role === 'user' ? 'Autor' : character.name}: ${turn.parts}`).join('\n')}

        Nova Mensagem do Autor:
        ${newMessage}
    `;

    try {
        const response = await ai.models.generateContent({
            model: GEMINI_FLASH_MODEL,
            contents: prompt,
        });
        return response.text.trim();
    } catch (error) {
        console.error("Error with character chat:", error);
        throw new Error("O personagem parece estar perdido em pensamentos. Tente novamente.");
    }
};

const showDontTellSchema = {
    type: Type.ARRAY,
    items: {
        type: Type.OBJECT,
        properties: {
            originalText: { type: Type.STRING, description: 'A frase exata do texto original que está "contando" em vez de "mostrando".' },
            suggestions: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: 'Uma lista de 2-3 alternativas reescritas que "mostram" a emoção ou estado.'
            },
            explanation: { type: Type.STRING, description: 'Uma breve explicação do porquê a frase original é considerada "contada" (telling).' }
        },
        required: ["originalText", "suggestions", "explanation"]
    }
};

export const analyzeShowDontTell = async (text: string): Promise<ShowDontTellSuggestion[]> => {
    const prompt = `
        Aja como um coach de escrita criativa experiente, focado na regra "Mostre, não conte" (Show, don't tell).
        Analise o seguinte texto em busca de frases que "contam" emoções, sentimentos ou qualidades em vez de "mostrá-las" através de ações, diálogos ou detalhes sensoriais.
        Concentre-se em frases como "ela estava triste", "ele sentiu raiva", "a sala era luxuosa".
        Para cada frase "contada" que você identificar, forneça de 2 a 3 alternativas reescritas que "mostram" vividamente a mesma ideia.
        Retorne suas descobertas no formato JSON solicitado. Se nenhum problema for encontrado, retorne uma matriz vazia.

        Texto para analisar:
        ---
        ${stripHtml(text)}
        ---
    `;

    try {
        const response = await ai.models.generateContent({
            model: GEMINI_FLASH_MODEL,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: showDontTellSchema,
            },
        });
        return JSON.parse(response.text);
    } catch (error) {
        console.error("Error analyzing for 'Show, Don't Tell':", error);
        throw new Error("Falha ao analisar o texto em busca de oportunidades de 'Mostrar, não contar'. Tente novamente.");
    }
};

const loreConsistencySchema = {
    type: Type.OBJECT,
    properties: {
        isContradictory: { type: Type.BOOLEAN, description: 'True se a frase contradiz a lore, senão false.' },
        explanation: { type: Type.STRING, description: 'Uma breve explicação da contradição. Nulo se não for contraditório.' }
    },
    required: ["isContradictory", "explanation"]
};

export const checkLoreConsistency = async (sentence: string, entityName: string, entityLore: string): Promise<{ isContradictory: boolean; explanation: string | null }> => {
    const prompt = `
        Aja como um editor de continuidade meticuloso. Sua tarefa é determinar se a "Frase do Manuscrito" contradiz a "Ficha de Lore Oficial" para uma entidade específica.
        Concentre-se APENAS em contradições factuais diretas (ex: cor dos olhos, status de vivo/morto, posse de um item). Se a frase for vaga ou não contiver informações contraditórias, não é uma contradição.

        - Nome da Entidade: "${entityName}"
        - Ficha de Lore Oficial: "${entityLore}"
        - Frase do Manuscrito para Verificar: "${sentence}"

        Responda APENAS com um objeto JSON.
    `;
    
    try {
        const response = await ai.models.generateContent({
            model: GEMINI_FLASH_MODEL,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: loreConsistencySchema,
            },
        });
        const result = JSON.parse(response.text);
        return {
            isContradictory: result.isContradictory,
            explanation: result.explanation || null
        };
    } catch (error) {
        console.error("Error checking lore consistency:", error);
        // Em caso de erro, assuma que não há contradição para evitar falsos positivos
        return { isContradictory: false, explanation: null };
    }
};

export const generateLandingPageIdea = async (prompt: string): Promise<{ title: string; synopsis: string }> => {
  const generationPrompt = `
    Aja como um gerador de ideias de histórias. Com base no prompt do usuário, crie um título cativante e uma sinopse curta (1-2 frases) para uma nova história.
    
    Prompt do Usuário: "${prompt}"

    Retorne o resultado em um objeto JSON com as chaves "title" e "synopsis".
  `;
  
  const schema = {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING, description: "Um título criativo e cativante para a história." },
        synopsis: { type: Type.STRING, description: "Uma sinopse curta (1-2 frases) da história." }
      },
      required: ["title", "synopsis"]
  };

  try {
    const response = await ai.models.generateContent({
      model: GEMINI_FLASH_MODEL,
      contents: generationPrompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
      },
    });
    return JSON.parse(response.text);
  } catch (error) {
    console.error("Error generating landing page idea:", error);
    throw new Error("Falha ao gerar a ideia. Tente novamente.");
  }
};

export const generateStoryIdeas = async (genre: string): Promise<{ themes: string[]; startingPoints: string[] }> => {
  const prompt = `
    Aja como um gerador de ideias para histórias. Com base no gênero literário fornecido, crie uma lista de temas principais e uma lista de pontos de partida para uma nova história.
    
    Gênero: "${genre}"

    Retorne o resultado EXATAMENTE neste formato JSON:
    {
      "themes": ["tema1", "tema2", "tema3", "tema4"],
      "startingPoints": ["ponto1", "ponto2", "ponto3", "ponto4"]
    }
    
    Importante: 
    - themes deve conter 3 a 4 temas principais cativantes para uma história neste gênero
    - startingPoints deve conter 3 a 4 pontos de partida ou ideias de cena de abertura
    - Retorne APENAS o JSON, sem explicações adicionais
  `;

  try {
    const response = await callAI(prompt, { genre }, GEMINI_FLASH_MODEL);
    
    // Se response já é um objeto, retorna direto
    if (typeof response === 'object' && response.themes && response.startingPoints) {
      return response;
    }
    
    // Caso contrário, tenta fazer o parse
    if (typeof response === 'string') {
      return JSON.parse(response);
    }
    
    throw new Error('Formato de resposta inválido');
  } catch (error) {
    console.error("Error generating story ideas:", error);
    throw new Error("Falha ao gerar ideias. Tente novamente.");
  }
};

export const generateWeeklyChallengePrompt = async (): Promise<string> => {
  const prompt = `
    Aja como um mestre de escrita criativa. Gere um único prompt de escrita desafiador e inspirador para um fórum de escritores.
    O prompt deve ser aberto, instigante e aplicável a vários gêneros.
    Deve ser uma única frase ou pergunta.

    Exemplos de bons prompts:
    - "Escreva uma cena que começa com la frase 'O mapa estava errado'."
    - "Descreva um personagem encontrando um objeto que não deveria existir."
    - "Um vilão percebe que está do lado errado da história. Escreva seu monólogo interior."

    Retorne APENAS o texto do prompt.
  `;
  try {
    const response = await ai.models.generateContent({
      model: GEMINI_FLASH_MODEL,
      contents: prompt,
    });
    return response.text.trim();
  } catch (error) {
    console.error("Error generating weekly challenge:", error);
    throw new Error("Falha ao gerar o desafio da semana. Tente novamente.");
  }
};

export const getAIFollowUp = async (articleContent: string, question: string): Promise<string> => {
    const prompt = `
        Aja como um mentor de escrita experiente e amigável. Um autor acabou de ler um artigo sobre escrita e tem uma pergunta de acompanhamento.
        Sua tarefa é fornecer uma resposta útil, concisa e encorajadora com base no CONTEÚDO DO ARTIGO e na PERGUNTA DO AUTOR.

        CONTEÚDO DO ARTIGO (use como sua base de conhecimento principal):
        ---
        ${stripHtml(articleContent)}
        ---

        PERGUNTA DO AUTOR:
        ---
        "${question}"
        ---

        INSTRUÇÕES:
        - Baseie sua resposta diretamente no conteúdo do artigo.
        - Mantenha a resposta focada, útil e com um tom de mentor.
        - Se a pergunta não puder ser respondida com o artigo, explique isso educadamente e ofereça um conselho geral relacionado ao tópico.
        - Retorne apenas o texto da sua resposta.
    `;
    try {
        const response = await ai.models.generateContent({
            model: GEMINI_FLASH_MODEL,
            contents: prompt,
        });
        return response.text.trim();
    } catch (error) {
        console.error("Error getting AI follow-up:", error);
        throw new Error("O Mentor de IA está ocupado no momento. Tente novamente em alguns instantes.");
    }
};

const showDontTellAlternativesSchema = {
    type: Type.ARRAY,
    description: 'Uma lista de 2-3 alternativas reescritas que "mostram" a emoção ou estado, em vez de "contar".',
    items: { type: Type.STRING }
};

export const generateShowDontTellAlternatives = async (tellingSentence: string): Promise<string[]> => {
    const prompt = `
        Aja como um coach de escrita criativa. A seguinte frase "conta" uma emoção ou estado: "${tellingSentence}".
        Reescreva esta frase de 2 a 3 maneiras diferentes que "mostram" a mesma ideia através de ações, diálogos ou detalhes sensoriais.
        Retorne suas sugestões em um array JSON.

        Exemplo:
        Frase: "Ele estava com medo."
        Resultado: ["Seu coração martelava contra as costelas como um tambor de guerra.", "Ele recuou, com os olhos arregalados, um suor frio brotando em sua testa.", "Cada sombra no canto da sala parecia se contorcer, e ele não conseguia parar de tremer."]
    `;
    try {
        const response = await ai.models.generateContent({
            model: GEMINI_FLASH_MODEL,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: showDontTellAlternativesSchema,
            },
        });
        return JSON.parse(response.text);
    } catch (error) {
        console.error("Error generating 'Show, Don't Tell' alternatives:", error);
        throw new Error("Falha ao gerar alternativas. Tente novamente.");
    }
};