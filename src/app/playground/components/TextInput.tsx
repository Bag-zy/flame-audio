'use client';

import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface TextInputProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  rows?: number;
  className?: string;
}

export function TextInput({
  value,
  onChange,
  label = 'Text',
  placeholder = 'Enter your text here...',
  disabled = false,
  rows = 8,
  className = ''
}: TextInputProps) {
  return (
    <div className={`space-y-2 ${className}`}>
      {label && <Label htmlFor="text-input">{label}</Label>}
      <Textarea
        id="text-input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        rows={rows}
        className="resize-none w-full"
      />
    </div>
  );
}