'use client';

import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

interface SpeakerModeSelectorProps {
  isMultiSpeaker: boolean;
  onModeChange: (isMulti: boolean) => void;
  speakers: { id: string; name: string; voice: string }[];
  onUpdateSpeakers: (speakers: { id: string; name: string; voice: string }[]) => void;
  disabled?: boolean;
  availableVoices?: { id: string; description: string }[];
}

export function SpeakerModeSelector({ 
  isMultiSpeaker, 
  onModeChange, 
  speakers, 
  onUpdateSpeakers,
  disabled = false,
  availableVoices = []
}: SpeakerModeSelectorProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Speaker Mode</Label>
        <div className="flex flex-col space-y-1">
          <div className="flex items-center space-x-2">
            <input 
              type="radio" 
              id="single" 
              name="speakerMode" 
              value="single" 
              checked={!isMultiSpeaker} 
              onChange={() => onModeChange(false)}
              disabled={disabled}
              className="h-4 w-4"
            />
            <Label htmlFor="single" className="cursor-pointer">Single Speaker</Label>
          </div>
          <div className="flex items-center space-x-2">
            <input 
              type="radio" 
              id="multi" 
              name="speakerMode" 
              value="multi" 
              checked={isMultiSpeaker} 
              onChange={() => onModeChange(true)}
              disabled={disabled}
              className="h-4 w-4"
            />
            <Label htmlFor="multi" className="cursor-pointer">Multiple Speakers</Label>
          </div>
        </div>
      </div>
      
      {isMultiSpeaker && (
        <div className="space-y-4">
          <div className="p-3 bg-muted rounded-md text-sm">
            <p className="text-muted-foreground">
              Format your text with speaker names followed by a colon:<br />
              <span className="font-mono text-xs block mt-1 bg-background p-1 rounded">
                {speakers[0]?.name || 'Speaker 1'}: Hello there!<br />
                {speakers[1]?.name || 'Speaker 2'}: Hi, how are you?
              </span>
            </p>
          </div>
          
          {/* Speaker Name Customization */}
          <div className="space-y-3">
            <Label className="text-sm">Customize Speaker Names</Label>
            
            {speakers.map((speaker, index) => (
              <div key={speaker.id} className="space-y-2">
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={speaker.name}
                    onChange={(e) => {
                      const newSpeakers = [...speakers];
                      newSpeakers[index] = { ...speaker, name: e.target.value };
                      onUpdateSpeakers(newSpeakers);
                    }}
                    placeholder={`Speaker ${index + 1}`}
                    disabled={disabled}
                    className="flex-1 px-3 py-1 text-sm border border-border rounded-md"
                  />
                </div>
                <div className="ml-4">
                  <Label className="text-xs text-muted-foreground">Voice for {speaker.name}</Label>
                  <select
                    value={speaker.voice}
                    onChange={(e) => {
                      const newSpeakers = [...speakers];
                      newSpeakers[index] = { ...speaker, voice: e.target.value };
                      onUpdateSpeakers(newSpeakers);
                    }}
                    disabled={disabled}
                    className="w-full mt-1 px-2 py-1 text-sm border border-border rounded-md bg-background"
                  >
                    {availableVoices.map((voice) => (
                      <option key={voice.id} value={voice.id}>
                        {voice.id} - {voice.description}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}