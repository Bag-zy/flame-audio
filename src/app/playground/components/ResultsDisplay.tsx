'use client';

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Check, 
  Copy, 
  Download, 
  ChevronDown, 
  ChevronRight, 
  ChevronUp, 
  Play, 
  Pause, 
  Clock, 
  FileText,
  ArrowLeft
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { IconProps, ResultsDisplayProps } from "../types/index";

// Utility function for time formatting
const formatTimeLocal = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

const FileTextIcon: React.FC<IconProps> = ({ className, ...props }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
    <polyline points="14 2 14 8 20 8"/>
    <line x1="16" y1="13" x2="8" y2="13"/>
    <line x1="16" y1="17" x2="8" y2="17"/>
    <line x1="10" y1="9" x2="8" y2="9"/>
  </svg>
);

const ListIcon: React.FC<IconProps> = ({ className, ...props }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="8" y1="6" x2="21" y2="6"/>
    <line x1="8" y1="12" x2="21" y2="12"/>
    <line x1="8" y1="18" x2="21" y2="18"/>
    <line x1="3" y1="6" x2="3.01" y2="6"/>
    <line x1="3" y1="12" x2="3.01" y2="12"/>
    <line x1="3" y1="18" x2="3.01" y2="18"/>
  </svg>
);

const CodeIcon: React.FC<IconProps> = ({ className, ...props }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="16 18 22 12 16 6"/>
    <polyline points="8 6 2 12 8 18"/>
  </svg>
);

const ArrowLeftIcon: React.FC<IconProps> = ({ className, ...props }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12"/>
    <polyline points="12 19 5 12 12 5"/>
  </svg>
);

const SettingsIcon: React.FC<IconProps> = ({ className, ...props }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3"/>
    <path d="M19.4 15c-1.8 0-3.3-.6-4.6-1.6L12 9.4 9.4 12 6.6 14.4c-1.3.9-2.8 1.6-4.6 1.6"/>
    <path d="M18.1 18.7H12v-2.6h6.1"/>
  </svg>
);

const GlobeIcon: React.FC<IconProps> = ({ className, ...props }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <line x1="2" y1="12" x2="22" y2="12"/>
    <path d="M12 2a15.3 15.3 0 0 1 4 1 9 9 0 0 1 5 4 9.71 9.71 0 0 1 2 5.71m-4-3a9 9 0 0 1-4.71 2c-3.17.75-6.68 1.73-10 3"/>
  </svg>
);

const CheckIcon = Check;
const CopyIcon = Copy;
const DownloadIcon = Download;
const ClockIcon = Clock;

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

// ResultsDisplayProps is imported from types/index

// Segment component for better organization
const SegmentItem = ({ 
  segment, 
  index, 
  isExpanded, 
  onToggle 
}: { 
  segment: TranscriptionSegment; 
  index: number;
  isExpanded: boolean;
  onToggle: () => void;
}) => {
  const confidence = 1 - (segment.no_speech_prob || 0);
  const confidencePercent = Math.round(confidence * 100);
  const duration = segment.end - segment.start;

  return (
    <div className="border rounded-lg overflow-hidden transition-all duration-200 hover:shadow-sm">
      <div
        className="px-4 py-3 bg-card flex justify-between items-center cursor-pointer hover:bg-muted transition-colors"
        onClick={onToggle}
      >
        <div className="flex items-center space-x-3 w-full">
          <div className="flex-shrink-0 flex items-center justify-center h-8 w-8 rounded-full bg-blue-50 text-blue-600">
            {isExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-foreground truncate">
                {formatTimeLocal(segment.start)} - {formatTimeLocal(segment.end)}
              </span>
              <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
                {duration.toFixed(1)}s
              </span>
            </div>
            
            <div className="flex items-center mt-1">
              <div className="h-1.5 flex-1 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={cn(
                    'h-full',
                    confidence > 0.8 ? 'bg-green-500' : 
                    confidence > 0.6 ? 'bg-blue-500' : 
                    confidence > 0.4 ? 'bg-yellow-500' : 'bg-red-500'
                  )}
                  style={{ width: `${Math.max(5, confidence * 100)}%` }}
                />
              </div>
              <span className="ml-2 text-xs font-medium text-gray-500 w-12 text-right">
                {confidencePercent}%
              </span>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="p-4 border-t border-border bg-muted">
              <p className="text-foreground whitespace-pre-wrap mb-4">{segment.text}</p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-3 border-t border-gray-200">
                <div className="space-y-1">
                  <p className="text-xs font-medium text-gray-500">Start Time</p>
                  <p className="text-sm font-mono">{segment.start.toFixed(2)}s</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium text-gray-500">End Time</p>
                  <p className="text-sm font-mono">{segment.end.toFixed(2)}s</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium text-gray-500">Duration</p>
                  <p className="text-sm font-mono">{duration.toFixed(2)}s</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium text-gray-500">Confidence</p>
                  <div className="flex items-center">
                    <div className={cn(
                      'h-2 w-2 rounded-full mr-2',
                      confidence > 0.8 ? 'bg-green-500' : 
                      confidence > 0.6 ? 'bg-blue-500' : 
                      confidence > 0.4 ? 'bg-yellow-500' : 'bg-red-500'
                    )} />
                    <span className="text-sm">{confidencePercent}%</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};



