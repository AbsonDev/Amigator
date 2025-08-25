import { GoogleGenAI } from "@google/genai";
import type { Story } from '../types';
import type { BookCover, CoverTemplate, CoverGenerationOptions, MockupOptions } from '../types/bookCover';

const API_KEY = process.env.API_KEY || process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({ apiKey: API_KEY! });

// Predefined cover templates
export const coverTemplates: CoverTemplate[] = [
  { id: 'fantasy-1', name: 'Epic Fantasy', category: 'fantasy', style: 'illustrated' },
  { id: 'fantasy-2', name: 'Dark Fantasy', category: 'fantasy', style: 'photographic' },
  { id: 'scifi-1', name: 'Space Opera', category: 'scifi', style: 'abstract' },
  { id: 'scifi-2', name: 'Cyberpunk', category: 'scifi', style: 'modern' },
  { id: 'romance-1', name: 'Contemporary Romance', category: 'romance', style: 'photographic' },
  { id: 'romance-2', name: 'Historical Romance', category: 'romance', style: 'vintage' },
  { id: 'thriller-1', name: 'Psychological Thriller', category: 'thriller', style: 'minimalist' },
  { id: 'thriller-2', name: 'Action Thriller', category: 'thriller', style: 'photographic' },
  { id: 'literary-1', name: 'Literary Fiction', category: 'literary', style: 'minimalist' },
  { id: 'literary-2', name: 'Classic Literature', category: 'literary', style: 'vintage' },
  { id: 'children-1', name: 'Picture Book', category: 'children', style: 'illustrated' },
  { id: 'children-2', name: 'Middle Grade', category: 'children', style: 'modern' }
];

// Generate book cover image using AI
export const generateCoverImage = async (story: Story, options: CoverGenerationOptions): Promise<string> => {
  const prompt = `
    Create a book cover image for a ${options.genre} novel.
    Title: "${story.title}"
    Theme: ${options.theme}
    Mood: ${options.mood}
    Style: ${options.style}
    
    Synopsis for context: ${story.synopsis}
    
    Visual elements to include: ${options.elements.join(', ')}
    Color scheme: ${options.colorScheme || 'complementary'}
    
    The image should be striking, professional, and suitable for a book cover.
    Focus on visual storytelling that captures the essence of the story.
    No text should be included in the image.
  `;

  try {
    const response = await ai.models.generateImages({
      model: 'imagen-3.0-generate-002',
      prompt: prompt,
      config: {
        numberOfImages: 1,
        outputMimeType: 'image/png',
        aspectRatio: '3:4', // Standard book cover ratio
      },
    });

    const base64ImageBytes = response.generatedImages[0].image.imageBytes;
    return `data:image/png;base64,${base64ImageBytes}`;
  } catch (error) {
    console.error("Error generating cover image:", error);
    // Return a fallback gradient image
    return generateFallbackCover(story.title, options);
  }
};

// Generate a fallback cover using CSS gradients
const generateFallbackCover = (title: string, options: CoverGenerationOptions): string => {
  const colors = getColorScheme(options.mood, options.colorScheme);
  
  // Create an SVG with gradient
  const svg = `
    <svg width="600" height="800" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${colors[0]};stop-opacity:1" />
          <stop offset="100%" style="stop-color:${colors[1]};stop-opacity:1" />
        </linearGradient>
        <pattern id="pattern" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
          <circle cx="50" cy="50" r="2" fill="${colors[2]}" opacity="0.3"/>
        </pattern>
      </defs>
      <rect width="600" height="800" fill="url(#grad1)"/>
      <rect width="600" height="800" fill="url(#pattern)"/>
    </svg>
  `;
  
  return `data:image/svg+xml;base64,${btoa(svg)}`;
};

// Get color scheme based on mood and preference
const getColorScheme = (mood: string, scheme?: string): string[] => {
  const schemes: Record<string, string[]> = {
    dark: ['#1a1a2e', '#16213e', '#0f3460'],
    light: ['#f7f7f7', '#e8e8e8', '#d0d0d0'],
    vibrant: ['#ff006e', '#8338ec', '#3a86ff'],
    muted: ['#6c757d', '#495057', '#343a40'],
    dramatic: ['#c9184a', '#590d22', '#800f2f']
  };
  
  return schemes[mood] || schemes.vibrant;
};

