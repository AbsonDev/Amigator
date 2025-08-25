import { GoogleGenAI } from "@google/genai";
import type { Story, Chapter, Character } from '../types';
import type { 
  Screenplay, 
  Scene, 
  SceneHeading, 
  ActionLine, 
  DialogueLine,
  ScreenplayFormat,
  TimeOfDay,
  TransitionType,
  ScreenplayAnalysis,
  CharacterArc
} from '../types/screenplay';

const API_KEY = process.env.API_KEY || process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({ apiKey: API_KEY! });

// Convert story to screenplay format
export const convertToScreenplay = async (
  story: Story,
  format: ScreenplayFormat = 'film'
): Promise<Screenplay> => {
  const scenes: Scene[] = [];
  let sceneNumber = 1;
  
  // Process each chapter into scenes
  for (const chapter of story.chapters) {
    const chapterScenes = await extractScenesFromChapter(chapter, story.characters);
    
    for (const scene of chapterScenes) {
      scenes.push({
        ...scene,
        number: sceneNumber++
      });
    }
  }
  
  // Calculate estimated duration
  const duration = estimateScreenplayDuration(scenes);
  const pages = Math.ceil(duration / 60); // Roughly 1 page per minute
  
  const screenplay: Screenplay = {
    id: `screenplay-${Date.now()}`,
    storyId: story.id,
    title: story.title,
    author: 'Adaptado por IA',
    format,
    scenes,
    duration,
    pages,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  return screenplay;
};

// Extract scenes from a chapter using AI
const extractScenesFromChapter = async (
  chapter: Chapter,
  characters: Character[]
): Promise<Scene[]> => {
  const prompt = `
    Analise o seguinte capítulo e converta-o em cenas de roteiro.
    Para cada cena, identifique:
    1. Localização (interior ou exterior)
    2. Hora do dia
    3. Ações principais
    4. Diálogos
    5. Personagens presentes
    
    Capítulo: "${chapter.title}"
    Conteúdo: ${chapter.content}
    
    Personagens disponíveis: ${characters.map(c => c.name).join(', ')}
    
    Retorne as cenas em formato estruturado.
  `;
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });
    
    // Parse AI response and create scenes
    const scenes = parseAISceneResponse(response.text, characters);
    return scenes;
  } catch (error) {
    console.error("Error extracting scenes:", error);
    // Fallback: create a single scene from the chapter
    return [createFallbackScene(chapter, characters)];
  }
};

// Parse AI response into scene objects
const parseAISceneResponse = (text: string, characters: Character[]): Scene[] => {
  const scenes: Scene[] = [];
  
  // Simple parsing logic - would be more sophisticated in production
  const sceneBlocks = text.split(/CENA \d+|Scene \d+/i).filter(Boolean);
  
  for (const block of sceneBlocks) {
    const scene = parseSceneBlock(block, characters);
    if (scene) scenes.push(scene);
  }
  
  return scenes.length > 0 ? scenes : [createDefaultScene()];
};

// Parse individual scene block
const parseSceneBlock = (block: string, characters: Character[]): Scene | null => {
  try {
    // Extract location and time
    const headingMatch = block.match(/(INT|EXT|INT\/EXT)\.?\s+([^-]+)\s*-\s*(\w+)/i);
    const heading: SceneHeading = headingMatch ? {
      setting: headingMatch[1].toUpperCase() as 'INT' | 'EXT' | 'INT/EXT',
      location: headingMatch[2].trim(),
      time: parseTimeOfDay(headingMatch[3])
    } : {
      setting: 'INT',
      location: 'LOCATION',
      time: 'DAY'
    };
    
    // Extract dialogue
    const dialogueLines = extractDialogue(block, characters);
    
    // Extract action lines
    const actionLines = extractAction(block);
    
    // Identify characters present
    const charactersPresentt = identifyCharactersInScene(block, characters);
    
    return {
      id: `scene-${Date.now()}-${Math.random()}`,
      number: 0, // Will be set later
      heading,
      action: actionLines,
      dialogue: dialogueLines,
      duration: estimateSceneDuration(actionLines, dialogueLines),
      charactersPresentt
    };
  } catch (error) {
    return null;
  }
};

