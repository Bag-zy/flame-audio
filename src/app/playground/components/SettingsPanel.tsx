'use client';

import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Icons } from '@/components/ui/icons';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface SettingsPanelProps {
  task: 'transcribe' | 'translate';
  onTaskChange: (task: 'transcribe' | 'translate') => void;
  initialSettings?: {
    chunkLength?: number;
    overlap?: number;
    temperature?: number;
    enableSpeakerDiarization?: boolean;
    enablePunctuation?: boolean;
    enableNumberFormatting?: boolean;
  };
  onSettingsChange?: (settings: any) => void;
}

export function SettingsPanel({ 
  task, 
  onTaskChange,
  initialSettings = {},
  onSettingsChange 
}: SettingsPanelProps) {
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState({
    chunkLength: initialSettings.chunkLength || 180, // 3 minutes
    overlap: initialSettings.overlap || 5, // 5 seconds
    temperature: initialSettings.temperature ?? 0.0, // 0.0 to 1.0
    enableSpeakerDiarization: initialSettings.enableSpeakerDiarization ?? false,
    enablePunctuation: initialSettings.enablePunctuation ?? true,
    enableNumberFormatting: initialSettings.enableNumberFormatting ?? true,
  });

  const handleSettingChange = (key: string, value: any) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    onSettingsChange?.(newSettings);
  };

  return (
    <div className="space-y-4">
      <Tabs 
        value={activeTab} 
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="general">
            <Icons.settings className="h-4 w-4 mr-2" />
            General
          </TabsTrigger>
          <TabsTrigger value="advanced">
            <Icons.slidersHorizontal className="h-4 w-4 mr-2" />
            Advanced
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="general" className="space-y-4 pt-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="task">Task</Label>
              <div className="flex items-center space-x-2">
                <Button
                  variant={task === 'transcribe' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => onTaskChange('transcribe')}
                  className="flex-1"
                >
                  Transcribe
                </Button>
                <Button
                  variant={task === 'translate' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => onTaskChange('translate')}
                  className="flex-1"
                >
                  Translate to English
                </Button>
              </div>
            </div>
            <p className="text-xs text-gray-500">
              {task === 'translate' 
                ? 'Audio will be translated to English' 
                : 'Audio will be transcribed in the original language'}
            </p>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="chunk-length">Chunk Length: {settings.chunkLength} seconds</Label>
              <span className="text-sm text-gray-500">{Math.floor(settings.chunkLength / 60)}m {settings.chunkLength % 60}s</span>
            </div>
            <Slider
              id="chunk-length"
              min={30}
              max={600}
              step={5}
              value={[settings.chunkLength]}
              onValueChange={(value) => handleSettingChange('chunkLength', value[0])}
              className="py-4"
            />
            <p className="text-xs text-gray-500">
              Split audio into chunks for better processing. Larger chunks may be more accurate but use more memory.
            </p>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="overlap">Overlap: {settings.overlap} seconds</Label>
            </div>
            <Slider
              id="overlap"
              min={0}
              max={30}
              step={1}
              value={[settings.overlap]}
              onValueChange={(value) => handleSettingChange('overlap', value[0])}
              className="py-4"
            />
            <p className="text-xs text-gray-500">
              Overlap between chunks to prevent cutting off words. Recommended: 5-10 seconds.
            </p>
          </div>
        </TabsContent>
        
        <TabsContent value="advanced" className="space-y-6 pt-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="temperature">Temperature: {settings.temperature.toFixed(1)}</Label>
              <span className="text-sm text-gray-500">
                {settings.temperature === 0 
                  ? 'Deterministic' 
                  : settings.temperature <= 0.3 
                    ? 'Focused' 
                    : settings.temperature <= 0.7 
                      ? 'Balanced' 
                      : 'Creative'}
              </span>
            </div>
            <Slider
              id="temperature"
              min={0}
              max={1}
              step={0.1}
              value={[settings.temperature]}
              onValueChange={(value) => handleSettingChange('temperature', value[0])}
              className="py-4"
            />
            <p className="text-xs text-gray-500">
              Controls randomness. Lower values make output more focused and deterministic.
            </p>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="speaker-diarization">Speaker Diarization</Label>
                <p className="text-xs text-gray-500">
                  Identify different speakers in the audio
                </p>
              </div>
              <Switch
                id="speaker-diarization"
                checked={settings.enableSpeakerDiarization}
                onCheckedChange={(checked) => handleSettingChange('enableSpeakerDiarization', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="punctuation">Auto Punctuation</Label>
                <p className="text-xs text-gray-500">
                  Add punctuation to transcribed text
                </p>
              </div>
              <Switch
                id="punctuation"
                checked={settings.enablePunctuation}
                onCheckedChange={(checked) => handleSettingChange('enablePunctuation', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="number-formatting">Format Numbers</Label>
                <p className="text-xs text-gray-500">
                  Convert numbers to their spoken form (e.g., "123" → "one twenty-three")
                </p>
              </div>
              <Switch
                id="number-formatting"
                checked={settings.enableNumberFormatting}
                onCheckedChange={(checked) => handleSettingChange('enableNumberFormatting', checked)}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label>Custom Instructions</Label>
            <textarea
              placeholder="Add any specific instructions for the transcription..."
              className="w-full h-24 p-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500">
              Provide additional context or instructions to improve transcription quality.
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
