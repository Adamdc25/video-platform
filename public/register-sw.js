console.log('[register-sw.js] Script loaded');

if ('serviceWorker' in navigator) {
  console.log('[register-sw.js] ServiceWorker API available, attempting registration');

  navigator.serviceWorker.register('/sw.js', { scope: '/' })
    .then(reg => {
      console.log('✓ SW registered:', reg.scope);
      console.log('  Active:', reg.active ? 'YES' : 'NO');
      console.log('  Installing:', reg.installing ? 'YES' : 'NO');
    })
    .catch(err => {
      console.error('✗ SW registration failed:', err.message);
      console.log('[register-sw.js] Attempting fallback to sw-simple.js');

      return navigator.serviceWorker.register('/sw-simple.js', { scope: '/' })
        .then(reg => {
          console.log('✓ Fallback SW registered:', reg.scope);
        })
        .catch(err2 => {
          console.error('✗ Fallback SW also failed:', err2.message);
        });
    });
} else {
  console.log('[register-sw.js] ServiceWorker API NOT available');
}