// Create complete book cover with text overlay
export const createBookCover = async (
  story: Story,
  authorName: string,
  template: CoverTemplate,
  backgroundImage: string
): Promise<BookCover> => {
  const cover: BookCover = {
    id: `cover-${Date.now()}`,
    storyId: story.id,
    title: story.title,
    subtitle: story.genre,
    author: authorName,
    backgroundImage,
    template,
    colors: {
      primary: '#ffffff',
      secondary: '#f0f0f0',
      accent: '#8a4fff',
      text: '#ffffff',
      background: '#000000'
    },
    fonts: {
      title: {
        family: getFont(template.category, 'title'),
        size: 72,
        weight: 'bold',
        style: 'normal',
        textTransform: 'uppercase'
      },
      subtitle: {
        family: getFont(template.category, 'subtitle'),
        size: 24,
        weight: 'normal',
        style: 'italic'
      },
      author: {
        family: getFont(template.category, 'author'),
        size: 36,
        weight: 'normal',
        style: 'normal'
      }
    },
    layout: {
      titlePosition: { x: 50, y: 20, align: 'center', verticalAlign: 'top' },
      subtitlePosition: { x: 50, y: 35, align: 'center', verticalAlign: 'top' },
      authorPosition: { x: 50, y: 85, align: 'center', verticalAlign: 'bottom' },
      imagePosition: { x: 0, y: 0, align: 'left', verticalAlign: 'top' },
      imageOpacity: 1,
      imageBlur: 0,
      overlay: true,
      overlayOpacity: 0.3
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  return cover;
};

// Get appropriate font based on genre
const getFont = (category: string, element: string): string => {
  const fonts: Record<string, Record<string, string>> = {
    fantasy: {
      title: 'Cinzel, serif',
      subtitle: 'Crimson Text, serif',
      author: 'Lora, serif'
    },
    scifi: {
      title: 'Orbitron, sans-serif',
      subtitle: 'Exo 2, sans-serif',
      author: 'Roboto, sans-serif'
    },
    romance: {
      title: 'Playfair Display, serif',
      subtitle: 'Dancing Script, cursive',
      author: 'Merriweather, serif'
    },
    thriller: {
      title: 'Oswald, sans-serif',
      subtitle: 'Montserrat, sans-serif',
      author: 'Raleway, sans-serif'
    },
    literary: {
      title: 'Cormorant Garamond, serif',
      subtitle: 'EB Garamond, serif',
      author: 'Libre Baskerville, serif'
    },
    children: {
      title: 'Fredoka One, cursive',
      subtitle: 'Comic Neue, cursive',
      author: 'Quicksand, sans-serif'
    },
    custom: {
      title: 'Inter, sans-serif',
      subtitle: 'Inter, sans-serif',
      author: 'Inter, sans-serif'
    }
  };
  
  return fonts[category]?.[element] || fonts.custom[element];
};

// Generate 3D mockup of the book
export const generate3DMockup = async (cover: BookCover, options: MockupOptions): Promise<string> => {
  // This would integrate with a 3D rendering service or library
  // For now, return a styled version of the cover
  
  const mockupStyles = {
    hardcover: {
      width: 600,
      height: 800,
      depth: 60,
      spine: true
    },
    paperback: {
      width: 600,
      height: 800,
      depth: 30,
      spine: true
    },
    ebook: {
      width: 600,
      height: 800,
      depth: 0,
      spine: false
    }
  };
  
  const style = mockupStyles[options.type];
  
  // Create SVG mockup
  const svg = `
    <svg width="700" height="900" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="10"/>
          <feOffset dx="10" dy="10" result="offsetblur"/>
          <feComponentTransfer>
            <feFuncA type="linear" slope="0.3"/>
          </feComponentTransfer>
          <feMerge>
            <feMergeNode/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
        ${options.perspective === '3d' ? `
        <linearGradient id="spine" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style="stop-color:#000;stop-opacity:0.3" />
          <stop offset="50%" style="stop-color:#000;stop-opacity:0.1" />
          <stop offset="100%" style="stop-color:#000;stop-opacity:0.3" />
        </linearGradient>
        ` : ''}
      </defs>
      
      <!-- Book cover -->
      <rect x="50" y="50" width="${style.width}" height="${style.height}" 
            fill="white" filter="${options.shadows ? 'url(#shadow)' : ''}"
            rx="5" ry="5"/>
      
      ${options.perspective === '3d' && style.spine ? `
      <!-- Spine -->
      <rect x="${50 - style.depth}" y="50" width="${style.depth}" height="${style.height}"
            fill="url(#spine)" rx="2" ry="2"/>
      ` : ''}
      
      <!-- Cover image placeholder -->
      <text x="350" y="450" text-anchor="middle" font-size="20" fill="#666">
        [Book Cover Image]
      </text>
    </svg>
  `;
  
  return `data:image/svg+xml;base64,${btoa(svg)}`;
};

// Export cover as high-resolution image
export const exportCoverHighRes = async (cover: BookCover): Promise<Blob> => {
  // Create canvas element
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  if (!ctx) throw new Error('Could not create canvas context');
  
  // Set high resolution dimensions (300 DPI for print)
  canvas.width = 1800; // 6 inches at 300 DPI
  canvas.height = 2400; // 8 inches at 300 DPI
  
  // Draw background image
  const img = new Image();
  img.src = cover.backgroundImage;
  
  await new Promise((resolve) => {
    img.onload = resolve;
  });
  
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  
  // Add overlay if enabled
  if (cover.layout.overlay) {
    ctx.fillStyle = `rgba(0, 0, 0, ${cover.layout.overlayOpacity})`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
  
  // Draw text elements
  ctx.textAlign = 'center';
  ctx.fillStyle = cover.colors.text;
  
  // Title
  ctx.font = `${cover.fonts.title.weight} ${cover.fonts.title.size * 3}px ${cover.fonts.title.family}`;
  ctx.fillText(
    cover.title,
    canvas.width * (cover.layout.titlePosition.x / 100),
    canvas.height * (cover.layout.titlePosition.y / 100)
  );
  
  // Subtitle
  if (cover.subtitle && cover.fonts.subtitle) {
    ctx.font = `${cover.fonts.subtitle.weight} ${cover.fonts.subtitle.size * 3}px ${cover.fonts.subtitle.family}`;
    ctx.fillText(
      cover.subtitle,
      canvas.width * (cover.layout.subtitlePosition!.x / 100),
      canvas.height * (cover.layout.subtitlePosition!.y / 100)
    );
  }
  
  // Author
  ctx.font = `${cover.fonts.author.weight} ${cover.fonts.author.size * 3}px ${cover.fonts.author.family}`;
  ctx.fillText(
    cover.author,
    canvas.width * (cover.layout.authorPosition.x / 100),
    canvas.height * (cover.layout.authorPosition.y / 100)
  );
  
  // Convert to blob
  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      resolve(blob!);
    }, 'image/png', 1.0);
  });
};

