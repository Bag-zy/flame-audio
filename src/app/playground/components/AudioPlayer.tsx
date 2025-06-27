'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Download, RefreshCw } from 'lucide-react';

interface AudioPlayerProps {
  audioData: string;
  fileName?: string;
}

export function AudioPlayer({ audioData, fileName = 'audio.wav' }: AudioPlayerProps) {
  const [error, setError] = useState<string | null>(null);
  const [wavUrl, setWavUrl] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  
  // Convert PCM to WAV format
  const convertPCMToWAV = (pcmData: string) => {
    const pcmBuffer = Uint8Array.from(atob(pcmData), c => c.charCodeAt(0));
    const sampleRate = 24000;
    const numChannels = 1;
    const bitsPerSample = 16;
    const byteRate = sampleRate * numChannels * bitsPerSample / 8;
    const blockAlign = numChannels * bitsPerSample / 8;
    const dataSize = pcmBuffer.length;
    const fileSize = 36 + dataSize;
    
    const wavBuffer = new ArrayBuffer(44 + dataSize);
    const view = new DataView(wavBuffer);
    
    // WAV header
    const writeString = (offset: number, string: string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };
    
    writeString(0, 'RIFF');
    view.setUint32(4, fileSize, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, byteRate, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, bitsPerSample, true);
    writeString(36, 'data');
    view.setUint32(40, dataSize, true);
    
    // Copy PCM data
    const wavData = new Uint8Array(wavBuffer);
    wavData.set(pcmBuffer, 44);
    
    return wavData;
  };
  
  // Convert PCM to WAV and create URL when audioData changes
  useEffect(() => {
    if (audioData) {
      try {
        const wavData = convertPCMToWAV(audioData);
        const blob = new Blob([wavData], { type: 'audio/wav' });
        const url = URL.createObjectURL(blob);
        setWavUrl(url);
        setError(null);
        
        return () => {
          URL.revokeObjectURL(url);
        };
      } catch (err) {
        console.error('Error converting PCM to WAV:', err);
        setError('Failed to convert audio data');
      }
    }
  }, [audioData]);
  
  // Handle download
  const handleDownload = () => {
    if (wavUrl) {
      try {
        const link = document.createElement('a');
        link.href = wavUrl;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (err) {
        console.error('Error downloading audio:', err);
        setError('Failed to download audio file');
      }
    }
  };
  
  // Handle retry
  const handleRetry = () => {
    setError(null);
    if (audioRef.current) {
      audioRef.current.load();
    }
  };

  return (
    <div className="p-4 bg-card rounded-lg border border-border">
      {error ? (
        <div className="p-3 mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300">
          <p className="mb-2">{error}</p>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRetry}
            className="flex items-center space-x-1"
          >
            <RefreshCw className="h-4 w-4 mr-1" />
            <span>Retry</span>
          </Button>
        </div>
      ) : (
        <>
          {wavUrl && (
            <audio 
              ref={audioRef}
              controls 
              className="w-full mb-4"
              src={wavUrl}
              onLoadedData={() => {
                console.log('Audio loaded successfully');
              }}
              onError={() => {
                setError('Failed to load audio. The audio data may be invalid.');
              }}
            >
              Your browser does not support the audio element.
            </audio>
          )}
          <div className="text-xs text-gray-500 mb-2">
            If audio doesn't play, try downloading and playing it locally.
          </div>
        </>
      )}
      
      <div className="flex justify-end">
        <Button
          variant="outline"
          size="sm"
          onClick={handleDownload}
          className="flex items-center space-x-1"
          disabled={!!error}
        >
          <Download className="h-4 w-4 mr-1" />
          <span>Download</span>
        </Button>
      </div>
    </div>
  );
}