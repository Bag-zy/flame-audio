'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Trash2, Plus } from 'lucide-react';

interface DialogLine {
  id: string;
  speaker: string;
  text: string;
}

interface DialogEditorProps {
  value: string;
  onChange: (value: string) => void;
  speakers: { id: string; name: string }[];
  disabled?: boolean;
}

export function DialogEditor({ value, onChange, speakers, disabled = false }: DialogEditorProps) {
  // Parse dialog from text
  const parseDialog = (text: string): DialogLine[] => {
    if (!text) return [
      { id: `line-${Date.now()}`, speaker: speakers[0]?.name || 'Speaker 1', text: '' }
    ];
    
    const lines = text.split('\n');
    const dialog: DialogLine[] = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      const match = line.match(/^([^:]+):\s*(.*)$/);
      if (match) {
        dialog.push({
          id: `line-${i}`,
          speaker: match[1].trim(),
          text: match[2].trim()
        });
      } else {
        // If no speaker format, add to previous line or create new
        if (dialog.length > 0) {
          dialog[dialog.length - 1].text += ' ' + line;
        } else {
          dialog.push({
            id: `line-${i}`,
            speaker: speakers[0]?.name || 'Speaker 1',
            text: line
          });
        }
      }
    }
    
    return dialog.length > 0 ? dialog : [
      { id: `line-${Date.now()}`, speaker: speakers[0]?.name || 'Speaker 1', text: '' }
    ];
  };
  
  // Convert dialog to text
  const dialogToText = (dialog: DialogLine[]): string => {
    return dialog.map(line => `${line.speaker}: ${line.text}`).join('\n');
  };
  
  const [dialog, setDialog] = useState<DialogLine[]>(parseDialog(value));
  
  // Update dialog when value changes externally
  useEffect(() => {
    setDialog(parseDialog(value));
  }, [value]);
  
  // Update dialog and propagate changes
  const updateDialog = (newDialog: DialogLine[]) => {
    setDialog(newDialog);
    onChange(dialogToText(newDialog));
  };
  
  // Add a new line
  const addLine = () => {
    // Alternate between speakers
    const lastSpeaker = dialog.length > 0 ? dialog[dialog.length - 1].speaker : '';
    const nextSpeaker = lastSpeaker === (speakers[0]?.name || 'Speaker 1') 
      ? (speakers[1]?.name || 'Speaker 2') 
      : (speakers[0]?.name || 'Speaker 1');
      
    const newDialog = [
      ...dialog,
      {
        id: `line-${Date.now()}`,
        speaker: nextSpeaker,
        text: ''
      }
    ];
    
    updateDialog(newDialog);
  };
  
  // Delete a line
  const deleteLine = (id: string) => {
    const newDialog = dialog.filter(line => line.id !== id);
    updateDialog(newDialog.length > 0 ? newDialog : [
      { id: `line-${Date.now()}`, speaker: speakers[0]?.name || 'Speaker 1', text: '' }
    ]);
  };
  
  // Update a line
  const updateLine = (id: string, field: 'speaker' | 'text', value: string) => {
    const newDialog = dialog.map(line => 
      line.id === id ? { ...line, [field]: value } : line
    );
    updateDialog(newDialog);
  };
  
  return (
    <div className="space-y-3">
      {dialog.map((line, index) => (
        <div key={line.id} className="flex space-x-2">
          <select
            value={line.speaker}
            onChange={(e) => updateLine(line.id, 'speaker', e.target.value)}
            disabled={disabled}
            className="w-32 px-2 py-1 text-sm border border-border rounded-md"
          >
            {speakers.map(speaker => (
              <option key={speaker.id} value={speaker.name}>
                {speaker.name}
              </option>
            ))}
          </select>
          
          <input
            type="text"
            value={line.text}
            onChange={(e) => updateLine(line.id, 'text', e.target.value)}
            placeholder="Enter dialog..."
            disabled={disabled}
            className="flex-1 px-3 py-1 text-sm border border-border rounded-md"
          />
          
          <Button
            variant="ghost"
            size="icon"
            onClick={() => deleteLine(line.id)}
            disabled={disabled || dialog.length <= 1}
            className="h-8 w-8"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}
      
      <Button
        variant="outline"
        size="sm"
        onClick={addLine}
        disabled={disabled}
        className="w-full mt-2"
      >
        <Plus className="h-4 w-4 mr-2" />
        Add Dialog
      </Button>
    </div>
  );
}