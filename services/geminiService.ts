import { GoogleGenAI, Type } from "@google/genai";
import type { Story, Chapter, Character, BetaReaderFeedback, ScriptIssue, GrammarSuggestion, RepetitionIssue, Message } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const storySchema = {
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
          id: { type: Type.STRING, description: "O ID único do personagem, que não deve ser alterado." },
          name: {
            type: Type.STRING,
            description: "Nome completo do personagem."
          },
          description: {
            type: Type.STRING,
            description: "Uma breve descrição da aparência, personalidade e motivações do personagem."
          },
          role: {
            type: Type.STRING,
            description: "O papel do personagem na história (ex: Protagonista, Antagonista, Mentor, Alívio Cômico)."
          },
          avatarUrl: { type: Type.STRING, description: "O URL do avatar do personagem, que não deve ser alterado." },
        },
        required: ["id", "name", "description", "role", "avatarUrl"]
      }
    },
    chapters: {
      type: Type.ARRAY,
      description: "Uma lista de 5 a 10 capítulos iniciais que estruturam a história.",
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING, description: "O ID único do capítulo, que não deve ser alterado." },
          title: {
            type: Type.STRING,
            description: "O título do capítulo."
          },
          summary: {
            type: Type.STRING,
            description: "Um resumo de uma frase dos principais eventos do capítulo."
          },
          content: { type: Type.STRING, description: "O conteúdo completo do capítulo." }
        },
        required: ["id", "title", "summary", "content"]
      }
    }
  },
  required: ["title", "synopsis", "characters", "chapters"]
};

const initialAnalysisState = {
    scriptIssues: { results: [], ignored: [], lastAnalyzed: null },
    repetitions: { results: [], ignored: [], lastAnalyzed: null },
};

export const generateStoryStructure = async (genre: string, theme: string, userPrompt: string): Promise<Story> => {
  const prompt = `
    Gere uma estrutura de história completa em Português com base nos seguintes parâmetros.
    Gênero: ${genre}
    Tema: ${theme}
    Prompt do Usuário: ${userPrompt}

    Crie um título, uma sinopse, uma lista de personagens e um esboço de capítulos.
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
              description: { type: Type.STRING, description: "Uma breve descrição da aparência, personalidade e motivações do personagem." },
              role: { type: Type.STRING, description: "O papel do personagem na história (ex: Protagonista, Antagonista, Mentor, Alívio Cômico)." },
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
              title: { type: Type.STRING, description: "O título do capítulo." },
              summary: { type: Type.STRING, description: "Um resumo de uma frase dos principais eventos do capítulo." },
            },
            required: ["title", "summary"]
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

    const storyData = JSON.parse(response.text);
    
    // Augment data with IDs and placeholders
    const storyWithIds: Story = {
      id: `story-${Date.now()}`,
      ...storyData,
      characters: storyData.characters.map((char: Omit<Character, 'id' | 'avatarUrl'>, index: number) => ({
        ...char,
        id: `char-${Date.now()}-${index}`,
        avatarUrl: `https://picsum.photos/seed/${char.name.replace(/\s/g, '')}/200`
      })),
      chapters: storyData.chapters.map((chap: Omit<Chapter, 'id' | 'content'>, index: number) => ({
        ...chap,
        id: `chap-${Date.now()}-${index}`,
        content: `Este é o início do capítulo "${chap.title}".\n\n${chap.summary}\n\nContinue a escrever a partir daqui...`
      })),
      analysis: initialAnalysisState,
      chatHistory: [],
    };

    return storyWithIds;

  } catch (error) {
    console.error("Error generating story structure:", error);
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
    console.error("Error continuing writing:", error);
    throw new Error("Falha ao continuar a escrita. Tente novamente.");
  }
};

export const modifyText = async (text: string, context: string, instruction: string): Promise<string> => {
  const prompt = `Você é um editor de texto habilidoso. Siga esta instrução para modificar o trecho de texto fornecido: "${instruction}"

Contexto completo do capítulo (para referência de tom e estilo):
---
${context}
---

Trecho de texto a ser modificado:
---
${text}
---

Retorne apenas o texto modificado, sem comentários ou formatação extra.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
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
${chapterContent}
---
`;
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
            model: "gemini-2.5-flash",
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
        ${text}
        ---
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
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
    const fullText = story.chapters.map(c => `--- Início do Capítulo: ${c.title} ---\n${c.content}`).join('\n\n');
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
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: repetitionSchema,
            },
        });
        return JSON.parse(response.text);
    } catch (error) {
        console.error("Error analyzing repetitions:", error);
        throw new Error("Falha ao analisar repetições. Tente novamente.");
    }
};


