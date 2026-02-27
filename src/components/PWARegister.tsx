import Script from 'next/script'

export function PWARegister() {
  return (
    <Script
      id="pwa-register"
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{
        __html: `
          (function() {
            console.log('[PWARegister] Script executing');
            if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
              console.log('[PWARegister] Attempting to register /sw.js...');
              navigator.serviceWorker
                .register('/sw.js', { scope: '/' })
                .then(registration => {
                  console.log('✓ Service Worker (sw.js) registered:', registration);
                  console.log('  - Status:', registration.active ? 'active' : registration.installing ? 'installing' : 'pending');
                })
                .catch(error => {
                  console.error('✗ Failed to register sw.js:', error.message || error);
                  console.log('  Attempting fallback to simple SW...');
                  return navigator.serviceWorker.register('/sw-simple.js', { scope: '/' })
                    .then(registration => {
                      console.log('✓ Service Worker (sw-simple.js) registered:', registration);
                      console.log('  - Status:', registration.active ? 'active' : registration.installing ? 'installing' : 'pending');
                    })
                    .catch(simpleSWError => {
                      console.error('✗ Both SW registrations failed:', simpleSWError);
                    });
                });
            }
          })();
        `,
      }}
    />
  )
}
