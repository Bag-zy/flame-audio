export interface TranscriptionSegment {
  id: number;
  start: number;
  end: number;
  text: string;
  tokens: number[];
  temperature: number;
  avg_logprob: number;
  compression_ratio: number;
  no_speech_prob: number;
}

export interface TranscriptionResult {
  text: string;
  segments?: TranscriptionSegment[];
  language?: string;
}

export interface ResultsDisplayProps {
  result: TranscriptionResult;
  onReset: () => void;
  task: 'transcribe' | 'translate';
  className?: string;
}

// Icon component props
export interface IconProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
}
