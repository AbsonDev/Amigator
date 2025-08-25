// Validation utilities for form inputs and data

export const ValidationRules = {
  authorName: {
    minLength: 2,
    maxLength: 50,
    pattern: /^[a-zA-ZÀ-ÿ\s'-]+$/,
    message: 'Nome deve ter entre 2 e 50 caracteres e conter apenas letras'
  },
  storyTitle: {
    minLength: 1,
    maxLength: 200,
    message: 'Título deve ter entre 1 e 200 caracteres'
  },
  chapterTitle: {
    minLength: 1,
    maxLength: 100,
    message: 'Título do capítulo deve ter entre 1 e 100 caracteres'
  },
  chapterContent: {
    minLength: 10,
    maxLength: 50000,
    message: 'Conteúdo do capítulo deve ter entre 10 e 50.000 caracteres'
  },
  characterName: {
    minLength: 1,
    maxLength: 100,
    message: 'Nome do personagem deve ter entre 1 e 100 caracteres'
  },
  description: {
    minLength: 10,
    maxLength: 1000,
    message: 'Descrição deve ter entre 10 e 1.000 caracteres'
  }
};

export const validateAuthorName = (name: string): { isValid: boolean; error?: string } => {
  const trimmed = name.trim();
  
  if (trimmed.length < ValidationRules.authorName.minLength) {
    return { isValid: false, error: `Nome muito curto (mínimo ${ValidationRules.authorName.minLength} caracteres)` };
  }
  
  if (trimmed.length > ValidationRules.authorName.maxLength) {
    return { isValid: false, error: `Nome muito longo (máximo ${ValidationRules.authorName.maxLength} caracteres)` };
  }
  
  if (!ValidationRules.authorName.pattern.test(trimmed)) {
    return { isValid: false, error: 'Nome contém caracteres inválidos' };
  }
  
  return { isValid: true };
};

export const validateStoryTitle = (title: string): { isValid: boolean; error?: string } => {
  const trimmed = title.trim();
  
  if (trimmed.length < ValidationRules.storyTitle.minLength) {
    return { isValid: false, error: 'Título não pode estar vazio' };
  }
  
  if (trimmed.length > ValidationRules.storyTitle.maxLength) {
    return { isValid: false, error: `Título muito longo (máximo ${ValidationRules.storyTitle.maxLength} caracteres)` };
  }
  
  return { isValid: true };
};

export const validateChapterContent = (content: string): { isValid: boolean; error?: string } => {
  if (content.length < ValidationRules.chapterContent.minLength) {
    return { isValid: false, error: `Conteúdo muito curto (mínimo ${ValidationRules.chapterContent.minLength} caracteres)` };
  }
  
  if (content.length > ValidationRules.chapterContent.maxLength) {
    return { isValid: false, error: `Conteúdo muito longo (máximo ${ValidationRules.chapterContent.maxLength} caracteres)` };
  }
  
  return { isValid: true };
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const sanitizeInput = (input: string): string => {
  return input
    .trim()
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<[^>]+>/g, '');
};

export const validateFileType = (file: File, allowedTypes: string[]): boolean => {
  const fileExtension = file.name.split('.').pop()?.toLowerCase() || '';
  return allowedTypes.includes(fileExtension);
};

export const validateFileSize = (file: File, maxSizeMB: number): boolean => {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  return file.size <= maxSizeBytes;
};