export function ResultsDisplay({ result, onReset, task, className }: ResultsDisplayProps) {
  const [activeTab, setActiveTab] = useState("text");
  const [expandedSegment, setExpandedSegment] = useState<number | null>(0);
  const [copied, setCopied] = useState(false);
  const [downloadFormat, setDownloadFormat] = useState<string>("txt");
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);
  
  // Calculate total duration from segments if available
  const duration = useMemo(() => 
    result.segments?.reduce((acc, seg) => Math.max(acc, seg.end), 0) || 0, 
    [result.segments]
  );

  // Memoize the formatted duration
  const formattedDuration = useMemo(() => formatTimeLocal(duration), [duration]);

  // Toggle segment expansion
  const toggleSegment = (index: number) => {
    setExpandedSegment(expandedSegment === index ? null : index);
  };

  // Copy text to clipboard
  const copyToClipboard = useCallback(() => {
    if (!result) return;
    const textToCopy = activeTab === "json" ? JSON.stringify(result, null, 2) : result.text;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [result, activeTab]);

  // Handle file download
  const handleDownload = useCallback((format: string) => {
    if (!result) return;

    let content = '';
    let extension = '';

    if (format === 'txt') {
      content = result.text;
      extension = 'txt';
    } else if (format === 'json') {
      content = JSON.stringify(result, null, 2);
      extension = 'json';
    } else if (format === 'srt') {
      content = result.segments?.map((segment, index) => {
        const start = new Date(segment.start * 1000).toISOString().substr(11, 12);
        const end = new Date(segment.end * 1000).toISOString().substr(11, 12);
        return `${index + 1}\n${start} --> ${end}\n${segment.text}\n`;
      }).join('\n') || '';
      extension = 'srt';
    }

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transcription.${extension}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [result]);

  // Auto-scroll to top when tab changes
  // useEffect(() => {
  //   window.scrollTo({ top: 0, behavior: 'smooth' });
  // }, [activeTab]);

  return (
    <div className={cn("bg-card rounded-xl shadow-sm overflow-hidden border border-border flex flex-col h-full", className)}>
      {/* Header */}
      <div className="px-6 py-4 border-b border-border bg-card">
        <div className="flex flex-col space-y-3 w-full">
          <div className="flex items-center justify-between w-full">
            <h2 className="text-xl font-semibold text-foreground">
              {task === 'translate' ? 'Translation' : 'Transcription'} Results
            </h2>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onReset}
                className="flex items-center space-x-1.5 bg-card hover:bg-muted"
              >
                <ArrowLeftIcon className="h-4 w-4" />
                <span>New {task === 'translate' ? 'Translation' : 'Transcription'}</span>
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="bg-card hover:bg-muted">
                    <DownloadIcon className="h-4 w-4 mr-2" />
                    <span>Export</span>
                    <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40">
                  <DropdownMenuItem onClick={() => handleDownload('txt')}>
                    <FileText className="mr-2 h-4 w-4" />
                    <span>Text (.txt)</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleDownload('srt')}>
                    <FileText className="mr-2 h-4 w-4" />
                    <span>Subtitle (.srt)</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleDownload('json')}>
                    <CodeIcon className="mr-2 h-4 w-4" />
                    <span>JSON (.json)</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
            {result.language && (
              <div className="flex items-center">
                <GlobeIcon className="h-4 w-4 mr-1.5 text-gray-400" />
                <span className="font-medium">{result.language.toUpperCase()}</span>
              </div>
            )}

            {duration > 0 && (
              <div className="flex items-center">
                <ClockIcon className="h-4 w-4 mr-1.5 text-gray-400" />
                <span>{formatTimeLocal(duration)}</span>
              </div>
            )}

            {result.segments && (
              <div className="flex items-center">
                <ListIcon className="h-4 w-4 mr-1.5 text-gray-400" />
                <span>{result.segments.length} segments</span>
              </div>
            )}
            
            <div className="flex-1 flex justify-end">
              <Button
                variant="ghost"
                size="sm"
                onClick={copyToClipboard}
                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
              >
                {copied ? (
                  <CheckIcon className="h-4 w-4 mr-1.5 text-green-500" />
                ) : (
                  <CopyIcon className="h-4 w-4 mr-1.5" />
                )}
                <span>{copied ? 'Copied!' : 'Copy'}</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="flex-1 flex flex-col overflow-hidden"
        defaultValue="text"
      >
        <div className="border-b border-gray-100">
          <TabsList className="bg-transparent h-10 rounded-none px-6">
            <TabsTrigger
              value="text"
              className="relative h-9 rounded-none border-b-2 border-transparent px-4 py-1.5 text-sm font-medium text-gray-500 transition-none data-[state=active]:border-blue-500 data-[state=active]:text-gray-900 data-[state=active]:shadow-none"
            >
              <FileTextIcon className="h-4 w-4 mr-2" />
              <span>Text</span>
            </TabsTrigger>
            <TabsTrigger
              value="segments"
              className="relative h-9 rounded-none border-b-2 border-transparent px-4 py-1.5 text-sm font-medium text-gray-500 transition-none data-[state=active]:border-blue-500 data-[state=active]:text-gray-900 data-[state=active]:shadow-none"
            >
              <ListIcon className="h-4 w-4 mr-2" />
              <span>Segments</span>
              {result.segments && (
                <span className="ml-2 px-1.5 py-0.5 text-xs font-medium bg-gray-100 text-gray-600 rounded-full">
                  {result.segments.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger
              value="json"
              className="relative h-9 rounded-none border-b-2 border-transparent px-4 py-1.5 text-sm font-medium text-gray-500 transition-none data-[state=active]:border-blue-500 data-[state=active]:text-gray-900 data-[state=active]:shadow-none"
            >
              <CodeIcon className="h-4 w-4 mr-2" />
              <span>JSON</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="flex-1 overflow-auto">
          {/* Text Tab */}
          <TabsContent value="text" className="m-0 h-full">
            <div className="relative h-full">
              <div className="absolute inset-0 p-6">
                <div className="h-full border rounded-lg bg-muted p-4 overflow-auto">
                  <pre className="whitespace-pre-wrap font-sans text-sm text-foreground">
                    {result.text}
                  </pre>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Segments Tab */}
          <TabsContent value="segments" className="m-0 p-6 space-y-3">
            {result.segments?.length ? (
              <div className="space-y-3">
                {result.segments.map((segment, index) => (
                  <SegmentItem
                    key={index}
                    segment={segment}
                    index={index}
                    isExpanded={expandedSegment === index}
                    onToggle={() => toggleSegment(index)}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <FileTextIcon className="h-10 w-10 text-gray-300 mb-3" />
                <h3 className="text-sm font-medium text-gray-900">No segments available</h3>
                <p className="mt-1 text-sm text-gray-500">This transcription doesn't contain any segments.</p>
              </div>
            )}
          </TabsContent>

          {/* JSON Tab */}
          <TabsContent value="json" className="m-0 h-full">
            <div className="relative h-full">
              <div className="absolute inset-0 p-6">
                <div className="h-full border rounded-lg bg-muted p-4 overflow-auto">
                  <pre className="text-xs text-foreground overflow-auto">
                    {JSON.stringify(result, null, 2)}
                  </pre>
                </div>
              </div>
              
              <div className="absolute top-8 right-8">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={copyToClipboard}
                  className="h-8 w-8 bg-card/80 backdrop-blur-sm hover:bg-card"
                  title="Copy to clipboard"
                >
                  {copied ? (
                    <CheckIcon className="h-4 w-4 text-green-500" />
                  ) : (
                    <CopyIcon className="h-4 w-4" />
                  )}
                  <span className="sr-only">Copy JSON</span>
                </Button>
              </div>
            </div>
          </TabsContent>
        </div>
      </Tabs>

      {/* Action Buttons */}
      <div className="px-6 py-4 border-t border-border bg-muted flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={copyToClipboard}
            className="gap-1.5"
          >
            {copied ? (
              <CheckIcon className="h-4 w-4 text-green-600" />
            ) : (
              <CopyIcon className="h-4 w-4" />
            )}
            {copied ? 'Copied!' : 'Copy'}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => handleDownload('txt')}
            className="h-8 px-3 text-xs"
          >
            <DownloadIcon className="mr-1 h-3.5 w-3.5" />
            TXT
          </Button>

          {result.segments && result.segments.length > 0 && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDownload('vtt')}
                className="h-8 px-3 text-xs"
              >
                <DownloadIcon className="h-4 w-4" />
                VTT
              </Button>
            </>
          )}
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleDownload('json')}
            className="gap-1.5"
          >
            <CodeIcon className="h-4 w-4" />
            JSON
          </Button>
        </div>
      </div>
    </div>
  );
}
