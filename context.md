Product Name

PromptLens AI

Tagline: Upload any AI image. Get a reusable prompt.

1. Overview

PromptLens AI is a web application that allows users to upload an AI-generated image and receive a detailed prompt that can be used with models like Midjourney, Flux, SDXL, GPT Image, Ideogram, or Leonardo AI.

Users often discover AI-generated images on social media but don't know the prompts used to create them. PromptLens AI analyzes the image using the Inkling AI Vision API and generates a structured prompt that recreates a similar result.

No account or login is required.

2. Problem Statement

Users find amazing AI artwork on:

Instagram
X
Pinterest
Reddit
Facebook
Threads

But they cannot reproduce the image because the original prompt is unavailable.

3. Goal

Convert uploaded AI images into detailed prompts with one click.

4. Target Users
AI artists
Designers
Midjourney users
Flux users
Stable Diffusion users
Content creators
Marketing agencies
Beginners learning prompt engineering
5. User Flow
Landing Page

↓

Upload Image

↓

Preview Image

↓

Click "Generate Prompt"

↓

Inkling AI Vision Analysis

↓

Prompt Generated

↓

Copy Prompt

↓

Use in Image Generator
6. Features
Image Upload

Support:

JPG
PNG
WEBP

Maximum:

20 MB

Drag and Drop

or

Upload Button

AI Image Analysis

Send image to Inkling Vision.

Prompt to Inkling:

Analyze this AI-generated image in extreme detail. Generate a high-quality image generation prompt that recreates a visually similar result. Include subject, clothing, pose, facial expression, lighting, composition, camera angle, lens, colors, art style, rendering quality, environment, background, textures, mood, and technical keywords. Do not describe it as an analysis. Output only the final prompt.

Generated Prompt

Example:

Ultra realistic portrait of a cyberpunk girl,
neon pink and blue lighting,
wearing futuristic jacket,
short silver hair,
glowing eyes,
cinematic composition,
50mm lens,
shallow depth of field,
hyper detailed skin,
volumetric lighting,
high contrast,
masterpiece,
8K,
photorealistic,
highly detailed,
HDR,
professional photography
Copy Button

One-click copy.

Download

Download prompt as:

TXT

Prompt Length

Short

Medium

Detailed

Prompt Style

Dropdown

Midjourney
Flux
SDXL
GPT Image
Leonardo AI
Ideogram

The AI adapts the prompt format.

Negative Prompt

Optional.

Generate:

low quality,
blurry,
bad anatomy,
extra fingers,
deformed,
watermark,
text,
logo
Prompt Breakdown

Display sections:

Subject

Style

Lighting

Composition

Camera

Color Palette

Rendering

Quality Tags

Prompt Score

Show:

Completeness

Example:

Prompt Quality

94/100
Color Palette

Extract dominant colors.

Example:

#F8D29A

#3A4A65

#181818

#FFFFFF
Style Detection

Detect:

Anime

Photorealistic

3D

Oil Painting

Watercolor

Fantasy

Sci-Fi

Pixel Art

Minimal

Comic

Sketch

Camera Detection

Guess:

35mm

50mm

85mm

Wide Angle

Portrait

Macro

Drone View

Top View

Lighting Detection

Studio

Golden Hour

Neon

Soft Light

Hard Light

Rim Light

Backlight

Volumetric

Composition

Portrait

Close-up

Wide Shot

Rule of Thirds

Symmetry

Low Angle

High Angle

Dutch Angle

Aspect Ratio

Guess:

1:1

16:9

4:5

9:16

7. Homepage

Hero

Upload AI Images

Get Professional Image Prompts

Powered by AI Vision

Button

Upload Image
Example Section

Before

(Image)

↓

After

Prompt

FAQ

Can you recover the exact prompt?

No.

The AI recreates a highly accurate prompt from the image.

Privacy

Images deleted automatically after processing.

No storage.

Footer

Terms

Privacy

Contact

8. Tech Stack

Frontend

Next.js
React
Tailwind CSS

Backend

Next.js API Routes or FastAPI

AI

Inkling AI Vision API

Storage

None (process images in memory only)

Hosting

Vercel
9. API Flow
Upload Image

↓

Frontend

↓

Backend

↓

Inkling Vision API

↓

Analyze Image

↓

Generate Prompt

↓

Return JSON

↓

Display Prompt
10. AI Prompt for Inkling
You are an expert AI prompt engineer.

Your task is to convert an uploaded image into the best possible image generation prompt.

Describe:

• Main subject
• Face
• Pose
• Clothing
• Accessories
• Hair
• Expression
• Background
• Environment
• Colors
• Lighting
• Camera angle
• Lens
• Composition
• Rendering style
• Artistic style
• Materials
• Textures
• Quality keywords
• Image model tags

Do not explain.

Output JSON only:

{
  "title": "",
  "style": "",
  "subject": "",
  "prompt": "",
  "negative_prompt": "",
  "camera": "",
  "lighting": "",
  "composition": "",
  "aspect_ratio": "",
  "colors": [],
  "keywords": []
}



this is ai api key 

import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: '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',
  baseURL: 'https://integrate.api.nvidia.com/v1',
})
 
async function main() {
  const completion = await openai.chat.completions.create({
    model: "thinkingmachines/inkling",
    messages: [{"role":"user","content":""}],
    temperature: 1,
    top_p: 0.95,
    max_tokens: 8192,
    stream: false
  })
   
  process.stdout.write(completion.choices[0]?.message?.content);
  
  
}

main();