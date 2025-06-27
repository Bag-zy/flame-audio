'use client';

import { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface VoiceSelectorProps {
  selectedVoice: string;
  onVoiceSelect: (voice: string) => void;
  disabled?: boolean;
}

interface Voice {
  id: string;
  description: string;
}

export function VoiceSelector({ selectedVoice, onVoiceSelect, disabled = false }: VoiceSelectorProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [voices, setVoices] = useState<Voice[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Fetch available voices
  useEffect(() => {
    const fetchVoices = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/voices');
        const data = await response.json();
        setVoices(data.voices || []);
      } catch (err) {
        console.error('Error fetching voices:', err);
        setError('Failed to load voices. Using default voices.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchVoices();
  }, []);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label htmlFor="voice">Voice</Label>
        {isLoading && <span className="text-xs text-gray-500">Loading...</span>}
      </div>
      
      <Select
        value={selectedVoice}
        onValueChange={onVoiceSelect}
        disabled={isLoading || disabled}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select a voice" />
        </SelectTrigger>
        <SelectContent>
          {voices.map((voice) => (
            <SelectItem key={voice.id} value={voice.id}>
              <div className="flex flex-col">
                <span className="font-medium">{voice.id}</span>
                <span className="text-xs text-gray-500">{voice.description}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      {error && (
        <p className="text-xs text-red-500">{error}</p>
      )}
    </div>
  );
}