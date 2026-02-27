'use client';

import { useEffect, useState } from 'react';

export default function PWAUpdateNotifier() {
  const [updateAvailable, setUpdateAvailable] = useState(false);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      const registration = navigator.serviceWorker;

      // Listen for new service worker waiting
      registration.ready.then((reg) => {
        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing;

          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (
                newWorker.state === 'installed' &&
                navigator.serviceWorker.controller
              ) {
                // New service worker is ready, show notification
                setUpdateAvailable(true);
              }
            });
          }
        });
      });

      // Check for updates periodically
      const updateInterval = setInterval(() => {
        registration.ready.then((reg) => reg.update());
      }, 60000); // Check every minute

      return () => clearInterval(updateInterval);
    }
  }, []);

  const handleUpdate = () => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((registration) => {
        if (registration.waiting) {
          registration.waiting.postMessage({ type: 'SKIP_WAITING' });
          setUpdateAvailable(false);

          // Reload the page after short delay
          setTimeout(() => {
            window.location.reload();
          }, 100);
        }
      });
    }
  };

  const handleDismiss = () => {
    setUpdateAvailable(false);
  };

  if (!updateAvailable) {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 right-0 bg-blue-600 text-white px-4 py-3 shadow-lg z-50">
      <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
          <p className="text-sm font-medium">A new version is available!</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleDismiss}
            className="px-3 py-1 text-sm hover:bg-blue-700 rounded"
          >
            Dismiss
          </button>
          <button
            onClick={handleUpdate}
            className="px-3 py-1 text-sm bg-white text-blue-600 hover:bg-gray-100 rounded font-semibold"
          >
            Update
          </button>
        </div>
      </div>
    </div>
  );
}
