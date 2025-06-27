'use client';

import { useCallback, useState, useRef, ChangeEvent, DragEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/ui/icons';

interface FileUploaderProps {
  onFileSelect: (file: File) => void;
  disabled?: boolean;
  acceptedFormats?: string;
  maxSizeMB?: number;
  className?: string;
  children?: React.ReactNode;
}

export function FileUploader({ 
  onFileSelect, 
  disabled = false, 
  acceptedFormats = 'audio/*,video/*',
  maxSizeMB = 50,
  className = '',
  children
}: FileUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getAcceptedFormatsText = () => {
    if (acceptedFormats.includes('*')) return 'any file type';
    return acceptedFormats
      .split(',')
      .map(f => f.trim().split('/').pop()?.toUpperCase())
      .filter(Boolean)
      .join(', ');
  };

  const validateFile = (file: File): boolean => {
    setError(null);
    
    // Check file size
    if (file.size > maxSizeMB * 1024 * 1024) {
      setError(`File is too large. Maximum size is ${maxSizeMB}MB.`);
      return false;
    }

    // Log file info for debugging
    console.log('File type:', file.type);
    console.log('File name:', file.name);
    
    // Check file type - handle common audio formats explicitly
    const fileExt = file.name.split('.').pop()?.toLowerCase();
    const acceptedExts = ['wav', 'mp3', 'aiff', 'aac', 'ogg', 'flac'];
    
    // Accept by MIME type or file extension
    const isAcceptedMime = file.type.startsWith('audio/');
    const isAcceptedExt = fileExt && acceptedExts.includes(fileExt);
    
    if (!isAcceptedMime && !isAcceptedExt) {
      setError(`Unsupported file type. Please upload WAV, MP3, AIFF, AAC, OGG, FLAC.`);
      return false;
    }

    return true;
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && validateFile(file)) {
      onFileSelect(file);
    }
    // Reset the input value to allow selecting the same file again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDrop = useCallback((event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    
    const file = event.dataTransfer.files?.[0];
    if (file && validateFile(file)) {
      onFileSelect(file);
    }
  }, [onFileSelect]);

  const handleDragOver = useCallback((event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (!isDragging) setIsDragging(true);
  }, [isDragging]);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleButtonClick = () => {
    if (fileInputRef.current && !disabled) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className={className}>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept={acceptedFormats}
        className="hidden"
        disabled={disabled}
      />
      
      <div 
        className={`relative rounded-xl border-2 border-dashed transition-all duration-200 ${
          isDragging 
            ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/20' 
            : 'border-border hover:border-gray-300 dark:hover:border-gray-600 bg-card'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} ${className}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={!children ? handleButtonClick : undefined}
      >
        {children || (
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <div className={`p-3 rounded-full mb-4 transition-colors ${
              isDragging ? 'bg-blue-100 dark:bg-blue-900/30' : 'bg-muted'
            }`}>
              <Icons.uploadCloud className={`h-8 w-8 ${
                isDragging ? 'text-blue-500' : 'text-muted-foreground'
              }`} />
            </div>
            
            <h3 className="text-lg font-medium text-foreground mb-1">
              {isDragging ? 'Drop your file here' : 'Drag & drop a file or click to browse'}
            </h3>
            
            <p className="text-sm text-muted-foreground max-w-xs">
              {acceptedFormats.includes('*') 
                ? 'Supports any file type' 
                : `Supports: ${getAcceptedFormatsText()}`}
              {maxSizeMB && ` • Max ${maxSizeMB}MB`}
            </p>
            
            <Button 
              type="button" 
              variant="outline"
              size="sm"
              className="mt-4"
              disabled={disabled}
              onClick={(e) => {
                e.stopPropagation();
                handleButtonClick();
              }}
            >
              Select File
            </Button>
          </div>
        )}
        
        {isDragging && (
          <div className="absolute inset-0 bg-blue-50/30 dark:bg-blue-900/20 rounded-lg pointer-events-none flex items-center justify-center">
            <div className="bg-background p-2 rounded-md shadow-lg border border-blue-100 dark:border-blue-800">
              <Icons.uploadCloud className="h-6 w-6 text-blue-500 mx-auto mb-1" />
              <span className="text-sm text-blue-600 font-medium">Drop to upload</span>
            </div>
          </div>
        )}
      </div>
      
      {error && (
        <div className="mt-2 flex items-center text-sm text-red-600">
          <Icons.alertCircle className="h-4 w-4 mr-1.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
