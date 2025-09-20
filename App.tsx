
import React, { useState, useCallback } from 'react';
import { Header } from './components/Header';
import { ImageUploader } from './components/ImageUploader';
import { MemeDisplay } from './components/MemeDisplay';
import { Footer } from './components/Footer';
import { generateMeme } from './services/geminiService';
import type { UploadedImage, MemeGenerationMode } from './types';
import { fileToBase64 } from './utils/fileUtils';
import { MemeTopicInput } from './components/MemeTopicInput';
import { MemeModeSelector } from './components/MemeModeSelector';
import { TemplateUploader } from './components/TemplateUploader';
import { FullScreenViewer } from './components/FullScreenViewer';

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
  const [fullscreenMeme, setFullscreenMeme] = useState<string | null>(null);

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
    } catch (err) {
      setError('Failed to process template image. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleRemoveImage = useCallback((indexToRemove: number) => {
    setUploadedImages(prevImages => prevImages.filter((_, index) => index !== indexToRemove));
  }, []);

  const handleRemoveTemplate = useCallback(() => {
    setTemplateImage(null);
    const templateInput = document.getElementById('template-upload') as HTMLInputElement;
    if (templateInput) templateInput.value = '';
  }, []);

  const handleGenerateMeme = useCallback(async () => {
    if (uploadedImages.length === 0) {
      setError('Please upload at least one image first.');
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
      const results = await generateMeme(uploadedImages, memeTopic, memeMode, templateImage);
      if (results && results.length > 0) {
        setGeneratedMemes(results);
        // Only show confetti for meme variations, not for story panels
        if (memeMode !== 'story') {
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
  }, [uploadedImages, memeTopic, memeMode, templateImage]);

  const handleClear = useCallback(() => {
    setUploadedImages([]);
    setGeneratedMemes([]);
    setSelectedMeme(null);
    setError(null);
    setIsLoading(false);
    setShowConfetti(false);
    setMemeTopic('');
    setTemplateImage(null);
    setMemeMode('classic');
    const fileInput = document.getElementById('file-upload') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
    const templateInput = document.getElementById('template-upload') as HTMLInputElement;
    if (templateInput) templateInput.value = '';
  }, []);
  
  const getImageUploaderTitle = () => {
    switch (memeMode) {
      case 'story':
        return 'Upload Character Image';
      case 'custom':
        return 'Upload Subject Image(s)';
      case 'popular':
        return 'Upload Image to Recreate';
      case 'classic':
      default:
        return 'Upload Image(s)';
    }
  };


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
            <TemplateUploader
              onTemplateSelect={handleTemplateSelect}
              templateImage={templateImage}
              isLoading={isLoading}
              onRemoveTemplate={handleRemoveTemplate}
            />
          )}

          <ImageUploader
            onFilesSelect={handleFilesSelect}
            uploadedImages={uploadedImages}
            isLoading={isLoading}
            title={getImageUploaderTitle()}
            onRemoveImage={handleRemoveImage}
          />
          
          <MemeTopicInput
            value={memeTopic}
            onChange={setMemeTopic}
            isLoading={isLoading}
          />

          <div className="mt-6 flex flex-col sm:flex-row gap-4">
            <button
              onClick={handleGenerateMeme}
              disabled={isLoading || uploadedImages.length === 0}
              className="w-full sm:w-1/2 flex-grow bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-purple-500/50 shadow-lg"
            >
              {isLoading ? 'Summoning Genius...' : '✨ Generate'}
            </button>
             <button
              onClick={handleClear}
              disabled={isLoading && uploadedImages.length === 0}
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
            onOpenFullscreen={setFullscreenMeme}
            memeMode={memeMode}
          />
        </div>
      </main>
      <Footer />
      {fullscreenMeme && (
        <FullScreenViewer 
          memeUrl={fullscreenMeme} 
          onClose={() => setFullscreenMeme(null)} 
        />
      )}
    </div>
  );
};

export default App;
