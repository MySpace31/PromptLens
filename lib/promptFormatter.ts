import { AIModelTarget, PromptLength } from './types';

export function formatPromptForModel(
  rawPrompt: string,
  model: AIModelTarget,
  length: PromptLength,
  aspectRatio: string = '1:1'
): string {
  let cleaned = rawPrompt.trim();
  const parts = cleaned.split(',').map(s => s.trim()).filter(Boolean);

  // Adjust prompt based on length
  if (length === 'short') {
    // Extract main subject, style, and essential tags (short concise prompt)
    cleaned = parts.slice(0, Math.min(5, parts.length)).join(', ');
  } else if (length === 'medium') {
    // Balanced prompt (medium length)
    cleaned = parts.slice(0, Math.min(9, parts.length)).join(', ');
  } else if (length === 'detailed') {
    // Full detailed prompt: expand with extra hyper-detailed descriptors if needed
    const extraDetails = [
      'subtle specular highlights',
      'photorealistic surface micro-textures',
      'volumetric depth of field',
      'raytraced ambient occlusion',
      'cinematic color grading',
      'masterpiece rendering quality',
      'ultra high resolution 8K detail'
    ];

    // Combine original full parts + ensure rich extra descriptors for max detail
    const uniqueParts = new Set([...parts]);
    extraDetails.forEach(d => uniqueParts.add(d));
    cleaned = Array.from(uniqueParts).join(', ');
  }

  // Model-specific syntax formatting
  switch (model) {
    case 'midjourney': {
      const arParam = aspectRatio ? `--ar ${aspectRatio.replace(':', ':')}` : '--ar 1:1';
      return `${cleaned} ${arParam} --v 6.0 --style raw --q 2`;
    }
    case 'flux': {
      return `[FLUX.1 Dev] ${cleaned}, photorealistic realism, high fidelity detail, masterwork render`;
    }
    case 'sdxl': {
      return `${cleaned}, (masterpiece:1.2), (photorealistic:1.3), high quality, 8k resolution, detailed texture`;
    }
    case 'gpt-image': {
      return `A detailed high quality image depicting: ${cleaned}. Ensure realistic lighting, natural textures, and a harmonious color palette.`;
    }
    case 'ideogram': {
      return `${cleaned}, stylized typography layout, vibrant color grading, high clarity, clean focus`;
    }
    case 'leonardo': {
      return `${cleaned}, Alchemy V2, Dynamic preset, highly detailed, photorealistic render`;
    }
    case 'gemini-banana': {
      return `[Gemini Nano Banana AI] High precision image prompt: ${cleaned}. Render with ultra-fast neural processing, crisp edge definition, natural lighting balance, and banana-vibrant color saturation.`;
    }
    default:
      return cleaned;
  }
}

export function createStyleTemplatePrompt(
  rawPrompt: string,
  subject: string,
  model: AIModelTarget,
  length: PromptLength,
  aspectRatio: string = '1:1',
  customSubjectInput?: string
): string {
  const replacementTag = customSubjectInput?.trim() || '[YOUR SUBJECT / UPLOAD YOUR IMAGE]';
  let prompt = rawPrompt.trim();

  const parts = prompt.split(',').map(p => p.trim()).filter(Boolean);
  if (parts.length > 1) {
    parts[0] = replacementTag;
    prompt = parts.join(', ');
  } else {
    prompt = `${replacementTag}, ${prompt}`;
  }

  return formatPromptForModel(prompt, model, length, aspectRatio);
}

