
import React, { useState, useCallback } from 'react';
import { Header } from './components/Header';
import { ImageUploader } from './components/ImageUploader';
import { MemeDisplay } from './components/MemeDisplay';
import { Footer } from './components/Footer';
import { generateMeme, createDigitalTwin } from './services/geminiService';
import type { UploadedImage, MemeGenerationMode, DigitalTwinStyle } from './types';
import { fileToBase64, imageUrlToBase64 } from './utils/fileUtils';
import { MemeTopicInput } from './components/MemeTopicInput';
import { MemeModeSelector } from './components/MemeModeSelector';
import { TemplateUploader } from './components/TemplateUploader';
import { FullScreenViewer } from './components/FullScreenViewer';
import { DigitalTwinCreator } from './components/DigitalTwinCreator';
import { MemeTemplateLibrary } from './components/MemeTemplateLibrary';
import type { MemeTemplate } from './memeTemplates';

const App: React.FC = () => {
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [templateImage, setTemplateImage] = useState<UploadedImage | null>(null);
  const [generatedMemes, setGeneratedMemes] = useState<string[]>([]);
  const [selectedMeme, setSelectedMeme] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showConfetti, setShowConfetti] = useState<boolean>(false);
  const [memeTopic, setMemeTopic] = useState<string>('');
  const [memeMode, setMemeMode] = useState<MemeGenerationMode>('classic');
  const [fullscreenMemeIndex, setFullscreenMemeIndex] = useState<number | null>(null);
  const [digitalTwin, setDigitalTwin] = useState<UploadedImage | null>(null);
  const [isCreatingTwin, setIsCreatingTwin] = useState<boolean>(false);
  const [digitalTwinStyle, setDigitalTwinStyle] = useState<DigitalTwinStyle>('sticker');
  const [selectedTemplateUrl, setSelectedTemplateUrl] = useState<string | null>(null);

  const handleFilesSelect = useCallback(async (files: FileList) => {
    setIsLoading(true);
    setError(null);
    setGeneratedMemes([]);
    setSelectedMeme(null);
    try {
      const imagePromises = Array.from(files).map(fileToBase64);
      const newImages = await Promise.all(imagePromises);
      setUploadedImages(prevImages => [...prevImages, ...newImages]);
    } catch (err) {
      setError('Failed to process images. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleTemplateSelect = useCallback(async (file: File) => {
    setIsLoading(true);
    setError(null);
    setGeneratedMemes([]);
    setSelectedMeme(null);
    try {
      const newImage = await fileToBase64(file);
      setTemplateImage(newImage);
      setSelectedTemplateUrl(null); // Clear predefined selection
    } catch (err) {
      setError('Failed to process template image. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  const handlePredefinedTemplateSelect = useCallback(async (template: MemeTemplate) => {
    if (template.imageUrl === selectedTemplateUrl) {
      // If the same template is clicked again, deselect it.
      setTemplateImage(null);
      setSelectedTemplateUrl(null);
      return;
    }

    setIsLoading(true);
    setError(null);
    setGeneratedMemes([]);
    
    try {
      const newImage = await imageUrlToBase64(template.imageUrl);
      setTemplateImage(newImage);
      setSelectedTemplateUrl(template.imageUrl);
    } catch (err) {
      setError('Failed to load template image. Please try another one or upload your own. This might be a CORS issue.');
      console.error(err);
      setTemplateImage(null);
      setSelectedTemplateUrl(null);
    } finally {
      setIsLoading(false);
    }
  }, [selectedTemplateUrl]);

  const handleRemoveImage = useCallback((indexToRemove: number) => {
    setUploadedImages(prevImages => prevImages.filter((_, index) => index !== indexToRemove));
  }, []);

  const handleRemoveTemplate = useCallback(() => {
    setTemplateImage(null);
    setSelectedTemplateUrl(null);
    const templateInput = document.getElementById('template-upload') as HTMLInputElement;
    if (templateInput) templateInput.value = '';
  }, []);

  const handleCreateTwin = useCallback(async () => {
    if (uploadedImages.length === 0) {
        setError('Please upload an image first to create a twin.');
        return;
    }
    
    setIsCreatingTwin(true);
    setError(null);
    setDigitalTwin(null);

    try {
        // Use the most recently uploaded image as the source for the twin
        const sourceImage = uploadedImages[uploadedImages.length - 1];
        const resultUrl = await createDigitalTwin(sourceImage, digitalTwinStyle);
        
        if (resultUrl) {
            const parts = resultUrl.split(',');
            const mimeTypePart = parts[0].match(/:(.*?);/);
            const mimeType = mimeTypePart ? mimeTypePart[1] : sourceImage.mimeType;
            const base64Data = parts[1];

            if (!base64Data) throw new Error("Could not parse image data from AI response.");

            setDigitalTwin({ data: base64Data, mimeType });
        } else {
            throw new Error('The AI did not return an image for the Digital Twin.');
        }
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
        setError(`Digital Twin creation failed: ${errorMessage}`);
        console.error(err);
    } finally {
        setIsCreatingTwin(false);
    }
}, [uploadedImages, digitalTwinStyle]);

  const handleGenerateMeme = useCallback(async () => {
    const sourceImages = digitalTwin ? [digitalTwin] : uploadedImages;

    if (sourceImages.length === 0) {
      setError('Please upload at least one image first.');
      return;
    }
     if (memeTopic.trim() === '' && memeMode === 'custom') {
        setError(`An instruction is required for Custom Template mode.`);
        return;
    }
    if (memeMode === 'custom' && !templateImage) {
        setError('Please upload a meme template to use custom mode.');
        return;
    }

    setIsLoading(true);
    setError(null);
    setGeneratedMemes([]);
    setSelectedMeme(null);
    setShowConfetti(false);

    try {
      const results = await generateMeme(sourceImages, memeTopic, memeMode, templateImage);
      if (results && results.length > 0) {
        setGeneratedMemes(results);
        if (memeMode === 'custom' || memeMode === 'story') {
          setSelectedMeme(results[0]);
        }
        if (memeMode !== 'story' && memeMode !== 'custom') {
          setShowConfetti(true);
          setTimeout(() => setShowConfetti(false), 5000);
        }
      } else {
        throw new Error('The AI did not return any images. Please try a different source image or topic.');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setError(`Meme generation failed: ${errorMessage}`);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [uploadedImages, memeTopic, memeMode, templateImage, digitalTwin]);

  const handleClear = useCallback(() => {
    setUploadedImages([]);
    setGeneratedMemes([]);
    setSelectedMeme(null);
    setError(null);
    setIsLoading(false);
    setShowConfetti(false);
    setMemeTopic('');
    setTemplateImage(null);
    setSelectedTemplateUrl(null);
    setMemeMode('classic');
    setDigitalTwin(null);
    setDigitalTwinStyle('sticker');
    const fileInput = document.getElementById('file-upload') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
    const templateInput = document.getElementById('template-upload') as HTMLInputElement;
    if (templateInput) templateInput.value = '';
  }, []);
  
  const handleNextMeme = useCallback(() => {
    if (fullscreenMemeIndex !== null && fullscreenMemeIndex < generatedMemes.length - 1) {
        setFullscreenMemeIndex(fullscreenMemeIndex + 1);
    }
  }, [fullscreenMemeIndex, generatedMemes.length]);

  const handlePrevMeme = useCallback(() => {
    if (fullscreenMemeIndex !== null && fullscreenMemeIndex > 0) {
        setFullscreenMemeIndex(fullscreenMemeIndex - 1);
    }
  }, [fullscreenMemeIndex]);

  const getImageUploaderTitle = () => {
    switch (memeMode) {
      case 'story':
        return 'Upload Character Image';
      case 'custom':
        return 'Step 1: Upload Subject Image(s)';
      case 'popular':
        return 'Upload Image to Recreate';
      case 'classic':
      default:
        return 'Step 1: Upload Image(s)';
    }
  };

  const getDigitalTwinTitle = () => {
    const stepNumber = memeMode === 'custom' ? 3 : 2;
    switch (memeMode) {
      case 'story':
        return `Step ${stepNumber}: Create Character Model (Recommended)`;
      default:
        return `Step ${stepNumber}: Create a Digital Twin (Recommended)`;
    }
  };

  const getGenerateButtonText = () => {
    if (isLoading) return 'Summoning Genius...';
    if (isCreatingTwin) return 'Working...';
    if (memeMode === 'story') return 'Start Story';
    if (digitalTwin) return '✨ Generate with Twin';
    return '✨ Generate';
  }


  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col font-sans relative">
       {showConfetti && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
          {[...Array(100)].map((_, i) => (
            <div
              key={i}
              className="absolute bg-yellow-300 w-2 h-4 animate-confetti"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                transform: `rotate(${Math.random() * 360}deg)`,
                backgroundColor: ['#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5', '#2196f3', '#03a9f4', '#00bcd4', '#009688', '#4caf50', '#8bc34a', '#cddc39', '#ffeb3b', '#ffc107', '#ff9800', '#ff5722'][Math.floor(Math.random() * 16)],
              }}
            ></div>
          ))}
        </div>
      )}
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8 flex flex-col items-center">
        <div className="w-full max-w-4xl bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-2xl shadow-purple-500/10 p-6 md:p-8 border border-gray-700">
         
          <MemeModeSelector selectedMode={memeMode} onModeChange={setMemeMode} />
          
          {memeMode === 'custom' && (
            <>
              <MemeTemplateLibrary
                onSelectTemplate={handlePredefinedTemplateSelect}
                selectedTemplateUrl={selectedTemplateUrl}
                isLoading={isLoading}
              />
              <div className="relative flex py-5 items-center">
                <div className="flex-grow border-t border-gray-600"></div>
                <span className="flex-shrink mx-4 text-gray-400 font-semibold">OR</span>
                <div className="flex-grow border-t border-gray-600"></div>
              </div>
              <TemplateUploader
                onTemplateSelect={handleTemplateSelect}
                templateImage={templateImage}
                isLoading={isLoading || isCreatingTwin}
                onRemoveTemplate={handleRemoveTemplate}
              />
            </>
          )}

          <ImageUploader
            onFilesSelect={handleFilesSelect}
            uploadedImages={uploadedImages}
            isLoading={isLoading || isCreatingTwin}
            title={getImageUploaderTitle()}
            onRemoveImage={handleRemoveImage}
          />

          <DigitalTwinCreator
            isToggled={uploadedImages.length > 0}
            onTwinCreate={handleCreateTwin}
            onTwinRemove={() => setDigitalTwin(null)}
            twin={digitalTwin}
            isCreating={isCreatingTwin}
            isLoadingApp={isLoading}
            title={getDigitalTwinTitle()}
            selectedStyle={digitalTwinStyle}
            onStyleChange={setDigitalTwinStyle}
          />
          
          <MemeTopicInput
            value={memeTopic}
            onChange={setMemeTopic}
            isLoading={isLoading || isCreatingTwin}
            memeMode={memeMode}
          />

          <div className="mt-6 flex flex-col sm:flex-row gap-4">
            <button
              onClick={handleGenerateMeme}
              disabled={isLoading || isCreatingTwin || uploadedImages.length === 0}
              className="w-full sm:w-1/2 flex-grow bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-purple-500/50 shadow-lg"
            >
              {getGenerateButtonText()}
            </button>
             <button
              onClick={handleClear}
              disabled={isLoading || isCreatingTwin}
              className="w-full sm:w-1/2 flex-grow bg-gray-600 hover:bg-gray-700 disabled:bg-gray-500 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-gray-500/50 shadow-lg"
            >
              Clear
            </button>
          </div>

          <MemeDisplay
            memes={generatedMemes}
            selectedMeme={selectedMeme}
            onSelectMeme={setSelectedMeme}
            isLoading={isLoading}
            error={error}
            onOpenFullscreen={setFullscreenMemeIndex}
            memeMode={memeMode}
          />

        </div>
      </main>
      <Footer />
      {fullscreenMemeIndex !== null && (
        <FullScreenViewer 
          memeUrl={generatedMemes[fullscreenMemeIndex]} 
          onClose={() => setFullscreenMemeIndex(null)}
          onNext={handleNextMeme}
          onPrev={handlePrevMeme}
          showNavigation={(memeMode === 'story' || memeMode === 'classic' || memeMode === 'popular') && generatedMemes.length > 1}
          isFirst={fullscreenMemeIndex === 0}
          isLast={fullscreenMemeIndex === generatedMemes.length - 1}
        />
      )}
    </div>
  );
};

export default App;
