/* js/backup.js – sólo para ADMIN */
import JSZip from 'https://cdn.jsdelivr.net/npm/jszip@3.10.1/+esm';

if (sessionStorage.role !== 'ADMIN') location.href = 'welcome.html';

const btn  = document.getElementById('btn-backup');
const msg  = document.getElementById('bk-msg');

btn.onclick = async () => {
  msg.textContent = 'Generando…';
  const zip = new JSZip();
  zip.file('qr_users.json',       localStorage.getItem('qr_users')       || '[]');
  zip.file('qr_horarios.json',    localStorage.getItem('qr_horarios')    || '[]');
  zip.file('qr_asistencias.json', localStorage.getItem('qr_asistencias') || '[]');
  zip.file('qr_logs.json',        localStorage.getItem('qr_logs')        || '[]');

  const blob = await zip.generateAsync({ type:'blob' });
  const link = Object.assign(document.createElement('a'), {
    href: URL.createObjectURL(blob),
    download: 'backup_qr.zip'
  });
  link.click(); URL.revokeObjectURL(link.href);
  msg.textContent = '✔ Backup descargado';
};