// Suggest cover elements based on story analysis
export const suggestCoverElements = async (story: Story): Promise<string[]> => {
  const prompt = `
    Based on this story synopsis and genre, suggest 5-7 visual elements that would make a compelling book cover:
    
    Title: ${story.title}
    Genre: ${story.genre}
    Synopsis: ${story.synopsis}
    
    Main characters: ${story.characters.map(c => c.name).join(', ')}
    
    Return a list of specific visual elements (objects, symbols, settings, colors, moods) that would capture the essence of this story.
  `;
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });
    
    const text = response.text;
    // Parse the response to extract elements
    const elements = text.split('\n')
      .filter(line => line.trim().length > 0)
      .map(line => line.replace(/^[-*•]\s*/, '').trim())
      .slice(0, 7);
    
    return elements;
  } catch (error) {
    console.error("Error suggesting cover elements:", error);
    // Return generic elements based on genre
    return getGenericElements(story.genre);
  }
};

// Get generic elements based on genre
const getGenericElements = (genre: string): string[] => {
  const elements: Record<string, string[]> = {
    'Fantasia': ['castelo', 'dragão', 'espada', 'magia', 'floresta mística', 'cristal', 'portal'],
    'Ficção Científica': ['nave espacial', 'planeta', 'robô', 'cidade futurista', 'estrelas', 'tecnologia', 'portal'],
    'Romance': ['casal', 'pôr do sol', 'flores', 'coração', 'cidade', 'praia', 'lua'],
    'Mistério': ['sombra', 'lupa', 'pegadas', 'névoa', 'cidade noturna', 'silhueta', 'chave'],
    'Terror': ['sombra', 'lua cheia', 'floresta escura', 'casa abandonada', 'névoa', 'olhos', 'sangue'],
    'Aventura': ['mapa', 'bússola', 'montanha', 'oceano', 'tesouro', 'selva', 'horizonte']
  };
  
  return elements[genre] || ['paisagem', 'símbolo abstrato', 'textura', 'padrão geométrico', 'gradiente'];
};