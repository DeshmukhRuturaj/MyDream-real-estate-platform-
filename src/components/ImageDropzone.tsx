import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { X, Upload } from 'lucide-react';

interface ImageDropzoneProps {
  onImagesChange: (files: File[]) => void;
  maxFiles?: number;
  maxSize?: number; // in bytes
}

export function ImageDropzone({ 
  onImagesChange, 
  maxFiles = 10,
  maxSize = 5 * 1024 * 1024 // 5MB default
}: ImageDropzoneProps) {
  const [previewImages, setPreviewImages] = useState<{ file: File; preview: string }[]>([]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    // Create preview URLs for accepted files
    const newPreviews = acceptedFiles.map(file => ({
      file,
      preview: URL.createObjectURL(file)
    }));

    // Update previews (limited to maxFiles)
    setPreviewImages(prev => {
      const combined = [...prev, ...newPreviews];
      const limited = combined.slice(0, maxFiles);
      return limited;
    });

    // Notify parent component of file changes
    onImagesChange(acceptedFiles);
  }, [maxFiles, onImagesChange]);

  const removeImage = (index: number) => {
    setPreviewImages(prev => {
      const newPreviews = [...prev];
      // Revoke the URL to prevent memory leaks
      URL.revokeObjectURL(newPreviews[index].preview);
      newPreviews.splice(index, 1);
      // Notify parent component of file changes
      onImagesChange(newPreviews.map(p => p.file));
      return newPreviews;
    });
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
    },
    maxSize,
    maxFiles: maxFiles - previewImages.length,
  });

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
          ${isDragActive 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 hover:border-blue-500 hover:bg-gray-50'}`}
      >
        <input {...getInputProps()} />
        <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
        {isDragActive ? (
          <p className="text-blue-500">Drop the images here...</p>
        ) : (
          <div className="space-y-2">
            <p className="text-gray-600">
              Drag & drop images here, or click to select
            </p>
            <p className="text-sm text-gray-500">
              Supported formats: JPEG, PNG, GIF, WebP
              <br />
              Max size: {(maxSize / (1024 * 1024)).toFixed(0)}MB
              <br />
              Max files: {maxFiles}
            </p>
          </div>
        )}
      </div>

      {previewImages.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {previewImages.map((image, index) => (
            <div key={image.preview} className="relative group">
              <img
                src={image.preview}
                alt={`Preview ${index + 1}`}
                className="w-full h-32 object-cover rounded-lg"
              />
              <button
                onClick={() => removeImage(index)}
                className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 