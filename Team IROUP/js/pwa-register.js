(function () {
  if (!('serviceWorker' in navigator)) return;
  if (location.protocol !== 'https:' && location.hostname !== 'localhost' && location.hostname !== '127.0.0.1') return;

  window.addEventListener('load', function () {
    navigator.serviceWorker.register('/service-worker.js', { scope: '/' })
      .catch(function () {
        // Keep PWA registration non-blocking for auth and data loading.
      });
  });
})();
