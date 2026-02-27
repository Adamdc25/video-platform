'use client';

import { useEffect, useState } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function PWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('Service Worker registered successfully:', registration);
        })
        .catch((error) => {
          console.log('Service Worker registration failed:', error);
        });
    }

    // Check if running on iOS
    const userAgent = window.navigator.userAgent;
    const isAppleDevice = /iPad|iPhone|iPod/.test(userAgent) && !('MSStream' in window);
    setIsIOS(isAppleDevice);

    // Handle the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowInstallPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User response to the install prompt: ${outcome}`);

    setDeferredPrompt(null);
    setShowInstallPrompt(false);
  };

  const handleDismiss = () => {
    setShowInstallPrompt(false);
  };

  // Show iOS installation instructions if needed
  if (isIOS && showInstallPrompt) {
    return (
      <div className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800 p-4 text-center text-sm">
        <p className="text-gray-300 mb-2">To install this app:</p>
        <p className="text-gray-400">
          Tap <span className="font-semibold">Share</span> then <span className="font-semibold">Add to Home Screen</span>
        </p>
        <button
          onClick={handleDismiss}
          className="mt-3 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded text-sm text-gray-200"
        >
          Dismiss
        </button>
      </div>
    );
  }

  // Show Android/Desktop install prompt
  if (showInstallPrompt && deferredPrompt) {
    return (
      <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-purple-600 to-blue-600 p-4 shadow-lg">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="text-white">
            <h3 className="font-semibold mb-1">Install Video Platform</h3>
            <p className="text-sm opacity-90">Get quick access - add to your home screen</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleDismiss}
              className="px-4 py-2 bg-white bg-opacity-20 hover:bg-opacity-30 text-white rounded font-medium text-sm"
            >
              Not Now
            </button>
            <button
              onClick={handleInstallClick}
              className="px-4 py-2 bg-white text-purple-600 hover:bg-opacity-90 rounded font-semibold text-sm"
            >
              Install
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
