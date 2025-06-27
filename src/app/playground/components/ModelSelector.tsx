'use client';

import { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Icons } from '@/components/ui/icons';

interface ModelSelectorProps {
  selectedModel: string;
  onModelSelect: (model: string) => void;
}

const SUPPORTED_MODELS = [
  { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', description: 'Fast model for transcription and translation' },
];

export function ModelSelector({ selectedModel, onModelSelect }: ModelSelectorProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [models, setModels] = useState(SUPPORTED_MODELS);
  const [error, setError] = useState<string | null>(null);

  // In a real app, you might fetch available models from an API
  useEffect(() => {
    const fetchModels = async () => {
      try {
        setIsLoading(true);
        // This is where you'd fetch models from your API
        // const response = await fetch('/api/models');
        // const data = await response.json();
        // setModels(data.models);
      } catch (err) {
        console.error('Error fetching models:', err);
        setError('Failed to load models. Using default models.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchModels();
  }, []);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label htmlFor="model">Model</Label>
        {isLoading && <span className="text-xs text-gray-500">Loading...</span>}
      </div>
      
      <Select
        value={selectedModel}
        onValueChange={onModelSelect}
        disabled={isLoading}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select a model" />
        </SelectTrigger>
        <SelectContent>
          {models.map((model) => (
            <SelectItem key={model.id} value={model.id}>
              <div className="flex flex-col">
                <span className="font-medium">{model.name}</span>
                <span className="text-xs text-gray-500">{model.description}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      {error && (
        <p className="text-xs text-red-500 flex items-center">
          <Icons.alertCircle className="h-3 w-3 mr-1" />
          {error}
        </p>
      )}
      
      <div className="text-xs text-gray-500 mt-1">
        <p>Selected: <span className="font-medium">
          {models.find(m => m.id === selectedModel)?.name || selectedModel}
        </span></p>
      </div>
    </div>
  );
}
