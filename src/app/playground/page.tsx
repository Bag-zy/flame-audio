'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

// Components
import { AudioRecorder } from './components/AudioRecorder';
import { FileUploader } from './components/FileUploader';
import { ModelSelector } from './components/ModelSelector';
import { LanguageSelector } from './components/LanguageSelector';
import { SettingsPanel } from './components/SettingsPanel';
import { ResultsDisplay } from './components/ResultsDisplay';
import { VoiceSelector } from './components/VoiceSelector';
import { SpeakerModeSelector } from './components/SpeakerModeSelector';
import { TextInput } from './components/TextInput';
import { AudioPlayer } from './components/AudioPlayer';
import { SpeakerSettings } from './components/SpeakerSettings';
import { DialogEditor } from './components/DialogEditor';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { AuthModal } from '@/components/auth/AuthModal';

// Types
export type TaskType = 'transcribe' | 'translate';

// Default settings
const DEFAULT_SETTINGS = {
  chunkLength: 180, // 3 minutes
  overlap: 5, // 5 seconds
  temperature: 0.0,
  enableSpeakerDiarization: false,
  enablePunctuation: true,
  enableNumberFormatting: true,
};

// SystemMessage component for Speech to Text
const SystemMessage = ({ message, setMessage }: { message: string, setMessage: (message: string) => void }) => {
  return (
    <div className="p-4 bg-card rounded-lg shadow-md border border-border h-full">
      <h2 className="text-lg font-semibold mb-2">System Message</h2>
      <p className="text-sm text-muted-foreground mb-3">
        Provide instructions for how the AI should process your audio.
      </p>
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        className="w-full h-32 p-3 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        placeholder="Enter your instructions here..."
      />
    </div>
  );
};

// TtsSystemMessage component for Text to Speech
const TtsSystemMessage = ({ message, setMessage }: { message: string, setMessage: (message: string) => void }) => {
  return (
    <div className="p-4 bg-card rounded-lg shadow-md border border-border h-full">
      <h2 className="text-lg font-semibold mb-2">System Message</h2>
      <p className="text-sm text-muted-foreground mb-3">
        Provide instructions for generating the speech content.
      </p>
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        className="w-full h-32 p-3 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        placeholder="Enter instructions for generating content..."
      />
    </div>
  );
};

