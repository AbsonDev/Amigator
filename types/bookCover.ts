// Book Cover Types and Interfaces

export interface BookCover {
  id: string;
  storyId: string;
  title: string;
  subtitle?: string;
  author: string;
  backgroundImage: string; // base64 or URL
  template: CoverTemplate;
  colors: CoverColors;
  fonts: CoverFonts;
  layout: CoverLayout;
  spine?: SpineDesign;
  backCover?: BackCover;
  createdAt: string;
  updatedAt: string;
}

export interface CoverTemplate {
  id: string;
  name: string;
  category: 'fantasy' | 'scifi' | 'romance' | 'thriller' | 'literary' | 'children' | 'custom';
  style: 'minimalist' | 'illustrated' | 'photographic' | 'abstract' | 'vintage' | 'modern';
}

export interface CoverColors {
  primary: string;
  secondary: string;
  accent: string;
  text: string;
  background: string;
}

export interface CoverFonts {
  title: FontStyle;
  subtitle?: FontStyle;
  author: FontStyle;
}

export interface FontStyle {
  family: string;
  size: number;
  weight: 'normal' | 'bold' | 'light';
  style: 'normal' | 'italic';
  letterSpacing?: number;
  textTransform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
}

export interface CoverLayout {
  titlePosition: Position;
  subtitlePosition?: Position;
  authorPosition: Position;
  imagePosition: Position;
  imageOpacity: number;
  imageBlur: number;
  overlay: boolean;
  overlayOpacity: number;
}

export interface Position {
  x: number; // percentage
  y: number; // percentage
  align: 'left' | 'center' | 'right';
  verticalAlign: 'top' | 'middle' | 'bottom';
}

export interface SpineDesign {
  width: number;
  title: string;
  author: string;
  publisher?: string;
  logo?: string;
}

export interface BackCover {
  synopsis: string;
  reviews?: BookReview[];
  authorBio?: string;
  authorPhoto?: string;
  isbn?: string;
  barcode?: string;
  price?: string;
}

export interface BookReview {
  text: string;
  author: string;
  publication?: string;
}

export interface CoverGenerationOptions {
  genre: string;
  theme: string;
  mood: 'dark' | 'light' | 'vibrant' | 'muted' | 'dramatic';
  style: string;
  elements: string[];
  colorScheme?: 'warm' | 'cool' | 'monochrome' | 'complementary';
}

export interface MockupOptions {
  type: 'hardcover' | 'paperback' | 'ebook';
  perspective: 'front' | 'spine' | '3d' | 'flat';
  background: 'transparent' | 'wood' | 'marble' | 'gradient';
  shadows: boolean;
  reflections: boolean;
}