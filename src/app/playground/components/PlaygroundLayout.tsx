'use client';

import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Icons } from '@/components/ui/icons';

type PlaygroundLayoutProps = {
  title: string;
  description: string;
  sidebar: ReactNode;
  children: ReactNode;
  isProcessing?: boolean;
  progress?: number;
  task?: 'transcribe' | 'translate';
};

export function PlaygroundLayout({
  title,
  description,
  sidebar,
  children,
  isProcessing = false,
  progress = 0,
  task = 'transcribe',
}: PlaygroundLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
              <p className="text-sm text-gray-500">{description}</p>
            </div>
            <div className="flex items-center space-x-2">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {task === 'translate' ? 'Translation Mode' : 'Transcription Mode'}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Progress Bar */}
      {isProcessing && (
        <div className="h-1 bg-gray-200">
          <motion.div
            className="h-full bg-blue-600"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="w-full lg:w-80 flex-shrink-0">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              {sidebar}
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              {children}
            </div>
          </div>
        </div>
      </main>

    </div>
  );
}