// Parse time of day from text
const parseTimeOfDay = (text: string): TimeOfDay => {
  const time = text.toUpperCase();
  const validTimes: TimeOfDay[] = [
    'DAY', 'NIGHT', 'DAWN', 'DUSK', 'MORNING', 
    'AFTERNOON', 'EVENING', 'CONTINUOUS', 'LATER', 'MOMENTS LATER'
  ];
  
  return validTimes.find(t => time.includes(t)) || 'DAY';
};

// Extract dialogue from text
const extractDialogue = (text: string, characters: Character[]): DialogueLine[] => {
  const dialogueLines: DialogueLine[] = [];
  
  // Look for character names followed by dialogue
  for (const character of characters) {
    const regex = new RegExp(`${character.name.toUpperCase()}[:\\s]+([^\\n]+)`, 'gi');
    const matches = text.matchAll(regex);
    
    for (const match of matches) {
      // Check for parentheticals
      const parentheticalMatch = match[1].match(/\(([^)]+)\)/);
      const parenthetical = parentheticalMatch ? parentheticalMatch[1] : undefined;
      const dialogue = match[1].replace(/\([^)]+\)/g, '').trim();
      
      if (dialogue) {
        dialogueLines.push({
          character: character.name.toUpperCase(),
          parenthetical,
          dialogue,
          voiceOver: dialogue.includes('(V.O.)'),
          offScreen: dialogue.includes('(O.S.)')
        });
      }
    }
  }
  
  return dialogueLines;
};

// Extract action lines from text
const extractAction = (text: string): ActionLine[] => {
  const actionLines: ActionLine[] = [];
  
  // Split by lines and filter out dialogue and headings
  const lines = text.split('\n').filter(line => {
    const trimmed = line.trim();
    return trimmed && 
           !trimmed.match(/^(INT|EXT|INT\/EXT)\./i) &&
           !trimmed.match(/^[A-Z\s]+:/) && // Not dialogue
           !trimmed.match(/^FADE|CUT|DISSOLVE/i); // Not transition
  });
  
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.length > 10) { // Minimum length for action
      actionLines.push({
        text: trimmed,
        type: detectActionType(trimmed)
      });
    }
  }
  
  return actionLines;
};

// Detect type of action line
const detectActionType = (text: string): 'action' | 'description' | 'sound' | 'music' => {
  if (text.match(/SFX:|SOUND:|som de/i)) return 'sound';
  if (text.match(/MUSIC:|MÚSICA:|toca/i)) return 'music';
  if (text.match(/\b(sala|quarto|casa|rua|prédio|lugar)\b/i)) return 'description';
  return 'action';
};

// Identify characters present in scene
const identifyCharactersInScene = (text: string, characters: Character[]): string[] => {
  const present: string[] = [];
  
  for (const character of characters) {
    if (text.toLowerCase().includes(character.name.toLowerCase())) {
      present.push(character.name);
    }
  }
  
  return present;
};

// Create fallback scene when AI fails
const createFallbackScene = (chapter: Chapter, characters: Character[]): Scene => {
  return {
    id: `scene-${Date.now()}`,
    number: 1,
    heading: {
      setting: 'INT',
      location: 'LOCATION',
      time: 'DAY',
      description: chapter.title
    },
    action: [{
      text: chapter.summary || chapter.content.substring(0, 200),
      type: 'action'
    }],
    dialogue: [],
    duration: 120,
    charactersPresentt: characters.slice(0, 2).map(c => c.name)
  };
};

// Create default scene
const createDefaultScene = (): Scene => {
  return {
    id: `scene-${Date.now()}`,
    number: 1,
    heading: {
      setting: 'INT',
      location: 'LOCATION',
      time: 'DAY'
    },
    action: [{
      text: 'Action to be determined.',
      type: 'action'
    }],
    dialogue: [],
    duration: 60,
    charactersPresentt: []
  };
};

