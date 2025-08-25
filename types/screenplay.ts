// Screenplay Types and Interfaces

export interface Screenplay {
  id: string;
  storyId: string;
  title: string;
  author: string;
  format: ScreenplayFormat;
  scenes: Scene[];
  duration: number; // estimated minutes
  pages: number;
  createdAt: string;
  updatedAt: string;
}

export type ScreenplayFormat = 'film' | 'tv' | 'theater' | 'short';

export interface Scene {
  id: string;
  number: number;
  heading: SceneHeading;
  action: ActionLine[];
  dialogue: DialogueLine[];
  transition?: TransitionType;
  duration: number; // estimated seconds
  charactersPresentt: string[];
}

export interface SceneHeading {
  location: string;
  setting: 'INT' | 'EXT' | 'INT/EXT';
  time: TimeOfDay;
  description?: string;
}

export type TimeOfDay = 
  | 'DAY' 
  | 'NIGHT' 
  | 'DAWN' 
  | 'DUSK' 
  | 'MORNING' 
  | 'AFTERNOON' 
  | 'EVENING' 
  | 'CONTINUOUS' 
  | 'LATER' 
  | 'MOMENTS LATER';

export interface ActionLine {
  text: string;
  type: 'action' | 'description' | 'sound' | 'music';
}

export interface DialogueLine {
  character: string;
  parenthetical?: string;
  dialogue: string;
  dual?: boolean; // for simultaneous dialogue
  voiceOver?: boolean;
  offScreen?: boolean;
  continued?: boolean;
}

export type TransitionType = 
  | 'CUT TO:' 
  | 'FADE IN:' 
  | 'FADE OUT:' 
  | 'FADE TO BLACK:' 
  | 'DISSOLVE TO:' 
  | 'MATCH CUT TO:' 
  | 'SMASH CUT TO:' 
  | 'TIME CUT TO:' 
  | 'INTERCUT WITH:';

export interface ScreenplayFormatting {
  fontSize: number;
  fontFamily: string;
  lineHeight: number;
  margins: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
  indentation: {
    character: number;
    parenthetical: number;
    dialogue: number;
    action: number;
    transition: number;
  };
}

export const STANDARD_FORMATTING: ScreenplayFormatting = {
  fontSize: 12,
  fontFamily: 'Courier',
  lineHeight: 1,
  margins: {
    top: 1,
    bottom: 1,
    left: 1.5,
    right: 1
  },
  indentation: {
    character: 3.7,
    parenthetical: 3.1,
    dialogue: 2.5,
    action: 0,
    transition: 4
  }
};

export interface CharacterArc {
  character: string;
  introduction: number; // scene number
  climax: number;
  resolution: number;
  screenTime: number; // percentage
  dialogueCount: number;
}

export interface ScreenplayAnalysis {
  pacing: 'slow' | 'medium' | 'fast';
  structure: ThreeActStructure;
  characterArcs: CharacterArc[];
  dialogueRatio: number; // dialogue vs action ratio
  averageSceneDuration: number;
  suggestions: string[];
}

export interface ThreeActStructure {
  act1: {
    scenes: number[];
    percentage: number;
    incitingIncident?: number;
  };
  act2: {
    scenes: number[];
    percentage: number;
    midpoint?: number;
  };
  act3: {
    scenes: number[];
    percentage: number;
    climax?: number;
  };
}