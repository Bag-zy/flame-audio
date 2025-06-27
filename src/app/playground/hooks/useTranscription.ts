import { useState, useCallback } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { v4 as uuidv4 } from 'uuid';

interface TranscriptionOptions {
  task: 'transcribe' | 'translate';
  language?: string;
  model: string;
  chunkLength?: number;
  overlap?: number;
  temperature?: number;
  enableSpeakerDiarization?: boolean;
  enablePunctuation?: boolean;
  enableNumberFormatting?: boolean;
}

interface TranscriptionResult {
  id: string;
  text: string;
  language?: string;
  duration?: number;
  segments?: Array<{
    id: number;
    start: number;
    end: number;
    text: string;
    speaker?: string;
  }>;
  word_segments?: Array<{
    word: string;
    start: number;
    end: number;
    confidence: number;
  }>;
  model: string;
  processingTime?: number;
  createdAt: Date;
}

interface UseTranscriptionReturn {
  isTranscribing: boolean;
  progress: number;
  currentChunk: number;
  totalChunks: number;
  result: TranscriptionResult | null;
  error: string | null;
  transcribeAudio: (file: File, options: TranscriptionOptions) => Promise<TranscriptionResult | null>;
  resetTranscription: () => void;
}

const useTranscription = (): UseTranscriptionReturn => {
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentChunk, setCurrentChunk] = useState(0);
  const [totalChunks, setTotalChunks] = useState(0);
  const [result, setResult] = useState<TranscriptionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Reset the transcription state
  const resetTranscription = useCallback(() => {
    setIsTranscribing(false);
    setProgress(0);
    setCurrentChunk(0);
    setTotalChunks(0);
    setResult(null);
    setError(null);
  }, []);

  // Process a single audio chunk
  const processChunk = async (
    chunk: Blob,
    options: TranscriptionOptions,
    chunkIndex: number,
    totalChunks: number
  ): Promise<TranscriptionResult> => {
    const formData = new FormData();
    formData.append('file', chunk, 'audio_chunk.wav');
    formData.append('model', options.model);
    formData.append('task', options.task);
    
    if (options.language && options.task === 'transcribe') {
      formData.append('language', options.language);
    }
    
    // Add advanced options if provided
    if (options.temperature !== undefined) {
      formData.append('temperature', options.temperature.toString());
    }
    if (options.enableSpeakerDiarization !== undefined) {
      formData.append('diarize', options.enableSpeakerDiarization.toString());
    }
    if (options.enablePunctuation !== undefined) {
      formData.append('punctuation', options.enablePunctuation.toString());
    }
    if (options.enableNumberFormatting !== undefined) {
      formData.append('format_numbers', options.enableNumberFormatting.toString());
    }

    try {
      const response = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to transcribe audio chunk');
      }

      const result = await response.json();
      
      // Update progress
      const newProgress = Math.round(((chunkIndex + 1) / totalChunks) * 100);
      setProgress(newProgress);
      setCurrentChunk(chunkIndex + 1);
      
      return result;
    } catch (err) {
      console.error(`Error processing chunk ${chunkIndex + 1}:`, err);
      throw new Error(`Chunk ${chunkIndex + 1}: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  // Split audio into chunks and process them
  const transcribeAudio = useCallback(async (
    file: File,
    options: TranscriptionOptions
  ): Promise<TranscriptionResult | null> => {
    // Reset state
    resetTranscription();
    setIsTranscribing(true);
    setError(null);
    
    try {
      // Create audio context to get duration and split into chunks
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const arrayBuffer = await file.arrayBuffer();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
      const duration = audioBuffer.duration;
      
      // Calculate chunks based on duration and chunk length
      const chunkLength = options.chunkLength || 180; // Default 3 minutes
      const overlap = options.overlap || 5; // Default 5 seconds overlap
      
      // Calculate number of chunks
      const chunkDuration = Math.min(chunkLength, duration);
      let numChunks = Math.ceil(duration / (chunkDuration - overlap));
      numChunks = Math.max(1, numChunks); // At least 1 chunk
      
      setTotalChunks(numChunks);
      
      // If it's a small file, process as a single chunk
      if (duration <= chunkLength) {
        console.log('Processing as single chunk');
        const result = await processChunk(file, options, 0, 1);
        
        const finalResult: TranscriptionResult = {
          id: uuidv4(),
          text: result.text,
          language: result.language,
          duration,
          segments: result.segments,
          word_segments: result.word_segments,
          model: options.model,
          processingTime: result.processingTime,
          createdAt: new Date(),
        };
        
        setResult(finalResult);
        setIsTranscribing(false);
        return finalResult;
      }
      
      // For larger files, split into chunks and process in sequence
      console.log(`Splitting audio into ${numChunks} chunks with ${overlap}s overlap`);
      
      const results: any[] = [];
      
      for (let i = 0; i < numChunks; i++) {
        const startTime = Math.max(0, i * (chunkDuration - overlap));
        const endTime = Math.min(duration, (i + 1) * chunkDuration - (i > 0 ? overlap : 0));
        
        console.log(`Processing chunk ${i + 1}/${numChunks}: ${startTime.toFixed(1)}s - ${endTime.toFixed(1)}s`);
        
        // Extract audio chunk
        const chunkAudioBuffer = audioContext.createBuffer(
          audioBuffer.numberOfChannels,
          (endTime - startTime) * audioBuffer.sampleRate,
          audioBuffer.sampleRate
        );
        
        // Copy data to the new buffer
        for (let channel = 0; channel < audioBuffer.numberOfChannels; channel++) {
          const channelData = audioBuffer.getChannelData(channel);
          const chunkData = chunkAudioBuffer.getChannelData(channel);
          const startOffset = Math.floor(startTime * audioBuffer.sampleRate);
          const endOffset = Math.floor(endTime * audioBuffer.sampleRate);
          
          for (let j = startOffset; j < endOffset; j++) {
            chunkData[j - startOffset] = channelData[j] || 0;
          }
        }
        
        // Convert to WAV blob
        const wavBlob = await audioBufferToWav(chunkAudioBuffer);
        
        // Process chunk
        const chunkResult = await processChunk(
          new Blob([wavBlob], { type: 'audio/wav' }),
          options,
          i,
          numChunks
        );
        
        results.push({
          ...chunkResult,
          startTime,
          endTime,
        });
      }
      
      // Combine results
      const combinedText = results.map(r => r.text).join(' ');
      
      // Combine segments with adjusted timestamps
      let combinedSegments: any[] = [];
      let segmentId = 1;
      
      results.forEach((chunkResult, chunkIndex) => {
        if (chunkResult.segments && Array.isArray(chunkResult.segments)) {
          chunkResult.segments.forEach((segment: any) => {
            combinedSegments.push({
              ...segment,
              id: segmentId++,
              start: segment.start + results[chunkIndex].startTime,
              end: segment.end + results[chunkIndex].startTime,
            });
          });
        }
      });
      
      // Combine word segments with adjusted timestamps
      let combinedWordSegments: any[] = [];
      
      results.forEach((chunkResult, chunkIndex) => {
        if (chunkResult.word_segments && Array.isArray(chunkResult.word_segments)) {
          chunkResult.word_segments.forEach((word: any) => {
            combinedWordSegments.push({
              ...word,
              start: word.start + results[chunkIndex].startTime,
              end: word.end + results[chunkIndex].startTime,
            });
          });
        }
      });
      
      const finalResult: TranscriptionResult = {
        id: uuidv4(),
        text: combinedText,
        language: results[0]?.language,
        duration,
        segments: combinedSegments.length > 0 ? combinedSegments : undefined,
        word_segments: combinedWordSegments.length > 0 ? combinedWordSegments : undefined,
        model: options.model,
        processingTime: results.reduce((sum, r) => sum + (r.processingTime || 0), 0),
        createdAt: new Date(),
      };
      
      setResult(finalResult);
      setIsTranscribing(false);
      
      return finalResult;
    } catch (err) {
      console.error('Error in transcribeAudio:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to transcribe audio';
      setError(errorMessage);
      
      toast({
        title: 'Transcription Error',
        description: errorMessage,
        variant: 'destructive',
      });
      
      setIsTranscribing(false);
      return null;
    }
  }, [resetTranscription, toast]);

  return {
    isTranscribing,
    progress,
    currentChunk,
    totalChunks,
    result,
    error,
    transcribeAudio,
    resetTranscription,
  };
};

// Helper function to convert AudioBuffer to WAV
async function audioBufferToWav(buffer: AudioBuffer): Promise<ArrayBuffer> {
  const numChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const format = 3; // 32-bit float
  const bitDepth = 32;
  
  // Calculate the buffer size
  let length = buffer.length * numChannels * (bitDepth / 8);
  const bufferSize = 44 + length;
  
  // Create the buffer
  const arrayBuffer = new ArrayBuffer(bufferSize);
  const view = new DataView(arrayBuffer);
  
  // Helper function to write string to buffer
  const writeString = (view: DataView, offset: number, string: string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };
  
  // Write WAV header
  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + length, true);
  writeString(view, 8, 'WAVE');
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true); // Subchunk1Size (16 for PCM)
  view.setUint16(20, format === 3 ? 3 : 1, true); // AudioFormat (3 for float, 1 for PCM)
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * numChannels * (bitDepth / 8), true); // ByteRate
  view.setUint16(32, numChannels * (bitDepth / 8), true); // BlockAlign
  view.setUint16(34, bitDepth, true);
  writeString(view, 36, 'data');
  view.setUint32(40, length, true);
  
  // Write the audio data
  let offset = 44;
  
  // Interleave the channels
  const interleaved = new Float32Array(buffer.length * numChannels);
  for (let i = 0; i < buffer.length; i++) {
    for (let channel = 0; channel < numChannels; channel++) {
      interleaved[i * numChannels + channel] = buffer.getChannelData(channel)[i];
    }
  }
  
  // Write the interleaved data as 32-bit floats
  for (let i = 0; i < interleaved.length; i++) {
    view.setFloat32(offset, interleaved[i], true);
    offset += 4;
  }
  
  return arrayBuffer;
}

export { useTranscription };
