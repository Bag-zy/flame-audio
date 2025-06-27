'use client';

import { ThemeProvider } from "@/components/theme-provider"
import { ToastProvider } from "@/providers/toast-provider"
import { useEffect, useState } from "react"

// Helper to safely handle browser-only code
type SafeHTMLBodyElement = HTMLElement & {
  removeAttribute(name: string): void;
};

export function ClientThemeProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    // Only run on client
    setMounted(true)
    
    // Cleanup function to remove any ColorZilla attributes
    const cleanup = () => {
      if (typeof document !== 'undefined') {
        const body = document.body as SafeHTMLBodyElement;
        body?.removeAttribute('cz-shortcut-listen');
        document.documentElement.removeAttribute('cz-shortcut-listen');
      }
    };
    
    // Run cleanup immediately
    cleanup();
    
    // Set up mutation observer to catch any late additions
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'cz-shortcut-listen') {
          cleanup();
        }
      });
    });
    
    // Start observing the document with the configured parameters
    if (typeof document !== 'undefined') {
      observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['cz-shortcut-listen'],
        childList: false,
        subtree: true
      });
      
      // Also clean up on window load in case it's added late
      window.addEventListener('load', cleanup);
    }
    
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('load', cleanup);
      }
      observer.disconnect();
      cleanup();
    };
  }, [])

  // Don't render until we're on the client to prevent hydration mismatch
  if (!mounted) {
    // Return a simple div with the same dimensions as the app to prevent layout shift
    return (
      <div 
        className="min-h-screen flex flex-col"
        style={{ 
          visibility: 'hidden',
          minHeight: '100vh',
          opacity: 0,
          transition: 'opacity 0.2s ease-in-out'
        }}
      />
    )
  }

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <ToastProvider>
        {children}
      </ToastProvider>
    </ThemeProvider>
  )
}
