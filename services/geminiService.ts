
import { GoogleGenAI, Modality } from "@google/genai";
import type { UploadedImage, MemeGenerationMode, DigitalTwinStyle } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const getDigitalTwinPrompt = (style: DigitalTwinStyle): string => {
  const baseInstructions = `You are an expert digital artist specializing in creating character models for virtual environments.
**Mission:** Analyze the user's uploaded image and create a complete, full-body "digital twin" of the main subject. This is for a 'virtual try-on' use case, so the output should be a complete character model.

**Core Rules (Follow These Strictly):**
1.  **Identify the Main Subject:** Accurately identify the primary person, animal, or object in the image.
2.  **Complete the Subject (Crucial):** If the original image is cropped or shows only part of the subject (e.g., a headshot, waist-up), you **must creatively generate the rest of the body and clothing**. The goal is a complete, full-figure character in a neutral, standing pose. The generated parts must logically match the visible parts in style, clothing, and physique.
3.  **Isolate and Remove Background:** The background of the output image **must be transparent**. This is non-negotiable for the model to be versatile.
4.  **Maintain Identity:** The subject's face, hair, and visible clothing must remain 100% recognizable. The essence of the original subject must be preserved, even as you complete their form.
5.  **Output Format:** Your **only** output must be the final, high-quality image. Do not add any text, borders, watermarks, or other elements outside the subject itself.`;

  const styleInstructions = {
    sticker: `
**Style: Photorealistic Model**
- **Goal:** Create a clean, high-quality, full-body photorealistic model.
- **Execution:** Generate the full figure based on the subject. Clean up any artifacts from the original image, improve lighting slightly to make it pop, and enhance details. The style should be photorealistic but hyper-clean, as if it's a premium digital asset.`,
    '3d_model': `
**Style: 3D Animated Model**
- **Goal:** Recreate the subject as a high-quality, full-body 3D rendered model, similar to a character from a modern animated film (e.g., Pixar, DreamWorks).
- **Execution:** Generate the full figure. Give the subject volume, cinematic lighting, and detailed textures (e.g., fabric, skin, fur). The final render should look like a professional character model from a major animation studio.`,
    cartoon: `
**Style: 2D Cartoon**
- **Goal:** Transform the subject into a vibrant, full-body 2D cartoon character.
- **Execution:** Generate the full figure. Use bold outlines, simplified cel-shading, and slightly exaggerated features, in the style of modern American animation (e.g., 'The Simpsons', 'Rick and Morty'). The character should be expressive and full of a personality.`,
    pixel_art: `
**Style: 16-Bit Pixel Art**
- **Goal:** Convert the subject into a detailed, full-body 16-bit pixel art sprite.
- **Execution:** Generate the full figure. Recreate the subject using a limited but effective color palette, reminiscent of classic SNES or Sega Genesis video games. Ensure clean pixel lines and a clear, readable silhouette. Avoid anti-aliasing; the pixels should be sharp.`,
  };

  return `${baseInstructions}\n\n${styleInstructions[style]}`;
};


export const createDigitalTwin = async (image: UploadedImage, style: DigitalTwinStyle): Promise<string | null> => {
  const prompt = getDigitalTwinPrompt(style);

  const contents = {
    parts: [
      { text: prompt },
      { inlineData: { data: image.data, mimeType: image.mimeType } },
    ]
  };

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image-preview',
    contents: contents,
    config: {
      responseModalities: [Modality.IMAGE, Modality.TEXT],
    },
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData?.data && part.inlineData?.mimeType) {
      return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
    }
  }
  
  const responseText = response.text ?? '';
  if (responseText.trim() === '') {
    console.warn("API response for Digital Twin was empty or did not contain an image part. This could be due to a safety policy violation.");
  } else {
    console.warn(`API for Digital Twin returned text instead of an image: "${responseText.trim()}"`);
  }

  return null;
};