// Estimate scene duration in seconds
const estimateSceneDuration = (action: ActionLine[], dialogue: DialogueLine[]): number => {
  // Rough estimates:
  // - Action: 3 seconds per line
  // - Dialogue: 2 seconds per line
  const actionTime = action.length * 3;
  const dialogueTime = dialogue.length * 2;
  
  return Math.max(30, actionTime + dialogueTime); // Minimum 30 seconds
};

// Estimate total screenplay duration
const estimateScreenplayDuration = (scenes: Scene[]): number => {
  return scenes.reduce((total, scene) => total + scene.duration, 0) / 60; // Convert to minutes
};

// Format screenplay for export
export const formatScreenplay = (screenplay: Screenplay): string => {
  let formatted = '';
  
  // Title page
  formatted += `${screenplay.title.toUpperCase()}\n\n`;
  formatted += `Written by\n${screenplay.author}\n\n`;
  formatted += `Based on the story by\n[Original Author]\n\n`;
  formatted += `${new Date().toLocaleDateString()}\n\n`;
  formatted += 'FADE IN:\n\n';
  
  // Format each scene
  for (const scene of screenplay.scenes) {
    formatted += formatScene(scene);
  }
  
  formatted += '\nFADE OUT.\n\nTHE END';
  
  return formatted;
};

// Format individual scene
const formatScene = (scene: Scene): string => {
  let formatted = '';
  
  // Scene heading
  formatted += `${scene.heading.setting}. ${scene.heading.location} - ${scene.heading.time}\n\n`;
  
  // Action lines
  for (const action of scene.action) {
    formatted += `${action.text}\n\n`;
  }
  
  // Dialogue
  for (const dialogue of scene.dialogue) {
    formatted += `\t\t\t${dialogue.character}\n`;
    if (dialogue.parenthetical) {
      formatted += `\t\t(${dialogue.parenthetical})\n`;
    }
    formatted += `\t\t${dialogue.dialogue}\n\n`;
  }
  
  // Transition
  if (scene.transition) {
    formatted += `\t\t\t\t\t${scene.transition}\n\n`;
  }
  
  return formatted;
};

// Export screenplay as PDF
export const exportScreenplayPDF = async (screenplay: Screenplay): Promise<Blob> => {
  // This would use a PDF library to create properly formatted screenplay
  // For now, return a text blob
  const formatted = formatScreenplay(screenplay);
  return new Blob([formatted], { type: 'text/plain' });
};

// Export screenplay as Final Draft XML
export const exportFinalDraftXML = (screenplay: Screenplay): string => {
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<FinalDraft DocumentType="Script" Template="Screenplay" Version="1">\n';
  xml += '<Content>\n';
  
  for (const scene of screenplay.scenes) {
    // Scene heading
    xml += '<Paragraph Type="Scene Heading">\n';
    xml += `<Text>${scene.heading.setting}. ${scene.heading.location} - ${scene.heading.time}</Text>\n`;
    xml += '</Paragraph>\n';
    
    // Action
    for (const action of scene.action) {
      xml += '<Paragraph Type="Action">\n';
      xml += `<Text>${escapeXML(action.text)}</Text>\n`;
      xml += '</Paragraph>\n';
    }
    
    // Dialogue
    for (const dialogue of scene.dialogue) {
      xml += '<Paragraph Type="Character">\n';
      xml += `<Text>${dialogue.character}</Text>\n`;
      xml += '</Paragraph>\n';
      
      if (dialogue.parenthetical) {
        xml += '<Paragraph Type="Parenthetical">\n';
        xml += `<Text>(${dialogue.parenthetical})</Text>\n`;
        xml += '</Paragraph>\n';
      }
      
      xml += '<Paragraph Type="Dialogue">\n';
      xml += `<Text>${escapeXML(dialogue.dialogue)}</Text>\n`;
      xml += '</Paragraph>\n';
    }
    
    // Transition
    if (scene.transition) {
      xml += '<Paragraph Type="Transition">\n';
      xml += `<Text>${scene.transition}</Text>\n`;
      xml += '</Paragraph>\n';
    }
  }
  
  xml += '</Content>\n';
  xml += '</FinalDraft>';
  
  return xml;
};

