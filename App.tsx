
import React, { useState, useCallback } from 'react';
import { Header } from './components/Header';
import { ImageUploader } from './components/ImageUploader';
import { DescriptionDisplay } from './components/DescriptionDisplay';
import { Spinner } from './components/Spinner';
import { Footer } from './components/Footer';
import { describeImage } from './services/geminiService';
import { PhotoIcon, SparklesIcon } from './components/Icons';

interface ImageState {
  file: File;
  base64: string;
}

const App: React.FC = () => {
    const [image, setImage] = useState<ImageState | null>(null);
    const [description, setDescription] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');

    const handleImageUpload = useCallback((file: File) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64String = (reader.result as string).split(',')[1];
            setImage({ file, base64: base64String });
            setDescription('');
            setError('');
        };
        reader.onerror = () => {
            setError('Failed to read the image file.');
        };
        reader.readAsDataURL(file);
    }, []);

    const handleDescribe = async () => {
        if (!image) {
            setError('Please upload an image first.');
            return;
        }

        setIsLoading(true);
        setError('');
        setDescription('');

        try {
            const prompt = "You are an expert image analyst. Describe this image in detail. Identify the main subjects, the setting, any significant objects, and infer the context or mood of the scene.";
            const result = await describeImage(image.base64, image.file.type, prompt);
            if (result.startsWith('Error:')) {
                setError(result);
            } else {
                setDescription(result);
            }
        } catch (e) {
            const errorMessage = e instanceof Error ? e.message : 'An unexpected error occurred.';
            setError(`Failed to generate description: ${errorMessage}`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 font-sans">
            <Header />
            <main className="flex-grow container mx-auto p-4 sm:p-6 lg:p-8 flex items-center justify-center">
                <div className="w-full max-w-2xl bg-white dark:bg-gray-900 rounded-2xl shadow-xl transition-all duration-300 p-8 space-y-6">
                    <div className="text-center">
                        <PhotoIcon className="mx-auto h-12 w-12 text-brand-secondary" />
                        <h2 className="mt-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Upload Your Photo</h2>
                        <p className="mt-2 text-md text-gray-600 dark:text-gray-400">Let AI reveal the story behind your image.</p>
                    </div>

                    <ImageUploader onImageUpload={handleImageUpload} selectedImage={image?.file || null} />
                    
                    <button
                        onClick={handleDescribe}
                        disabled={!image || isLoading}
                        className="w-full flex justify-center items-center gap-2 rounded-lg bg-brand-primary px-4 py-3 text-sm font-semibold text-white shadow-md hover:bg-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-secondary focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200"
                    >
                        {isLoading ? (
                            <>
                                <Spinner />
                                Analyzing...
                            </>
                        ) : (
                             <>
                                <SparklesIcon className="w-5 h-5" />
                                Describe Photo
                             </>
                        )}
                    </button>
                    
                    {error && (
                        <div className="bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg text-center" role="alert">
                            <strong className="font-bold">Oops! </strong>
                            <span className="block sm:inline">{error}</span>
                        </div>
                    )}

                    {description && <DescriptionDisplay description={description} />}

                </div>
            </main>
            <Footer />
        </div>
    );
};

export default App;
