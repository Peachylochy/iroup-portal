// Auto-load saved theme preference (no FOUC)
(function() {
  const saved = localStorage.getItem('iroup-theme') || 'light';
  document.documentElement.setAttribute('data-theme', saved);
})();
