import React, { useEffect } from 'react';

declare global {
  interface Window {
    workbox: any;
  }
}

const PWAUpdatePrompt: React.FC = () => {
  useEffect(() => {
    // Register service worker manually if not already registered
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('SW registered: ', registration);
        })
        .catch((registrationError) => {
          console.log('SW registration failed: ', registrationError);
        });
    }

    // Check if service worker and workbox are available
    if ('serviceWorker' in navigator && window.workbox) {
      const wb = window.workbox;

      // Add an event listener to detect when a new service worker is waiting
      wb.addEventListener('waiting', (event: any) => {
        // Show an update prompt to the user
        if (confirm('A new version is available! Click OK to update.')) {
          // Tell the waiting service worker to skip waiting and become active
          wb.messageSkipWaiting();
          
          // Reload the page to load the new version
          window.location.reload();
        }
      });

      // Register the service worker
      wb.register();
    }
  }, []);

  return null; // This component doesn't render anything
};

export default PWAUpdatePrompt;