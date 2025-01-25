"use client";

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion } from 'framer-motion';
import { FaCloudUploadAlt, FaDownload, FaPalette } from 'react-icons/fa';
import { SketchPicker } from 'react-color';

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [processedImage, setProcessedImage] = useState(null);
  const [color, setColor] = useState('#ffffff');
  const [showColorPicker, setShowColorPicker] = useState(false);

  const onDrop = useCallback(async (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file) {
      setIsLoading(true);
      const formData = new FormData();
      formData.append('image', file);
      formData.append('color', color);

      try {
        const response = await fetch('/api/remove-bg', {
          method: 'POST',
          body: formData,
        });

        if (response.ok) {
          const blob = await response.blob();
          const url = URL.createObjectURL(blob);
          setProcessedImage(url);
        } else {
          console.error('Error processing image:', response.statusText);
        }
      } catch (error) {
        console.error('Error processing image:', error);
      } finally {
        setIsLoading(false);
      }
    }
  }, [color]);

  const { getRootProps, getInputProps } = useDropzone({ onDrop, accept: 'image/*' });

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-purple-100 text-purple-900">
      <motion.div
        className="bg-white bg-opacity-90 backdrop-blur-md p-8 rounded-lg shadow-lg max-w-md w-full"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold mb-4 text-center">Remove Background from Image</h1>
        <div
          {...getRootProps()}
          className="flex flex-col items-center justify-center p-6 mb-4 border-2 border-dashed border-purple-300 rounded-md text-purple-700 bg-white bg-opacity-50 cursor-pointer"
        >
          <input {...getInputProps()} />
          <FaCloudUploadAlt className="text-4xl text-purple-500 mb-2" />
          <p>Drag & drop an image here, or click to select one</p>
        </div>
        <div className="flex items-center justify-center mb-4">
          <button
            onClick={() => setShowColorPicker(!showColorPicker)}
            className="flex items-center justify-center p-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md"
          >
            <FaPalette className="mr-2" />
            {showColorPicker ? 'Hide Color Picker' : 'Show Color Picker'}
          </button>
        </div>
        {showColorPicker && (
          <div className="flex justify-center mb-4">
            <SketchPicker
              color={color}
              onChangeComplete={(newColor) => setColor(newColor.hex)}
            />
          </div>
        )}
        <p className="text-center mt-2">This is a beta application. It may contain bugs or other issues.</p>

        {processedImage && (
          <motion.div
            className="mt-4 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-xl mb-2">Processed Image</h2>
            <img src={processedImage} alt="Processed" className="max-w-full border border-purple-300 rounded-md mb-2 bg-white" />
            <a
              href={processedImage}
              download="processed-image.png"
              className="flex justify-center items-center text-purple-200 font-bold inline-block bg-purple-600 hover:bg-purple-700 transition-colors p-2 rounded-md"
            >
              <FaDownload className="inline-block mr-2" />
              Download Image
            </a>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
