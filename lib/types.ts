export type AIModelTarget = 
  | 'midjourney'
  | 'flux'
  | 'sdxl'
  | 'gpt-image'
  | 'leonardo'
  | 'ideogram'
  | 'gemini-banana';

export type PromptLength = 'short' | 'medium' | 'detailed';

export interface StructuredPromptJson {
  character: {
    description: string;
    hair: string;
    clothing: string;
    expression: string;
    pose: string;
  };
  objects: string[];
  background: string;
  lighting: string;
  camera: string;
  art_style: string;
  color_palette: string[];
  quality_tags: string[];
}

export interface AnalysisResult {
  title: string;
  style: string;
  subject: string;
  prompt: string;
  negative_prompt?: string;
  camera: string;
  lighting: string;
  composition: string;
  aspect_ratio: string;
  colors: string[];
  keywords: string[];
  completeness_score?: number;
  confidence?: number;
  structured_json?: StructuredPromptJson;
}

export interface PresetExample {
  id: string;
  title: string;
  imageUrl: string;
  model: string;
  style: string;
  prompt: string;
  negative_prompt?: string;
  colors: string[];
  score: number;
}
