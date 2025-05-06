// menu.js
document.addEventListener('DOMContentLoaded', async () => {
  /* ── 1. Insertar menú & header ───────────────────────── */
  const resp = await fetch('menu.html');
  document.body.insertAdjacentHTML('afterbegin', await resp.text());

  /* ── 2. Tema oscuro (lee localStorage) ───────────────── */
  const cfg = JSON.parse(localStorage.getItem('qr_config') || '{}');
  if (cfg.dark) document.documentElement.classList.add('dark');

  /* ── 3. Saludo ───────────────────────────────────────── */
  const user = sessionStorage.username || 'Usuario';
  document.getElementById('user-name').textContent = user;

  /* ── 4. Resaltar enlace activo ───────────────────────── */
  document.querySelectorAll('.sidebar-menu a').forEach(a => {
    if (a.href === location.href) a.parentElement.classList.add('active');
    /* cerrar menú en móvil al navegar */
    a.addEventListener('click', () => document.body.classList.remove('sidebar-open'));
  });

  /* ── 5. Toggle sidebar ───────────────────────────────── */
  document.getElementById('sidebar-toggle')
    .addEventListener('click', () =>
      document.body.classList.toggle('sidebar-open')
    );

  /* ── 6. Logout ───────────────────────────────────────── */
  document.getElementById('logout').addEventListener('click', e => {
    e.preventDefault();
    sessionStorage.clear();
    location.replace('index.html');
  });
});
