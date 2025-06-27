"use client";

import { useEffect } from "react";

// Client-side script to handle ColorZilla attributes and FOUC
const ColorZillaScript = () => {
  useEffect(() => {
    const removeAttributes = () => {
      document.body.removeAttribute('cz-shortcut-listen');
      document.documentElement.removeAttribute('cz-shortcut-listen');
    };

    // Run immediately
    removeAttributes();

    // Also run after DOM is fully loaded
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', removeAttributes);
    }

    // Add ready class to body for FOUC prevention
    document.documentElement.classList.add('ready');

    // And also run after a short delay to catch any late additions
    const timer = setTimeout(removeAttributes, 1000);
    
    return () => {
      clearTimeout(timer);
      document.removeEventListener('DOMContentLoaded', removeAttributes);
    };
  }, []);

  // Add FOUC prevention styles
  return (
    <style jsx global>{`
      /* Prevent FOUC */
      body {
        opacity: 0;
        transition: opacity 0.2s ease-in-out;
      }
      body.ready {
        opacity: 1;
      }
    `}</style>
  );
};

export function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ColorZillaScript />
      {children}
    </>
  );
}