// Escape XML special characters
const escapeXML = (text: string): string => {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
};

// Analyze screenplay structure
export const analyzeScreenplay = (screenplay: Screenplay): ScreenplayAnalysis => {
  const totalScenes = screenplay.scenes.length;
  const act1End = Math.floor(totalScenes * 0.25);
  const act2End = Math.floor(totalScenes * 0.75);
  
  // Calculate dialogue ratio
  let totalDialogue = 0;
  let totalAction = 0;
  
  for (const scene of screenplay.scenes) {
    totalDialogue += scene.dialogue.length;
    totalAction += scene.action.length;
  }
  
  const dialogueRatio = totalDialogue / (totalDialogue + totalAction);
  
  // Analyze character arcs
  const characterArcs = analyzeCharacterArcs(screenplay);
  
  // Determine pacing
  const averageSceneDuration = screenplay.duration / screenplay.scenes.length;
  const pacing = averageSceneDuration < 1 ? 'fast' : 
                 averageSceneDuration > 2 ? 'slow' : 'medium';
  
  // Generate suggestions
  const suggestions = generateScreenplaySuggestions(screenplay, dialogueRatio, pacing);
  
  return {
    pacing,
    structure: {
      act1: {
        scenes: Array.from({ length: act1End }, (_, i) => i + 1),
        percentage: 25,
        incitingIncident: Math.floor(act1End * 0.5)
      },
      act2: {
        scenes: Array.from({ length: act2End - act1End }, (_, i) => i + act1End + 1),
        percentage: 50,
        midpoint: Math.floor((act1End + act2End) / 2)
      },
      act3: {
        scenes: Array.from({ length: totalScenes - act2End }, (_, i) => i + act2End + 1),
        percentage: 25,
        climax: totalScenes - 2
      }
    },
    characterArcs,
    dialogueRatio,
    averageSceneDuration,
    suggestions
  };
};

// Analyze character arcs in screenplay
const analyzeCharacterArcs = (screenplay: Screenplay): CharacterArc[] => {
  const characterMap = new Map<string, CharacterArc>();
  
  for (const scene of screenplay.scenes) {
    for (const character of scene.charactersPresentt) {
      if (!characterMap.has(character)) {
        characterMap.set(character, {
          character,
          introduction: scene.number,
          climax: scene.number,
          resolution: scene.number,
          screenTime: 0,
          dialogueCount: 0
        });
      }
      
      const arc = characterMap.get(character)!;
      arc.resolution = scene.number;
      arc.screenTime += scene.duration;
      arc.dialogueCount += scene.dialogue.filter(d => d.character === character.toUpperCase()).length;
    }
  }
  
  // Calculate screen time percentage
  const totalDuration = screenplay.duration * 60; // Convert to seconds
  for (const arc of characterMap.values()) {
    arc.screenTime = (arc.screenTime / totalDuration) * 100;
  }
  
  return Array.from(characterMap.values());
};

// Generate suggestions for screenplay improvement
const generateScreenplaySuggestions = (
  screenplay: Screenplay, 
  dialogueRatio: number, 
  pacing: string
): string[] => {
  const suggestions: string[] = [];
  
  if (dialogueRatio > 0.7) {
    suggestions.push('Considere adicionar mais ação visual para equilibrar os diálogos');
  } else if (dialogueRatio < 0.3) {
    suggestions.push('Adicione mais diálogos para desenvolver os personagens');
  }
  
  if (pacing === 'slow') {
    suggestions.push('Considere combinar ou cortar algumas cenas para melhorar o ritmo');
  } else if (pacing === 'fast') {
    suggestions.push('Adicione momentos de respiro entre as cenas de ação');
  }
  
  if (screenplay.scenes.length < 40) {
    suggestions.push('O roteiro pode estar muito curto para um longa-metragem');
  } else if (screenplay.scenes.length > 150) {
    suggestions.push('Considere dividir em múltiplos episódios ou cortar cenas');
  }
  
  return suggestions;
};