const createPrompt = (
  mode: MemeGenerationMode, 
  topic?: string, 
  hasTemplate?: boolean,
  variationHint?: string
): string => {
  const topicInstruction = (topic && topic.trim() !== '') 
    ? `The user wants the meme to be about: "${topic}". Use this as your primary inspiration for the caption or theme.`
    : `The user has not provided a specific topic, so use your expert judgment to make it universally funny.`;

  const variationInstruction = variationHint
    ? `\n\n**Creative Directive:** ${variationHint}`
    : '';

  switch (mode) {
    case 'popular':
      return `You are a meme expert who recreates images in the style of popular meme formats.
**Mission:** Analyze the user's image and reimagine it as a famous meme. The user may provide a clean "digital twin" with a transparent background; if so, seamlessly integrate it.
**Instructions:**
1.  **Identify the Core Concept:** Look at the user's image. What's the mood, the action, the subject?
2.  **Select a Matching Meme Format:** Choose a well-known meme template that fits the user's image concept (e.g., "Distracted Boyfriend," "Woman Yelling at a Cat," "Is This a Pigeon?").
3.  **Recreate, Don't Just Caption:** Redraw or artistically reinterpret the user's image to perfectly match the style and composition of the chosen meme format. The original subject(s) must be recognizable but transformed into the meme's world.
4.  **Add Witty Text:** Add a caption that is hilarious in the context of the new format. ${topicInstruction}
5.  **Output:** Your only output is the final, high-quality meme image. Do not explain your choice or add extra text.${variationInstruction}`;

    case 'custom':
      return `You are a master digital artist and meme director. The absolute priority is the seamless visual integration of the character into the scene.

**Mission:** Recreate a meme scene from a "Template Image," recasting the main character with the "Subject/Character Model".

**Inputs (in order):**
1.  **Image 1 (The Template):** Your reference for the scene, composition, mood, and style.
2.  **Image 2 (The Subject/Character Model):** The new star of the meme. Treat this as a **virtual actor**, NOT a static image to be pasted.

**Primary Goal:** Generate a **brand-new image from scratch** that is a high-fidelity recreation of the template's scene, but with the new subject seamlessly integrated and *acting out the role* of the original character.

**CRITICAL Directives:**
1.  **Recreate, Don't Edit:** Do NOT simply paste the subject onto the template. Redraw the entire scene so the final output looks like a single, cohesive photograph or illustration.
2.  **Animate the Virtual Actor (Most Important Rule):** The subject **must** replace an original character. You **must change the subject's pose, expression, and actions** to perfectly match what the original character was doing. If the original character was yelling, make the subject yell. If they were pointing, make the subject point. This transformation is the core of the task.
3.  **Fidelity to the Scene:** The recreated environment, lighting, and camera angle must be instantly recognizable from the template.
4.  **Handle Text Conditionally (Crucial):**
    - **First, analyze the Template Image.** Does it contain any text or captions?
    - **If the Template Image has NO TEXT:** Your final output image must also have **NO TEXT**. Do not add any captions, even if the user provides a topic. The humor must come purely from the visual recreation.
    - **If the Template Image HAS TEXT:** Recreate the text in a similar style and position. Use the user's topic as inspiration for the content of the text. ${topicInstruction} If the topic is empty, create a new, funny caption that fits the meme's original format.
5.  **Output:** Your **ONLY** output is the final, high-quality, recreated meme image. No explanations or commentary.`;
    
    case 'classic':
    default:
      return `You are a legendary meme creator.
**Mission:** Create a hilarious meme by adding a caption to the provided image.
**Instructions:**
1.  **Analyze the Visuals:** Scrutinize the image for expressions, actions, and objects. The user might provide a "digital twin" with a transparent background; feel free to place it in a simple, funny context or background before adding text.
2.  **Craft the Caption:** Write a short, punchy, clever caption. ${topicInstruction}
3.  **Meme Aesthetics:** Superimpose the caption onto the image using the classic "Impact" font (white text, heavy black border). Place it strategically to enhance the humor.
4.  **Output:** Your only output is the final meme image. Do not add commentary.${variationInstruction}`;
  }
};

const createStoryPrompt = (panelNumber: number, totalPanels: number, topic: string): string => {
  const topicInstruction = (topic && topic.trim() !== '') 
    ? `The story should be about: "${topic}".`
    : `The story should be something universally funny.`;

  const panelContext = {
    1: 'The first panel should introduce the character(s) and the setting from the image, establishing the beginning of the story.',
    2: 'This panel is the middle of the story. It should show a rising action, a problem, or a conflict.',
    3: 'This is the final panel. It should provide a resolution or a punchline to conclude the story.',
  }[panelNumber];

  return `You are a comic book artist creating a ${totalPanels}-panel comic strip.
**Mission:** Create panel ${panelNumber} of ${totalPanels}.
**Character Reference:** The provided image is your key reference for the main character. It may be a clean "digital twin" with a transparent background, which you should place into new scenes. Regardless, their appearance, clothing, and style MUST remain consistent with this reference image throughout the story. Do not change the character.
**Story Topic:** ${topicInstruction}
**Panel Task:** ${panelContext}
**Output:** Your only output is the final, high-quality image for this specific panel. Do not add panel numbers, text unrelated to the story, or explanations.`;
};


