'use client';

import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

interface Speaker {
  id: string;
  name: string;
  voice: string;
}

interface SpeakerSettingsProps {
  speakers: Speaker[];
  onUpdateSpeakers: (speakers: Speaker[]) => void;
  availableVoices: { id: string; description: string }[];
  disabled?: boolean;
}

export function SpeakerSettings({ 
  speakers, 
  onUpdateSpeakers, 
  availableVoices,
  disabled = false 
}: SpeakerSettingsProps) {
  
  const handleNameChange = (id: string, name: string) => {
    const updatedSpeakers = speakers.map(speaker => 
      speaker.id === id ? { ...speaker, name } : speaker
    );
    onUpdateSpeakers(updatedSpeakers);
  };

  const handleVoiceChange = (id: string, voice: string) => {
    const updatedSpeakers = speakers.map(speaker => 
      speaker.id === id ? { ...speaker, voice } : speaker
    );
    onUpdateSpeakers(updatedSpeakers);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium">Speaker Settings</h3>
      
      <div className="space-y-4">
        {speakers.map((speaker, index) => (
          <div key={speaker.id} className="p-3 bg-card rounded-md border border-border">
            <div className="space-y-3">
              <div>
                <Label htmlFor={`speaker-name-${speaker.id}`} className="text-xs">Speaker Name</Label>
                <input
                  id={`speaker-name-${speaker.id}`}
                  type="text"
                  value={speaker.name}
                  onChange={(e) => handleNameChange(speaker.id, e.target.value)}
                  disabled={disabled}
                  className="w-full mt-1 px-3 py-1 text-sm border border-border rounded-md"
                />
              </div>
              
              <div>
                <Label htmlFor={`speaker-voice-${speaker.id}`} className="text-xs">Voice</Label>
                <select
                  id={`speaker-voice-${speaker.id}`}
                  value={speaker.voice}
                  onChange={(e) => handleVoiceChange(speaker.id, e.target.value)}
                  disabled={disabled}
                  className="w-full mt-1 px-3 py-1 text-sm border border-border rounded-md"
                >
                  {availableVoices.map(voice => (
                    <option key={voice.id} value={voice.id}>
                      {voice.id} - {voice.description}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}