export const importStoryFromText = async (textContent: string): Promise<Story> => {
  const importedStorySchema = {
    type: Type.OBJECT,
    properties: {
        title: { type: Type.STRING, description: "O título do livro, extraído do texto." },
        synopsis: { type: Type.STRING, description: "Uma sinopse curta (2-3 frases) gerada com base no conteúdo geral do texto." },
        characters: {
            type: Type.ARRAY,
            description: "Uma lista dos personagens principais identificados no texto.",
            items: {
                type: Type.OBJECT,
                properties: {
                    name: { type: Type.STRING, description: "Nome completo do personagem." },
                    description: { type: Type.STRING, description: "Uma breve descrição do personagem com base em suas ações e diálogos no texto." },
                    role: { type: Type.STRING, description: "O papel do personagem na história (ex: Protagonista, Antagonista)." }
                },
                required: ["name", "description", "role"]
            }
        },
        chapters: {
            type: Type.ARRAY,
            description: "Uma lista de todos os capítulos encontrados no texto.",
            items: {
                type: Type.OBJECT,
                properties: {
                    title: { type: Type.STRING, description: "O título do capítulo, extraído do texto." },
                    content: { 
                      type: Type.STRING, 
                      description: "O conteúdo completo do capítulo. É crucial que esta string seja um JSON válido, com todos os caracteres especiais (como aspas duplas) devidamente escapados. Se o texto for muito longo, ele pode ser truncado, mas a string JSON deve ser terminada corretamente." 
                    }
                },
                required: ["title", "content"]
            }
        }
    },
    required: ["title", "synopsis", "characters", "chapters"]
  };
    
  const prompt = `
    Aja como um estruturalista literário. Analise o seguinte manuscrito completo. Sua tarefa é extrair a estrutura da história e retorná-la em um único objeto JSON válido, sem nenhum texto extra ou markdown. É CRÍTICO que todas as strings no JSON (especialmente o conteúdo dos capítulos) sejam devidamente escapadas e terminadas para formar um JSON sintaticamente perfeito.

    1.  **Título**: Identifique o título da obra. Se não houver um título explícito, crie um apropriado com base no conteúdo.
    2.  **Sinopse**: Leia o texto inteiro e gere uma sinopse concisa de 2-3 frases.
    3.  **Personagens**: Identifique de 3 a 5 personagens principais. Para cada um, forneça seu nome, uma breve descrição com base em suas ações e diálogos, e seu papel na história (ex: Protagonista).
    4.  **Capítulos**: Divida o texto em capítulos. Procure por indicadores de capítulo como "Capítulo 1", "CAPÍTULO UM", um título de linha única seguido por uma quebra de linha dupla, ou outras pistas estruturais. Cada item de capítulo no JSON deve conter o título do capítulo e seu conteúdo completo.

    Manuscrito para analisar:
    ---
    ${textContent}
    ---
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: importedStorySchema,
      },
    });

    let jsonString = response.text;

    // Clean up potential markdown code blocks, which can be returned by the model
    const jsonMatch = jsonString.match(/^\s*```(?:json)?\s*([\s\S]*?)\s*```\s*$/);
    if (jsonMatch && jsonMatch[1]) {
        jsonString = jsonMatch[1];
    }
    jsonString = jsonString.trim();

    const storyData = JSON.parse(jsonString);

    const storyWithIds: Story = {
      id: `story-${Date.now()}`,
      title: storyData.title,
      synopsis: storyData.synopsis,
      characters: storyData.characters.map((char: Omit<Character, 'id' | 'avatarUrl'>, index: number) => ({
        ...char,
        id: `char-${Date.now()}-${index}`,
        avatarUrl: `https://picsum.photos/seed/${char.name.replace(/\s/g, '')}/200`
      })),
      chapters: storyData.chapters.map((chap: {title: string, content: string}, index: number) => ({
        ...chap,
        id: `chap-${Date.now()}-${index}`,
        summary: chap.content.substring(0, 150).replace(/\n/g, ' ').trim() + '...'
      })),
      analysis: initialAnalysisState,
      chatHistory: [],
    };
    return storyWithIds;

  } catch (error) {
    console.error("Error importing story from text:", error);
    throw new Error("Falha ao importar e estruturar o livro. Verifique o formato do arquivo e tente novamente.");
  }
};


const agentResponseSchema = {
    type: Type.OBJECT,
    properties: {
        conversationalResponse: { 
            type: Type.STRING, 
            description: "Sua resposta amigável e conversacional para o usuário." 
        },
        updatedStory: {
            ...storySchema,
            nullable: true,
            description: "O objeto da história completo e atualizado se uma edição foi realizada. Caso contrário, nulo.",
            properties: {
              id: { type: Type.STRING },
              ...storySchema.properties,
              analysis: { type: Type.OBJECT, properties: {}, description: "A estrutura de análise da história." },
              chatHistory: { type: Type.ARRAY, items: { type: Type.OBJECT }, description: "O histórico do chat." },
            }
        }
    },
    required: ["conversationalResponse"]
};


export const chatWithAgent = async (story: Story, conversation: Message[], newMessage: string): Promise<{conversationalResponse: string; updatedStory: Story | null}> => {
    
    const prompt = `
        Você é um agente literário de IA, um parceiro de escrita para um autor. Você é prestativo, encorajador e muito capaz.
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
        ${JSON.stringify(story)}
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: agentResponseSchema,
            },
        });

        const result = JSON.parse(response.text);
        
        if (result.updatedStory && (!result.updatedStory.id || !result.updatedStory.chapters)) {
             console.warn("Agent returned an invalid story object. Discarding update.", result.updatedStory);
             result.updatedStory = null;
        }

        return result;

    } catch (error) {
        console.error("Error with AI Agent chat:", error);
        throw new Error("O Agente de IA encontrou um problema. Por favor, tente reformular sua solicitação.");
    }
};