export default function Playground() {
  const router = useRouter();
  const { data: session, status } = useSession();
  
  // Check if authentication is enabled
  const authEnabled = process.env.NEXT_PUBLIC_AUTH_ENABLED !== 'false';
  
  // Component state - Speech to Text
  const [mode, setMode] = useState<'speech-to-text' | 'text-to-speech'>('speech-to-text');
  const [task, setTask] = useState<TaskType>('transcribe');
  const [language, setLanguage] = useState('en');
  const [selectedModel, setSelectedModel] = useState('gemini-2.5-flash');
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [result, setResult] = useState(null);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcriptionError, setTranscriptionError] = useState(null);
  const [systemMessage, setSystemMessage] = useState(
    "Transcribe this audio and summarize the key points. Include any important details, names, dates, and action items mentioned."
  );
  
  // Component state - Text to Speech
  const [ttsSystemMessage, setTtsSystemMessage] = useState(
    "Generate a short transcript around 100 words that reads like it was clipped from a podcast by excited herpetologists. The hosts names are Dr. Anya and Liam."
  );
  const [inputText, setInputText] = useState('Dr. Anya: Hello! We\'re excited to show you our native speech capabilities\nLiam: Where you can direct a voice, create realistic dialog, and so much more. Edit these placeholders to get started.');
  const [styleInstructions, setStyleInstructions] = useState(
    "Say in a conversational tone:"
  );
  const [selectedVoice, setSelectedVoice] = useState('Kore');
  const [isMultiSpeaker, setIsMultiSpeaker] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [ttsError, setTtsError] = useState(null);
  const [audioResult, setAudioResult] = useState<{ audioData: string; format: string; } | null>(null);
  const [ttsTemperature, setTtsTemperature] = useState(0);
  const [speakers, setSpeakers] = useState([
    { id: 'speaker-1', name: 'Dr. Anya', voice: 'Kore' },
    { id: 'speaker-2', name: 'Liam', voice: 'Puck' }
  ]);
  const [availableVoices, setAvailableVoices] = useState<{ id: string; description: string }[]>([]);
  
  // Fetch available voices
  useEffect(() => {
    const fetchVoices = async () => {
      try {
        const response = await fetch('/api/voices');
        const data = await response.json();
        setAvailableVoices(data.voices || []);
      } catch (err) {
        console.error('Error fetching voices:', err);
      }
    };

    fetchVoices();
  }, []);

  // Handle file selection
  const handleFileSelected = useCallback(async (file: File) => {
    try {
      setIsTranscribing(true);
      setTranscriptionError(null);
      
      // Create form data
      const formData = new FormData();
      formData.append('file', file);
      formData.append('task', task);
      formData.append('model', selectedModel);
      
      if (task === 'transcribe' && language) {
        formData.append('language', language);
      }
      
      // Add settings
      formData.append('temperature', settings.temperature.toString());
      formData.append('diarize', settings.enableSpeakerDiarization.toString());
      formData.append('punctuation', settings.enablePunctuation.toString());
      formData.append('format_numbers', settings.enableNumberFormatting.toString());
      formData.append('system_message', systemMessage);
      
      // Call API
      const response = await fetch('/api/transcribe-audio', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to transcribe audio');
      }
      
      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error('Transcription error:', error);
      // Check for rate limit error
      if (error.message && error.message.includes('rate limit') || error.message && error.message.includes('quota')) {
        setTranscriptionError('API rate limit exceeded. Please try again later or use a different API key.');
      } else {
        setTranscriptionError(error.message || 'An error occurred during transcription');
      }
    } finally {
      setIsTranscribing(false);
    }
  }, [task, language, selectedModel, settings, systemMessage]);

  // Reset form function
  const resetForm = useCallback(() => {
    setResult(null);
    setTranscriptionError(null);
  }, []);
  
  // Handle text-to-speech generation
  const handleGenerateSpeech = useCallback(async () => {
    if (!inputText.trim()) return;
    
    try {
      setIsGenerating(true);
      setTtsError(null);
      setAudioResult(null);
      
      // Create form data
      const formData = new FormData();
      formData.append('text', inputText);
      formData.append('style_instructions', styleInstructions);
      formData.append('temperature', ttsTemperature.toString());
      formData.append('isMultiSpeaker', isMultiSpeaker.toString());
      formData.append('voice', selectedVoice);
      
      // Add speaker configurations for multi-speaker mode
      if (isMultiSpeaker) {
        formData.append('speakers', JSON.stringify(speakers));
      }
      
      console.log('Sending TTS request with:', {
        text: inputText.substring(0, 50) + '...',
        voice: selectedVoice,
        isMultiSpeaker
      });
      
      // Call API with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
      
      try {
        const response = await fetch('/api/text-to-speech', {
          method: 'POST',
          body: formData,
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          const data = await response.json().catch(() => ({}));
          throw new Error(data.error || data.details || `Server error: ${response.status}`);
        }
        
        const data = await response.json();
        
        console.log('TTS API response:', data);
        
        if (!data.audioData) {
          console.error('Missing audioData in response:', data);
          throw new Error('No audio data received from the server');
        }
        
        console.log('TTS response received successfully');
        setAudioResult(data);
      } catch (fetchError) {
        if (fetchError.name === 'AbortError') {
          throw new Error('Request timed out. The server took too long to respond.');
        }
        throw fetchError;
      }
    } catch (error) {
      console.error('Text-to-speech error:', error);
      // Check for rate limit error
      if (error.message && (error.message.includes('rate limit') || error.message.includes('quota'))) {
        setTtsError('API rate limit exceeded. Please try again later or use a different API key.');
      } else if (error.message && error.message.includes('not available')) {
        setTtsError('The TTS model is not available or not enabled for your API key.');
      } else if (error.message && error.message.includes('timed out')) {
        setTtsError('Request timed out. Please try again with a shorter text.');
      } else {
        setTtsError(error.message || 'An error occurred during speech generation');
      }
    } finally {
      setIsGenerating(false);
    }
  }, [inputText, selectedVoice, isMultiSpeaker, styleInstructions, ttsTemperature]);

  // Authentication modal state
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<'login' | 'register'>('login');

  // Handle authentication state
  useEffect(() => {
    if (authEnabled && status === 'unauthenticated') {
      // Show authentication modal instead of redirecting
      setAuthModalOpen(true);
    }
  }, [status, router, authEnabled]);

  // Show loading state while checking authentication (only if auth is enabled)
  if (authEnabled && status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-indigo-600" />
      </div>
    );
  }

  // Render layout
  return (
    <div className="min-h-screen bg-background p-6">
      {/* Title Row with Mode Selector */}
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Audio Playground</h1>
          <p className="text-muted-foreground">Convert speech to text with AI</p>
        </div>
        
        <div className="relative">
          <select 
            className="appearance-none bg-card border border-border rounded-md px-4 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500 text-foreground"
            value={mode}
            onChange={(e) => {
              const newMode = e.target.value as 'speech-to-text' | 'text-to-speech';
              setMode(newMode);
            }}
          >
            <option value="speech-to-text">Speech to Text</option>
            <option value="text-to-speech">Text to Speech</option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
              <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
            </svg>
          </div>
        </div>
      </div>
      
      {/* Speech to Text Mode */}
      {mode === 'speech-to-text' && (
        <div className="max-w-full mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Column 1: System Message, Upload, Recording */}
          <div className="col-span-1 lg:col-span-1 flex flex-col space-y-6 h-[800px] overflow-y-auto p-4 bg-background/50 rounded-lg border border-border/50">
            <SystemMessage message={systemMessage} setMessage={setSystemMessage} />
            <FileUploader 
              onFileSelect={handleFileSelected} 
              acceptedFormats="audio/wav,audio/mp3,audio/aiff,audio/aac,audio/ogg,audio/flac"
              disabled={isTranscribing}
            />
            <AudioRecorder 
              onRecordingComplete={handleFileSelected} 
              disabled={isTranscribing}
            />
          </div>

          {/* Column 2: Results */}
          <div className="col-span-1 lg:col-span-1 flex flex-col space-y-6 h-[800px] overflow-y-auto p-4 bg-background/50 rounded-lg border border-border/50">
            {isTranscribing && (
              <div className="flex items-center justify-center p-8 bg-card rounded-lg border border-border">
                <div className="flex flex-col items-center">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-muted border-t-primary mb-4" />
                  <p className="text-foreground font-medium">Processing audio...</p>
                </div>
              </div>
            )}
            {transcriptionError && (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300">
                <p className="font-medium">Error</p>
                <p className="text-sm">{transcriptionError}</p>
              </div>
            )}
            {result ? (
              <ResultsDisplay 
                result={result} 
                onReset={resetForm} 
                task={task} 
                className="flex-1"
              />
            ) : !isTranscribing && !transcriptionError && (
              <div className="flex flex-col items-center justify-center h-full p-8 bg-card rounded-lg border border-border text-center">
                <div className="w-16 h-16 mb-4 text-muted-foreground">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 6l6 6m0 0l-6 6" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium mb-2">Results will appear here</h3>
                <p className="text-muted-foreground max-w-md">
                  Upload an audio file or record your voice to see the transcription or translation results in this panel.
                </p>
              </div>
            )}
          </div>

          {/* Column 3: Task, Model, Settings */}
          <div className="col-span-1 lg:col-span-1 flex flex-col space-y-6 h-[800px] overflow-y-auto p-4 bg-background/50 rounded-lg border border-border/50">
            <SettingsPanel 
              task={task} 
              onTaskChange={setTask} 
              initialSettings={settings} 
              onSettingsChange={setSettings} 
            />
            <ModelSelector 
              selectedModel={selectedModel} 
              onModelSelect={setSelectedModel} 
            />
            <LanguageSelector 
              selectedLanguage={language} 
              onLanguageSelect={setLanguage} 
              disabled={task === 'translate'} 
            />
          </div>
        </div>
      )}
      
      {/* Text to Speech Mode */}
      {mode === 'text-to-speech' && (
        <div className="max-w-full mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Column 1: System Message, Style Instructions, Text Input */}
          <div className="col-span-1 lg:col-span-1 flex flex-col space-y-6 h-[800px] overflow-y-auto p-4 bg-background/50 rounded-lg border border-border/50">
            <div className="w-full">
              <TextInput
                value={styleInstructions}
                onChange={setStyleInstructions}
                label="Style Instructions"
                placeholder="Say in a conversational tone:"
                rows={3}
                disabled={isGenerating}
              />
            </div>
            
            {isMultiSpeaker ? (
              <div className="flex-1 w-full">
                <Label className="mb-2 block">Dialog</Label>
                <DialogEditor
                  value={inputText}
                  onChange={setInputText}
                  speakers={speakers}
                  disabled={isGenerating}
                />
              </div>
            ) : (
              <div className="flex-1 w-full">
                <TextInput
                  value={inputText}
                  onChange={setInputText}
                  label="Text to Convert"
                  placeholder="Enter the text you want to convert to speech..."
                  rows={12}
                  disabled={isGenerating}
                />
              </div>
            )}
          </div>

          {/* Column 2: Results */}
          <div className="col-span-1 lg:col-span-1 flex flex-col space-y-6 h-[800px] overflow-y-auto p-4 bg-background/50 rounded-lg border border-border/50">
            {isGenerating && (
              <div className="flex items-center justify-center p-8 bg-card rounded-lg border border-border">
                <div className="flex flex-col items-center">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-muted border-t-primary mb-4" />
                  <p className="text-foreground font-medium">Generating audio...</p>
                </div>
              </div>
            )}
            {ttsError && (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300">
                <p className="font-medium">Error</p>
                <p className="text-sm">{ttsError}</p>
              </div>
            )}
            {audioResult ? (
              <div className="flex flex-col space-y-4">
                <h3 className="text-lg font-medium">Generated Audio</h3>
                <AudioPlayer audioData={audioResult.audioData} />
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">Text</h4>
                  <p className="text-sm whitespace-pre-wrap">{audioResult.text || inputText}</p>
                </div>
              </div>
            ) : !isGenerating && !ttsError && (
              <div className="flex flex-col items-center justify-center h-full p-8 bg-card rounded-lg border border-border text-center">
                <div className="w-16 h-16 mb-4 text-muted-foreground">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium mb-2">Audio will appear here</h3>
                <p className="text-muted-foreground max-w-md mb-6">
                  Enter your text and click the Generate button to convert it to speech.
                </p>
                <Button 
                  onClick={() => handleGenerateSpeech()}
                  disabled={!inputText.trim() || isGenerating}
                  className="w-full max-w-xs"
                >
                  Generate Speech
                </Button>
              </div>
            )}
            
            {/* Generate Button at bottom */}
            {(audioResult || ttsError) && (
              <div className="mt-auto pt-4 border-t border-border">
                <Button 
                  onClick={() => handleGenerateSpeech()}
                  disabled={!inputText.trim() || isGenerating}
                  className="w-full"
                >
                  Generate Speech
                </Button>
              </div>
            )}
          </div>

          {/* Column 3: Settings */}
          <div className="col-span-1 lg:col-span-1 flex flex-col space-y-6 h-[800px] overflow-y-auto p-4 bg-background/50 rounded-lg border border-border/50">
            <div className="space-y-2">
              <Label>Model</Label>
              <div className="p-3 border border-border rounded-md bg-background">
                <div className="flex flex-col">
                  <span className="font-medium">gemini-2.5-flash-preview-tts</span>
                  <span className="text-xs text-gray-500">Text to Speech model</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="temperature">Temperature</Label>
              <div className="flex items-center space-x-2">
                <input
                  type="range"
                  id="temperature"
                  min="0"
                  max="1"
                  step="0.1"
                  value={ttsTemperature}
                  onChange={(e) => setTtsTemperature(parseFloat(e.target.value))}
                  disabled={isGenerating}
                  className="w-full"
                />
                <span className="w-12 text-right text-sm">{ttsTemperature.toFixed(1)}</span>
              </div>
              <p className="text-xs text-muted-foreground">Higher values make output more random, lower values more deterministic.</p>
            </div>
            
            <SpeakerModeSelector 
              isMultiSpeaker={isMultiSpeaker}
              onModeChange={setIsMultiSpeaker}
              speakers={speakers}
              onUpdateSpeakers={setSpeakers}
              disabled={isGenerating}
              availableVoices={availableVoices}
            />
            
            {!isMultiSpeaker && (
              <VoiceSelector 
                selectedVoice={selectedVoice}
                onVoiceSelect={setSelectedVoice}
                disabled={isGenerating}
              />
            )}
            
            <LanguageSelector 
              selectedLanguage={language}
              onLanguageSelect={setLanguage}
              disabled={isGenerating}
            />
          </div>
        </div>
      )}
      
      {/* Authentication Modal */}
      <AuthModal 
        open={authModalOpen} 
        onOpenChange={setAuthModalOpen}
        defaultTab={authModalTab}
      />
    </div>
  );
}