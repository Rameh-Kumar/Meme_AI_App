
import { GoogleGenAI, Modality } from "@google/genai";
import type { UploadedImage, MemeGenerationMode } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const createDigitalTwin = async (image: UploadedImage): Promise<string | null> => {
  const prompt = `You are an expert digital artist specializing in creating character models.
**Mission:** Analyze the user's uploaded image and create a "digital twin" of the main subject.

**Instructions:**
1.  **Identify the Main Subject:** Accurately identify the primary person, animal, or object in the image.
2.  **Isolate and Remove Background:** Carefully cut out the subject from its original background. The background of the output image must be transparent.
3.  **Enhance and Clean:** Clean up any artifacts, improve lighting slightly, and enhance details to make the subject look like a high-quality digital asset or sticker. The style should be photorealistic but clean, as if it's ready to be composited into a new scene.
4.  **Maintain Identity:** The subject must remain 100% recognizable. Do not change its core features, clothing, or expression unless it's to improve clarity.
5.  **Output:** Your only output is the final, high-quality image of the isolated subject. Do not add any text, borders, or other elements.`;

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


const createPrompt = (mode: MemeGenerationMode, topic?: string, hasTemplate?: boolean): string => {
  const topicInstruction = (topic && topic.trim() !== '') 
    ? `The user wants the meme to be about: "${topic}". Use this as your primary inspiration.`
    : `The user has not provided a specific topic, so use your expert judgment to make it universally funny.`;

  switch (mode) {
    case 'popular':
      return `You are a meme expert who recreates images in the style of popular meme formats.
**Mission:** Analyze the user's image and reimagine it as a famous meme. The user may provide a clean "digital twin" with a transparent background; if so, seamlessly integrate it.
**Instructions:**
1.  **Identify the Core Concept:** Look at the user's image. What's the mood, the action, the subject?
2.  **Select a Matching Meme Format:** Choose a well-known meme template that fits the user's image concept (e.g., "Distracted Boyfriend," "Woman Yelling at a Cat," "Is This a Pigeon?").
3.  **Recreate, Don't Just Caption:** Redraw or artistically reinterpret the user's image to perfectly match the style and composition of the chosen meme format. The original subject(s) must be recognizable but transformed into the meme's world.
4.  **Add Witty Text:** Add a caption that is hilarious in the context of the new format. ${topicInstruction}
5.  **Output:** Your only output is the final, high-quality meme image. Do not explain your choice or add extra text.`;

    case 'custom':
      return `You are a world-class digital artist and photo editor, specializing in creating photorealistic composites for memes. Your work is undetectable.
**Mission:** Perfectly integrate a user's subject into a meme template by replacing the template's main character.

**Important Note:** The user may provide a clean "digital twin" of the subject image with a transparent background. If this is provided, prioritize using this high-quality asset for a seamless integration.

**Core Instructions:**

1.  **Comprehensive Character Replacement:**
    *   **Identify the Main Character:** Analyze the template to identify the primary person or character being featured.
    *   **Full Replacement:** Your main goal is to replace **every instance** of this main character with the subject from the user's uploaded image (or their digital twin). If the template is a multi-panel comic or shows the character in different poses, the user's subject must replace them in **all** of those locations to maintain the meme's narrative consistency.
    *   **Preserve the Scene:** The background, context, and other elements of the template must remain unchanged. You are only swapping the main character.

2.  **Aesthetic Matching (TOP PRIORITY):** The visual integration must be FLAWLESS and utterly convincing. This is your most important task.
    *   **Lighting and Shadows:** The subject must be lit identically to how the original character was lit in the template, casting perfectly matching, realistic shadows.
    *   **Color Grading:** The subject's colors must be meticulously adjusted to blend into the color palette and mood of the template image.
    *   **Perspective and Scale:** The subject must be scaled and positioned with perfect accuracy within the scene's perspective.
    *   **Image Quality:** Precisely match the grain, focus, compression artifacts, and overall quality of the template image. The final image should look like a single, untouched photograph.

3.  **Text Handling:**
    *   The template may already contain text. Your primary goal is the visual integration.
    *   **Do not add or modify text unless it is absolutely essential to complete the joke.** If the visual replacement of the subject *is* the entire joke, leave the original text as-is.
    *   ${topicInstruction}

4.  **Output:**
    *   Your only output is the final, masterfully edited meme image. Do not include any commentary, explanations, or extra text outside the image.`;
    
    case 'classic':
    default:
      return `You are a legendary meme creator.
**Mission:** Create a hilarious meme by adding a caption to the provided image.
**Instructions:**
1.  **Analyze the Visuals:** Scrutinize the image for expressions, actions, and objects. The user might provide a "digital twin" with a transparent background; feel free to place it in a simple, funny context or background before adding text.
2.  **Craft the Caption:** Write a short, punchy, clever caption. ${topicInstruction}
3.  **Meme Aesthetics:** Superimpose the caption onto the image using the classic "Impact" font (white text, heavy black border). Place it strategically to enhance the humor.
4.  **Output:** Your only output is the final meme image. Do not add commentary.`;
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
  templateImage: UploadedImage | null
): Promise<string | null> => {

  const imageParts = images.map(image => ({
    inlineData: { data: image.data, mimeType: image.mimeType },
  }));

  const parts = [];
  const dynamicPrompt = createPrompt(mode, topic, !!templateImage);
  parts.push({ text: dynamicPrompt });

  // For custom mode, the template comes first.
  if (mode === 'custom' && templateImage) {
    parts.push({
      inlineData: { data: templateImage.data, mimeType: templateImage.mimeType },
    });
  }
  
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

  const NUMBER_OF_VARIATIONS = 3;
  const generationPromises: Promise<string | null>[] = [];

  for (let i = 0; i < NUMBER_OF_VARIATIONS; i++) {
    generationPromises.push(generateSingleMemeInstance(images, topic, mode, templateImage));
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
