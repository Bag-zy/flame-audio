'use client';

import dynamic from 'next/dynamic';
import { Suspense } from 'react';

// Loading component for suspense fallback
const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-[50vh]">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
  </div>
);

// Dynamically import components with no SSR
const Features = dynamic(() => import('@/components/sections/Features'), { ssr: false });
const HowItWorks = dynamic(() => import('@/components/sections/HowItWorks'), { ssr: false });
const Pricing = dynamic(() => import('@/components/sections/Pricing'), { ssr: false });
const Contact = dynamic(() => import('@/components/sections/Contact'), { ssr: false });

export default function DynamicSections() {
  return (
    <>
      <Suspense fallback={<LoadingSpinner />}>
        <Features />
      </Suspense>
      
      <Suspense fallback={<LoadingSpinner />}>
        <HowItWorks />
      </Suspense>
      
      
      <Suspense fallback={<LoadingSpinner />}>
        <Contact />
      </Suspense>
    </>
  );
}
