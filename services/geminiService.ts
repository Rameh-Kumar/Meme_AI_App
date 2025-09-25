
import { GoogleGenAI, Modality } from "@google/genai";
import type { UploadedImage, MemeGenerationMode, DigitalTwinStyle } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const getDigitalTwinPrompt = (style: DigitalTwinStyle): string => {
  const backgroundInstruction = `4.  **Isolate and Remove Background:** The background of the output image **must be transparent**. This is non-negotiable for the models to be versatile.`;
  
  const outputFormatInstruction = '6.  **Output Format:** Your **only** output must be the final, high-quality, high-resolution image containing all the processed subjects on a transparent background. Do not add any text, borders, watermarks, or other elements.';
  
  const baseInstructions = `You are an expert digital artist specializing in creating character models from images.
**Mission:** Analyze the user's uploaded image, identify **all** prominent subjects (e.g., people, animals), and create a single "digital twin" image asset containing all of them.

**Core Rules (Follow These Strictly):**
1.  **Identify ALL Subjects:** Do not pick one "main" subject. You must identify and process every clear person, animal, or primary object in the image.
2.  **Isolate and Preserve ALL Subjects:** Cut out all identified subjects from the background. Do not discard any of them. The final output image must contain all the subjects from the original, arranged naturally next to each other.
3.  **Complete the Subjects (Crucial):** If any subject is cropped (e.g., a headshot, waist-up), you **must creatively generate the rest of their body and clothing**. The goal is for every subject to be a complete, full-figure character in a neutral, standing pose. The generated parts must logically match the visible parts in style, clothing, and physique.
${backgroundInstruction}
5.  **Maintain Identity:** All subjects' faces, hair, and visible clothing must be 100% recognizable. The essence of the original subjects must be preserved.
${outputFormatInstruction}`;

  const styleInstructions = {
    sticker: `
**Style: Photorealistic Model**
- **Goal:** Create clean, high-quality, full-body photorealistic models of all subjects.
- **Execution:** Generate the full figure for every subject. Clean up any artifacts from the original image, improve lighting slightly to make them pop, and enhance details. The style should be photorealistic but hyper-clean, as if they are premium digital assets.`,
    '3d_model': `
**Style: 3D Animated Model**
- **Goal:** Recreate all subjects as high-quality, full-body 3D rendered models, similar to characters from a modern animated film (e.g., Pixar, DreamWorks).
- **Execution:** Generate the full figure for every subject. Give them volume, cinematic lighting, and detailed textures (e.g., fabric, skin, fur). The final render should look like a professional character model from a major animation studio.`,
    cartoon: `
**Style: 2D Cartoon**
- **Goal:** Transform all subjects into vibrant, full-body 2D cartoon characters.
- **Execution:** Generate the full figure for every subject. Use bold outlines, simplified cel-shading, and slightly exaggerated features, in the style of modern American animation. The characters should be expressive and full of personality.`,
    pixel_art: `
**Style: 16-Bit Pixel Art**
- **Goal:** Convert all subjects into detailed, full-body 16-bit pixel art sprites.
- **Execution:** Generate the full figure for every subject. Recreate them using a limited but effective color palette, reminiscent of classic SNES or Sega Genesis video games. Ensure clean pixel lines and clear, readable silhouettes. Avoid anti-aliasing; the pixels should be sharp.`,
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
      const customUserInstruction = (topic && topic.trim() !== '')
        ? `The user has provided these instructions: "${topic}". Interpret these instructions to guide the visual recreation (like swapping characters or changing actions) and to inspire new text content if the template has text.`
        : `The user has not provided specific instructions. Your main task is to replace a key character in the template with the provided subject. Match the pose, expression, and lighting as closely as possible.`;

      return `You are a master digital artist and meme director. The absolute priority is the seamless visual integration of the character into the scene.

**Mission:** Recreate a meme scene from a "Template Image," recasting or adding the "Subject/Character Model" based on user instructions.

**User's Goal:** ${customUserInstruction}

**Inputs (in order):**
1.  **Image 1 (The Template):** Your reference for the scene, composition, mood, and style.
2.  **Image 2 (The Subject/Character Model):** The new star of the meme. Treat this as a **virtual actor**, NOT a static image to be pasted.

**Primary Goal:** Generate a **brand-new image from scratch** that is a high-fidelity recreation of the template's scene, but with the new subject seamlessly integrated and *acting out the role* as described by the user or implied by the template.

**CRITICAL Directives:**
1.  **Recreate, Don't Edit:** Do NOT simply paste the subject onto the template. Redraw the entire scene so the final output looks like a single, cohesive photograph or illustration.
2.  **Animate the Virtual Actor (Most Important Rule):** The subject **must** replace an original character or be placed logically into the scene. You **must change the subject's pose, expression, and actions** to perfectly match what the original character was doing or what the user instructed. This transformation is the core of the task.
3.  **Fidelity to the Scene:** The recreated environment, lighting, and camera angle must be instantly recognizable from the template.
4.  **Handle Text Conditionally (Crucial):**
    - **First, analyze the Template Image.** Does it contain any text or captions?
    - **If the Template Image has NO TEXT:** Your final output image must also have **NO TEXT**. Do not add any captions, even if the user provides instructions that look like text. The humor must come purely from the visual recreation.
    - **If the Template Image HAS TEXT:** Recreate the text in a similar style and position. Use the user's instructions as inspiration for the content of the text. If the user's instructions are purely visual, create a new, funny caption that fits the meme's original format.
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

const createStoryPrompt = (panelNumber: number, totalPanels: number, topic: string, hasPreviousPanel: boolean): string => {
  const topicInstruction = (topic && topic.trim() !== '') 
    ? `The overall story theme is: "${topic}".`
    : `The user has not provided a theme, so you must invent a short, universally funny story from scratch.`;

  let panelContext = '';
  switch (panelNumber) {
    case 1:
      panelContext = 'The first panel should introduce the character(s) and the setting, establishing the beginning of the story.';
      break;
    case 2:
      panelContext = 'This panel is the middle of the story. It should show a rising action, a problem, or a conflict.';
      break;
    case 3:
      panelContext = 'This panel continues the story, building towards the conclusion.';
      break;
    case 4:
      panelContext = 'This is the final panel. It should provide a resolution or a punchline to conclude the story.';
      break;
  }
  
  const contextInstruction = hasPreviousPanel
    ? `**Story Context:** The THIRD image provided is the previous panel of the comic. Use it as a direct visual and narrative continuation point for the new panel you are creating. The story must flow logically from that image.`
    : '';

  return `You are a comic book artist creating a ${totalPanels}-panel comic strip.
**Mission:** Create panel ${panelNumber} of ${totalPanels}.
**Character Reference:** The SECOND image provided is your key reference for the main character. It may be a clean "digital twin" with a transparent background, which you should place into new scenes. Regardless, their appearance, clothing, and style MUST remain consistent with this reference image throughout the story. Do not change the character.
${contextInstruction}
**Story Topic:** ${topicInstruction}
**Panel Task:** ${panelContext}
**Style:** Create a visually interesting comic panel with speech bubbles if dialogue is needed. Ensure the style is consistent with any previous panels.
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

export const generateStoryPanel = async (
  characterImage: UploadedImage, 
  topic: string, 
  panelNumber: number,
  totalPanels: number,
  previousPanel: UploadedImage | null
): Promise<string | null> => {
  const prompt = createStoryPrompt(panelNumber, totalPanels, topic, !!previousPanel);

  const parts = [];
  parts.push({ text: prompt });
  parts.push({ inlineData: { data: characterImage.data, mimeType: characterImage.mimeType } });
  if (previousPanel) {
    parts.push({ inlineData: { data: previousPanel.data, mimeType: previousPanel.mimeType } });
  }

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
    const characterReferenceImage = images[0];
    if (!characterReferenceImage) {
      throw new Error("An image is required for story mode.");
    }

    const panels: string[] = [];
    let previousPanel: UploadedImage | null = null;
    const totalPanels = 4;

    for (let i = 1; i <= totalPanels; i++) {
        const panelResult = await generateStoryPanel(characterReferenceImage, topic, i, totalPanels, previousPanel);
        
        if (panelResult) {
            panels.push(panelResult);

            // Prepare previousPanel for the next iteration
            const mimeTypeMatch = panelResult.match(/data:(.*);base64,/);
            const mimeType = mimeTypeMatch ? mimeTypeMatch[1] : 'image/png';
            const base64Data = panelResult.split(',')[1];
            if (base64Data) {
              previousPanel = { data: base64Data, mimeType };
            } else {
              // This case is unlikely but good to handle. Stop if data is malformed.
              throw new Error(`Failed to process the result for panel ${i}.`);
            }
        } else {
            // If any panel fails, we stop and throw an error.
            throw new Error(`The AI failed to generate panel ${i} of the story.`);
        }
    }
    
    if (panels.length === totalPanels) {
        return panels;
    }

    // This should ideally not be reached if the loop logic is correct.
    throw new Error("The AI failed to generate the complete story.");
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