const generateSingleMemeInstance = async (
  images: UploadedImage[], 
  topic: string, 
  mode: MemeGenerationMode,
  templateImage: UploadedImage | null,
  variationHint?: string
): Promise<string | null> => {

  const imageParts = images.map(image => ({
    inlineData: { data: image.data, mimeType: image.mimeType },
  }));

  const parts = [];
  const dynamicPrompt = createPrompt(mode, topic, !!templateImage, variationHint);
  
  // The first part of the prompt is always text.
  parts.push({ text: dynamicPrompt });

  // For custom mode, the template image (Image 1) comes after the prompt.
  if (mode === 'custom' && templateImage) {
    parts.push({
      inlineData: { data: templateImage.data, mimeType: templateImage.mimeType },
    });
  }
  
  // The subject/character images (Image 2+) come last.
  parts.push(...imageParts);

  const contents = { parts };

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image-preview',
    contents: contents,
    config: {
      responseModalities: [Modality.IMAGE, Modality.TEXT],
    },
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData?.data && part.inlineData?.mimeType) {
      return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
    }
  }
  
  const responseText = response.text ?? '';
  if (responseText.trim() === '') {
    console.warn("API response was empty or did not contain an image part. This could be due to a safety policy violation.");
  } else {
    console.warn(`API returned text instead of an image: "${responseText.trim()}"`);
  }

  return null;
};

const generateStoryPanel = async (
  image: UploadedImage, 
  topic: string, 
  panelNumber: number,
  totalPanels: number
): Promise<string | null> => {
  const prompt = createStoryPrompt(panelNumber, totalPanels, topic);

  const contents = {
    parts: [
      { text: prompt },
      { inlineData: { data: image.data, mimeType: image.mimeType } },
    ]
  };

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image-preview',
    contents: contents,
    config: {
      responseModalities: [Modality.IMAGE, Modality.TEXT],
    },
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData?.data && part.inlineData?.mimeType) {
      return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
    }
  }
  
  const responseText = response.text ?? '';
  if (responseText.trim() === '') {
    console.warn(`API response for panel ${panelNumber} was empty. This could be due to a safety policy violation.`);
  } else {
    console.warn(`API for panel ${panelNumber} returned text instead of an image: "${responseText.trim()}"`);
  }

  return null;
}

export const generateMeme = async (
  images: UploadedImage[], 
  topic: string,
  mode: MemeGenerationMode,
  templateImage: UploadedImage | null
): Promise<string[]> => {
  if (mode === 'story') {
    const NUMBER_OF_PANELS = 3;
    const panelPromises: Promise<string | null>[] = [];
    const characterReferenceImage = images[0]; // Use the first image as the consistent reference

    if (!characterReferenceImage) {
      throw new Error("An image is required for story mode.");
    }

    for (let i = 1; i <= NUMBER_OF_PANELS; i++) {
        panelPromises.push(generateStoryPanel(characterReferenceImage, topic, i, NUMBER_OF_PANELS));
    }

    try {
        const results = await Promise.all(panelPromises);
        const successfulPanels = results.filter((panel): panel is string => panel !== null);

        if (successfulPanels.length === 0) {
            throw new Error("The AI failed to generate any story panels. This can happen due to safety policies or if the request is unclear. Try a different image or topic.");
        }
        return successfulPanels;
    } catch (error) {
        console.error("Error generating story panels:", error);
        if (error instanceof Error) {
            throw new Error(`Gemini API Error: ${error.message}`);
        }
        throw new Error("An unknown error occurred while communicating with the Gemini API.");
    }
  }

  const numberOfVariations = mode === 'custom' ? 1 : 3;
  const generationPromises: Promise<string | null>[] = [];

  // Add hints to encourage diverse outputs for modes that generate multiple variations.
  const variationHints = [
    "Make this version witty and clever.",
    "For this version, try a completely different style of humor, perhaps more absurd or unexpected.",
    "For this version, focus on a relatable, everyday scenario."
  ];

  for (let i = 0; i < numberOfVariations; i++) {
    // Pass a specific hint only for modes that are supposed to have variations.
    const hint = (mode === 'classic' || mode === 'popular') ? variationHints[i] : undefined;
    generationPromises.push(generateSingleMemeInstance(images, topic, mode, templateImage, hint));
  }

  try {
    const results = await Promise.all(generationPromises);
    const successfulMemes = results.filter((meme): meme is string => meme !== null);

    if (successfulMemes.length === 0) {
      throw new Error("The AI failed to generate any meme variations. This can happen due to safety policies or if the request is unclear. Try a different image or topic.");
    }

    return successfulMemes;
  } catch (error) {
    console.error("Error generating meme variations:", error);
    if (error instanceof Error) {
        throw new Error(`Gemini API Error: ${error.message}`);
    }
    throw new Error("An unknown error occurred while communicating with the Gemini API.");
  }
};
