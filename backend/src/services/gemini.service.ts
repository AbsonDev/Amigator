import { GoogleGenerativeAI } from '@google/generative-ai';
import { logger } from '../utils/logger';
import { AppError } from '../middleware/errorHandler';

/**
 * Service to interact with Google Gemini AI
 * This is a secure proxy that keeps the API key on the server
 */
export class GeminiService {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY not configured');
    }

    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  }

  /**
   * Generate story structure
   */
  async generateStoryStructure(genre: string, theme: string, prompt: string, authorId: string) {
    try {
      const fullPrompt = `
        Crie uma estrutura completa de história com os seguintes parâmetros:
        Gênero: ${genre}
        Tema: ${theme}
        Prompt do usuário: ${prompt}
        
        Retorne um JSON com a seguinte estrutura:
        {
          "title": "título da história",
          "synopsis": "sinopse detalhada",
          "chapters": [
            {
              "id": "chapter_1",
              "title": "título do capítulo",
              "summary": "resumo do capítulo"
            }
          ],
          "characters": [
            {
              "id": "char_1",
              "name": "nome do personagem",
              "role": "papel na história",
              "description": "descrição detalhada",
              "appearance": "aparência física"
            }
          ]
        }
      `;

      const result = await this.model.generateContent(fullPrompt);
      const response = await result.response;
      const text = response.text();
      
      // Parse JSON from response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new AppError('Failed to parse AI response', 500);
      }

      const storyData = JSON.parse(jsonMatch[0]);
      
      // Add metadata
      return {
        ...storyData,
        id: `story_${Date.now()}`,
        authorId,
        genre,
        isPublished: false,
        createdAt: new Date(),
        updatedAt: new Date()
      };
    } catch (error) {
      logger.error('Error generating story structure:', error);
      throw new AppError('Failed to generate story structure', 500);
    }
  }

  /**
   * Generate chapter content
   */
  async generateChapter(storyContext: any, chapterPrompt: string, previousChapters?: any[]) {
    try {
      const prompt = `
        Contexto da história: ${JSON.stringify(storyContext)}
        Capítulos anteriores: ${previousChapters ? JSON.stringify(previousChapters) : 'Nenhum'}
        
        Escreva o conteúdo completo para: ${chapterPrompt}
        
        O capítulo deve ter entre 1500-2500 palavras.
        Mantenha consistência com o tom, estilo e personagens estabelecidos.
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      
      return {
        content: response.text(),
        wordCount: response.text().split(/\s+/).length
      };
    } catch (error) {
      logger.error('Error generating chapter:', error);
      throw new AppError('Failed to generate chapter', 500);
    }
  }

  /**
   * Generate character
   */
  async generateCharacter(storyContext: any, characterRole: string, characterTraits?: string) {
    try {
      const prompt = `
        Contexto da história: ${JSON.stringify(storyContext)}
        Papel do personagem: ${characterRole}
        Traços desejados: ${characterTraits || 'Livre escolha'}
        
        Crie um personagem completo com nome, descrição de personalidade, 
        aparência física, motivações e história de fundo.
        
        Retorne em formato JSON.
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new AppError('Failed to parse character data', 500);
      }

      return JSON.parse(jsonMatch[0]);
    } catch (error) {
      logger.error('Error generating character:', error);
      throw new AppError('Failed to generate character', 500);
    }
  }

  /**
   * Generate character dialogue
   */
  async generateCharacterDialogue(story: any, character: any, recentContext: string) {
    try {
      const prompt = `
        História: ${story.synopsis}
        Personagem: ${character.name} - ${character.description}
        Contexto recente: ${recentContext}
        
        Escreva UMA linha de diálogo que este personagem diria neste momento.
        A fala deve ser consistente com a personalidade do personagem.
        Retorne APENAS o diálogo, sem aspas ou atribuições.
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      
      return response.text().trim();
    } catch (error) {
      logger.error('Error generating dialogue:', error);
      throw new AppError('Failed to generate dialogue', 500);
    }
  }

  /**
   * Generate book cover (mock - real implementation would use image generation API)
   */
  async generateBookCover(prompt: string, style: string) {
    try {
      // Note: Google's Imagen API requires separate setup
      // This is a placeholder that returns a generated prompt for an image
      logger.info(`Cover generation requested: ${prompt} in ${style} style`);
      
      // In production, integrate with actual image generation API
      return `data:image/svg+xml;base64,${Buffer.from(`
        <svg width="400" height="600" xmlns="http://www.w3.org/2000/svg">
          <rect width="400" height="600" fill="#8a4fff"/>
          <text x="200" y="300" text-anchor="middle" fill="white" font-size="24">
            Generated Cover
          </text>
          <text x="200" y="330" text-anchor="middle" fill="white" font-size="16">
            ${prompt.substring(0, 30)}...
          </text>
        </svg>
      `).toString('base64')}`;
    } catch (error) {
      logger.error('Error generating cover:', error);
      throw new AppError('Failed to generate cover', 500);
    }
  }

  /**
   * Analyze script issues
   */
  async analyzeScriptIssues(story: any) {
    try {
      const prompt = `
        Analise a seguinte história e identifique problemas de roteiro:
        ${JSON.stringify(story)}
        
        Identifique:
        - Inconsistências na trama
        - Buracos no enredo
        - Problemas de ritmo
        - Desenvolvimento de personagens
        
        Retorne em formato JSON com sugestões de melhoria.
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      const jsonMatch = text.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
      if (!jsonMatch) {
        return { issues: [], suggestions: [] };
      }

      return JSON.parse(jsonMatch[0]);
    } catch (error) {
      logger.error('Error analyzing script:', error);
      throw new AppError('Failed to analyze script', 500);
    }
  }

  /**
   * Detect repetitions
   */
  async detectRepetitions(chapters: any[]) {
    try {
      const prompt = `
        Analise os seguintes capítulos e identifique repetições de:
        - Frases
        - Expressões
        - Estruturas narrativas
        
        Capítulos: ${JSON.stringify(chapters)}
        
        Retorne uma lista de repetições encontradas em formato JSON.
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      const jsonMatch = text.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
      if (!jsonMatch) {
        return [];
      }

      return JSON.parse(jsonMatch[0]);
    } catch (error) {
      logger.error('Error detecting repetitions:', error);
      throw new AppError('Failed to detect repetitions', 500);
    }
  }

  /**
   * Analyze pacing
   */
  async analyzePacing(story: any) {
    try {
      const prompt = `
        Analise o ritmo narrativo da história:
        ${JSON.stringify(story)}
        
        Avalie:
        - Tensão narrativa por capítulo (1-10)
        - Momentos de clímax
        - Áreas que precisam de mais desenvolvimento
        - Áreas que estão muito lentas
        
        Retorne análise em formato JSON.
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      const jsonMatch = text.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
      if (!jsonMatch) {
        return { chapters: [], suggestions: [] };
      }

      return JSON.parse(jsonMatch[0]);
    } catch (error) {
      logger.error('Error analyzing pacing:', error);
      throw new AppError('Failed to analyze pacing', 500);
    }
  }

  /**
   * Analyze character voice consistency
   */
  async analyzeCharacterVoice(story: any, characterId: string) {
    try {
      const character = story.characters.find((c: any) => c.id === characterId);
      if (!character) {
        throw new AppError('Character not found', 404);
      }

      const prompt = `
        Personagem: ${JSON.stringify(character)}
        Capítulos: ${JSON.stringify(story.chapters)}
        
        Analise a consistência da voz e comportamento deste personagem.
        Identifique momentos onde o personagem age fora do esperado.
        
        Retorne análise em formato JSON.
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      const jsonMatch = text.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
      if (!jsonMatch) {
        return { consistent: true, issues: [] };
      }

      return JSON.parse(jsonMatch[0]);
    } catch (error) {
      logger.error('Error analyzing character voice:', error);
      throw new AppError('Failed to analyze character voice', 500);
    }
  }

  /**
   * Format text with AI
   */
  async formatTextWithAI(text: string) {
    try {
      const prompt = `
        Formate o seguinte texto para um manuscrito profissional:
        ${text}
        
        Adicione:
        - Parágrafos apropriados
        - Formatação de diálogos
        - Ênfase onde necessário
        
        Retorne o texto formatado em HTML simples.
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      
      return response.text();
    } catch (error) {
      logger.error('Error formatting text:', error);
      throw new AppError('Failed to format text', 500);
    }
  }

  /**
   * General chat
   */
  async chat(prompt: string, context?: any, model: string = 'gemini-flash') {
    try {
      const fullPrompt = context 
        ? `Contexto: ${JSON.stringify(context)}\n\nPergunta: ${prompt}`
        : prompt;

      const result = await this.model.generateContent(fullPrompt);
      const response = await result.response;
      
      return response.text();
    } catch (error) {
      logger.error('Error in chat:', error);
      throw new AppError('Failed to generate response', 500);
    }
  }
}