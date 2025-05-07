/* ───────── js/menu.js · v0.0.25 ───────── */
const APP_VERSION = 'v0.0.25';

document.addEventListener('DOMContentLoaded', async () => {

  /* 1 ░ Inyectar menú + header */
  const html = await (await fetch('menu.html')).text();
  document.body.insertAdjacentHTML('afterbegin', html);

  /* 2 ░ Config global (tema, mantenimiento…) */
  const cfg  = JSON.parse(localStorage.qr_config || '{}');
  const role = sessionStorage.role || 'ANON';

  if (cfg.dark) document.documentElement.classList.add('dark');

  /* 3 ░ Modo mantenimiento
        - pasa ADMIN siempre
        - pasa cualquier rol incluido en cfg.allowedRoles (si existe) */
  const allowed = cfg.allowedRoles || ['ADMIN','QR_SUPPORT'];
  if (cfg.maintenance && !allowed.includes(role)) {
    location.replace('maintenance.html');
    return;
  }

  /* 4 ░ Saludo + versión */
  document.getElementById('user-name').textContent =
    sessionStorage.username || 'Invitado';
  const span = document.getElementById('app-ver');
  if (span) span.textContent = APP_VERSION;

  /* 5 ░ Permisos por rol  (data-page) */
  const allow = {
    ADMIN: [
      'welcome','pase-lista','calendario','gestionhorarios','gestionalumnos',
      'reporte','mandar','usuarios','backup','logs','soporte','config'
    ],
    QR_SUPPORT: [
      'welcome','pase-lista','calendario','gestionalumnos','reporte',
      'mandar','support-panel','soporte'
    ],
    PROFESOR: [
      'welcome','pase-lista','calendario','gestionhorarios','gestionalumnos',
      'mandar','desempeno','cambiar-pass','soporte'
    ]
  }[role] || [];

  /* 6 ░ Ocultar entradas no permitidas */
  document.querySelectorAll('.sidebar-menu li').forEach(li=>{
    const p = li.dataset.page;
    if (p && !allow.includes(p)) li.remove();
  });

  /* 7 ░ Resaltar enlace activo + cerrar en móvil */
  document.querySelectorAll('.sidebar-menu a').forEach(a=>{
    if (a.href === location.href) a.parentElement.classList.add('active');
    a.onclick = () => document.body.classList.remove('sidebar-open');
  });

  /* 8 ░ Hamburguesa */
  document.getElementById('sidebar-toggle').onclick =
    ()=> document.body.classList.toggle('sidebar-open');

  /* 9 ░ Logout */
  document.getElementById('logout').onclick = e=>{
    e.preventDefault();
    sessionStorage.clear();
    location.replace('index.html');
  };
});
