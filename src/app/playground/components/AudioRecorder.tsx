'use client';

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/ui/icons';

type AudioContextType = AudioContext | null;
type AnalyserNodeType = AnalyserNode | null;
type MediaStreamAudioSourceNodeType = MediaStreamAudioSourceNode | null;

declare global {
  interface Window {
    webkitAudioContext: typeof AudioContext;
  }
}

interface AudioRecorderProps {
  onRecordingComplete: (audioBlob: Blob) => void;
  disabled?: boolean;
  className?: string;
}

export const AudioRecorder = ({
  onRecordingComplete,
  disabled = false,
  className = ''
}: AudioRecorderProps) => {
  // State
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [volume, setVolume] = useState(0);
  
  // Refs
  const audioContextRef = useRef<AudioContextType>(null);
  const analyserRef = useRef<AnalyserNodeType>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNodeType>(null);
  const dataArrayRef = useRef<Uint8Array>(new Uint8Array(0));
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const animationRef = useRef<number | null>(null);
  
  // Format time as MM:SS
  const formatTime = useCallback((seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  }, []);
  
  // Cleanup function for audio resources
  const cleanupAudio = useCallback((): void => {
    try {
      if (audioContextRef.current) {
        if (audioContextRef.current.state !== 'closed') {
          audioContextRef.current.close().catch(console.error);
        }
        audioContextRef.current = null;
      }
      
      if (sourceRef.current) {
        sourceRef.current.disconnect();
        sourceRef.current = null;
      }
      
      if (analyserRef.current) {
        analyserRef.current.disconnect();
        analyserRef.current = null;
      }
      
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
      
      mediaRecorderRef.current = null;
    } catch (error) {
      console.error('Error in cleanupAudio:', error);
    }
  }, []);
  
  // Stop recording and clean up
  const stopRecording = useCallback((): void => {
    try {
      // Stop media recorder if active
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
      
      // Stop all media tracks
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
      
      // Clear the recording timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      
      // Update UI state
      setIsRecording(false);
      
      // Clean up audio context
      if (audioContextRef.current) {
        if (audioContextRef.current.state !== 'closed') {
          audioContextRef.current.close().catch(console.error);
        }
        audioContextRef.current = null;
      }
      
      // Cancel any animation frame
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
      
      // Clear any error state
      setError(null);
    } catch (error) {
      console.error('Error in stopRecording:', error);
      setError('An error occurred while stopping the recording.');
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      
      // Only call stopRecording if we're currently recording
      if (isRecording) {
        stopRecording();
      }
    };
  }, [isRecording, stopRecording]);

  // Audio visualization setup - client-side only
  const analyzeAudio = useCallback((stream: MediaStream): void => {
    if (typeof window === 'undefined') return; // Skip on server
    
    if (!audioContextRef.current) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      const audioContext = new AudioContext();
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 32;
      
      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);
      
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      
      // Update refs
      audioContextRef.current = audioContext;
      analyserRef.current = analyser;
      sourceRef.current = source;
      dataArrayRef.current = dataArray;
      
      const tick = () => {
        if (!analyserRef.current || !dataArrayRef.current) return;
        
        analyserRef.current.getByteFrequencyData(dataArrayRef.current);
        let sum = 0;
        for (let i = 0; i < dataArrayRef.current.length; i++) {
          sum += dataArrayRef.current[i];
        }
        const average = sum / bufferLength;
        setVolume(Math.min(Math.max(average / 2, 0), 100));
        
        animationRef.current = requestAnimationFrame(tick);
      };
      
      animationRef.current = requestAnimationFrame(tick);
    }
  }, []);

  // Start recording
  const startRecording = useCallback(async (): Promise<void> => {
    let mediaRecorder: MediaRecorder | null = null;
    let stream: MediaStream | null = null;
    
    try {
      setError(null);
      setAudioChunks([]);
      setRecordingTime(0);
      
      // Request access to the microphone
      stream = await navigator.mediaDevices.getUserMedia({ 
        audio: { 
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });
      
      streamRef.current = stream;
      mediaRecorder = new MediaRecorder(stream);
      setMediaRecorder(mediaRecorder);
      mediaRecorderRef.current = mediaRecorder;
      
      // Create a local array to store chunks during recording
      const chunks: Blob[] = [];
      
      const handleDataAvailable = (e: BlobEvent) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
          setAudioChunks(prev => [...prev, e.data]);
        }
      };
      
      const handleStop = () => {
        if (chunks.length > 0) {
          const audioBlob = new Blob(chunks, { type: 'audio/wav' });
          onRecordingComplete(audioBlob);
        }
        cleanupAudio();
      };
      
      const handleError = (event: Event) => {
        console.error('MediaRecorder error:', event);
        setError('An error occurred while recording. Please try again.');
        stopRecording();
      };
      
      // Add event listeners
      mediaRecorder.addEventListener('dataavailable', handleDataAvailable);
      mediaRecorder.addEventListener('stop', handleStop);
      mediaRecorder.addEventListener('error', handleError);
      
      // Start recording
      mediaRecorder.start(100); // Request data every 100ms
      setIsRecording(true);
      
      // Set up audio analysis
      analyzeAudio(stream);
      
      // Start recording timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
      // Cleanup function
      return () => {
        if (mediaRecorder) {
          // Remove event listeners
          mediaRecorder.removeEventListener('dataavailable', handleDataAvailable);
          mediaRecorder.removeEventListener('stop', handleStop);
          mediaRecorder.removeEventListener('error', handleError);
          
          // Stop recording if still active
          if (mediaRecorder.state === 'recording') {
            mediaRecorder.stop();
          }
        }
        
        // Stop any media tracks
        if (stream) {
          stream.getTracks().forEach(track => track.stop());
        }
        
        // Clear the interval
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
      };
    } catch (err) {
      console.error('Error accessing microphone:', err);
      setError('Could not access microphone. Please ensure you have granted microphone permissions.');
      
      // Clean up any resources that might have been allocated
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      
      // Reset state
      setIsRecording(false);
      setRecordingTime(0);
      setMediaRecorder(null);
      streamRef.current = null;
      
      // Clean up audio context
      cleanupAudio();
    }
  }, [analyzeAudio, cleanupAudio, onRecordingComplete, stopRecording, setError, setAudioChunks, setRecordingTime, setMediaRecorder]);

  // Visualizer bars - using client-side only rendering to avoid hydration mismatch
  const [isMounted, setIsMounted] = useState(false);
  
  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  const visualizerBars = useMemo(() => {
    const bars: JSX.Element[] = [];
    const barCount = 16;
    const maxBarHeight = 20;
    
    // Use fixed heights for initial server render to avoid hydration mismatch
    const defaultHeight = 5;
    
    for (let i = 0; i < barCount; i++) {
      // Only use random heights after component has mounted on client
      const height = isMounted ? Math.random() * maxBarHeight : defaultHeight;
      bars.push(
        <div 
          key={i}
          className="bg-blue-500 rounded-full transition-all duration-75"
          style={{
            width: '2px',
            height: isMounted ? `${height}px` : `${defaultHeight}px`,
            opacity: 0.3,
          }}
        />
      );
    }
    
    return bars;
  }, [isRecording, isMounted]);

  return (
    <div className={`flex flex-col items-center w-full ${className}`}>
      <div className="relative w-full max-w-md">
        {/* Visualizer Background */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="flex items-center justify-center space-x-1 h-24 w-full px-6">
            {visualizerBars}
          </div>
        </div>
        
        {/* Main Button */}
        <div className="relative z-10 flex flex-col items-center justify-center p-6">
          <button
            onClick={isRecording ? stopRecording : startRecording}
            disabled={disabled}
            className={`relative flex items-center justify-center w-20 h-20 rounded-full transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-opacity-30 ${
              isRecording 
                ? 'bg-red-600 hover:bg-red-700 focus:ring-red-400 shadow-lg' 
                : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-400 shadow-md'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : 'transform hover:scale-105'}`}
            aria-label={isRecording ? 'Stop recording' : 'Start recording'}
          >
            {isRecording ? (
              <Icons.square className="h-6 w-6 text-white fill-current" />
            ) : (
              <Icons.mic className="h-8 w-8 text-white" />
            )}
            
            {/* Pulsing ring effect when recording */}
            {isRecording && (
              <>
                <span className="absolute inset-0 rounded-full bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <span className="absolute inset-0 rounded-full bg-red-600/30 animate-ping opacity-0 group-hover:opacity-100" />
              </>
            )}
          </button>
          
          {/* Timer and Status */}
          <div className={`mt-4 text-center transition-all duration-300 transform ${
            isRecording ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
          }`}>
            <div className="text-xl font-mono font-medium text-gray-900">
              {formatTime(recordingTime)}
            </div>
            <div className="text-xs font-medium text-gray-500 mt-1 flex items-center justify-center">
              <span className={`inline-block w-2 h-2 rounded-full mr-2 ${
                isRecording ? 'bg-red-500 animate-pulse' : 'bg-gray-400'
              }`}></span>
              {isRecording ? 'Recording' : 'Ready'}
            </div>
          </div>
        </div>
      </div>
      
      {/* Instructions */}
      <div className="mt-4 text-center">
        <p className="text-sm text-gray-600">
          {isRecording 
            ? 'Click to stop recording' 
            : 'Click to start recording'}
        </p>
      </div>
      
      {/* Error message */}
      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 flex items-center">
          <Icons.alertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
          {error}
        </div>
      )}
    </div>
  );
}
