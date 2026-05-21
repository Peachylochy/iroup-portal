(function () {
  var path = (location.pathname.split('/').pop() || '').toLowerCase();
  if (!path || path === 'index.html') return;
  if (path.indexOf('public-') === 0) return;

  function hasAdminSession() {
    try {
      if (sessionStorage.getItem('iroup_admin_token')) return true;
      var raw = sessionStorage.getItem('iroup_user');
      if (!raw) return false;
      var user = JSON.parse(raw);
      return !!(user && (user.adminToken || user.email));
    } catch (err) {
      return false;
    }
  }

  if (!hasAdminSession()) {
    location.replace('index.html');
  }
})();
