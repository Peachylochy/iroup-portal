(function () {
  var path = (location.pathname.split('/').pop() || '').toLowerCase();
  if (!path || path === 'index.html') return;
  if (path.indexOf('public-') === 0) return;

  function hasAdminSession() {
    try {
      var raw = sessionStorage.getItem('iroup_user');
      var directToken = sessionStorage.getItem('iroup_admin_token');
      if (!raw) return !!directToken;
      var user = JSON.parse(raw);
      var token = directToken || (user && user.adminToken) || '';
      if (!token) return false;

      var expiresAt = Date.parse(user && user.sessionExpiresAt ? user.sessionExpiresAt : '');
      if (expiresAt && Date.now() >= expiresAt) {
        sessionStorage.removeItem('iroup_admin_token');
        sessionStorage.removeItem('iroup_google_access_token');
        sessionStorage.removeItem('iroup_user');
        return false;
      }
      return true;
    } catch (err) {
      return false;
    }
  }

  if (!hasAdminSession()) {
    location.replace('index.html');
  }
})();
