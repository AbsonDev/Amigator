// Application Constants
export const APP_CONFIG = {
  name: import.meta.env.VITE_APP_NAME || 'Simulador de Escritor IA',
  version: import.meta.env.VITE_APP_VERSION || '1.0.0',
  autosave: {
    enabled: import.meta.env.VITE_ENABLE_AUTOSAVE !== 'false',
    delayMs: parseInt(import.meta.env.VITE_AUTOSAVE_DELAY_MS || '5000', 10)
  },
  storage: {
    keys: {
      AUTHOR_PROFILE: 'author-profile',
      STORIES_DATA: 'stories-data',
      HAS_VISITED: 'has-visited-writer-app'
    }
  },
  limits: {
    MAX_CHAPTER_LENGTH: 50000,
    MAX_CHARACTERS: 20,
    MAX_CHAPTERS: 100,
    MAX_WORLD_ENTRIES: 200,
    MAX_VERSIONS: 50
  },
  ui: {
    debounceDelay: 1000,
    animationDuration: 300
  }
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  API_KEY_MISSING: 'API Key não configurada. Por favor, configure a variável GEMINI_API_KEY.',
  STORY_GENERATION_FAILED: 'Falha ao gerar a história. Por favor, tente novamente.',
  IMPORT_FAILED: 'Falha ao importar o arquivo. Verifique o formato e tente novamente.',
  SAVE_FAILED: 'Falha ao salvar. Por favor, tente novamente.',
  NETWORK_ERROR: 'Erro de conexão. Verifique sua internet e tente novamente.',
  VALIDATION_ERROR: 'Por favor, preencha todos os campos obrigatórios.',
  GENERIC_ERROR: 'Ocorreu um erro inesperado. Por favor, tente novamente.'
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  STORY_CREATED: 'História criada com sucesso!',
  CHAPTER_SAVED: 'Capítulo salvo com sucesso!',
  CHARACTER_UPDATED: 'Personagem atualizado com sucesso!',
  EXPORT_SUCCESS: 'História exportada com sucesso!',
  IMPORT_SUCCESS: 'História importada com sucesso!'
} as const;