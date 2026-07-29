import { PresetExample } from './types';

export const PRESET_EXAMPLES: PresetExample[] = [
  {
    id: 'cyberpunk-girl',
    title: 'Cyberpunk Portrait',
    imageUrl: '/images/cyberpunk_portrait.png',
    model: 'Midjourney v6',
    style: 'Cyberpunk Photorealism',
    prompt: 'Ultra realistic portrait of a cyberpunk girl, neon pink and cyan lighting, futuristic reflective jacket, short silver hair, glowing eyes, cinematic composition, 50mm f/1.4 lens, shallow depth of field, hyper detailed skin texture, dark atmospheric alley background, volumetric fog, masterpiece, 8K resolution, photorealistic --v 6.0 --ar 1:1',
    negative_prompt: 'low quality, blurry, bad anatomy, extra fingers, deformed, watermark, text, logo, noise',
    colors: ['#22D3EE', '#A855F7', '#EC4899', '#0F172A', '#F8FAFC'],
    score: 96
  },
  {
    id: 'fantasy-castle',
    title: 'Floating Fantasy Castle',
    imageUrl: '/images/fantasy_castle.png',
    model: 'Flux.1',
    style: 'Dark Fantasy Concept Art',
    prompt: 'Breathtaking fantasy artwork of an ancient stone castle floating in a glowing cloud realm, magical gold runes illuminating towers, epic dramatic sunset lighting, golden hour rays piercing thunder clouds, octave render, matte painting, intricate architecture, hyperrealistic atmospheric distance --ar 16:9',
    negative_prompt: 'oversaturated, flat lighting, 3d cartoon, low poly, noisy background, text, signature',
    colors: ['#F59E0B', '#7C3AED', '#3B82F6', '#1E1B4B', '#FFFBEB'],
    score: 94
  },
  {
    id: 'futuristic-car',
    title: 'Hypercar in Rain',
    imageUrl: '/images/hypercar_rain.png',
    model: 'SDXL 1.0',
    style: 'Commercial Automotive Photography',
    prompt: 'Sleek matte black hypercar speeding down a wet city street at dusk, glowing red taillight trails, rain droplets on bodywork, reflection of city lights on wet asphalt, motion blur, 85mm lens, f/1.8 aperture, cinematic color grading, photorealistic, Octane Render, 8K resolution',
    negative_prompt: 'toy car, distorted wheels, low resolution, blurry movement, cropped frame, daytime',
    colors: ['#EF4444', '#10B981', '#334155', '#090D16', '#F3F4F6'],
    score: 92
  }
];
