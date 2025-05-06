// reporte.js
document.addEventListener('DOMContentLoaded', () => {
    if (!sessionStorage.authenticated) return location.replace('index.html');
  
    /* claves LS */
    const stuKey = 'qr_students';
    const attKey = 'qr_attendance';
    const clsKey = 'qr_totalClasses';
  
    const tbody  = document.querySelector('#report-table tbody');
    const btnExp = document.getElementById('export-btn');
    const toast  = document.getElementById('notification');
  
    /* util notificación */
    const notify = m => {toast.textContent=m;toast.style.display='block';
                         setTimeout(()=>toast.style.display='none',2200);};
  
    /* carga datos */
    const students   = JSON.parse(localStorage.getItem(stuKey)   || '[]');
    const attendance = JSON.parse(localStorage.getItem(attKey)  || '{}');
    const totClasses = parseInt(localStorage.getItem(clsKey)||'0',10) || 0;
  
    /* calcula y pinta tabla */
    function render(){
      tbody.innerHTML='';
      students.forEach(s=>{
        const asist = attendance[s.ctrl] || 0;
        const pct   = totClasses ? (asist/totClasses*100).toFixed(1) : '—';
        const pass  = parseFloat(pct)>=80;
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${s.ctrl}</td>
          <td>${s.nombre} ${s.apPat} ${s.apMat}</td>
          <td>${pct==='—' ? '—' : pct+'%'}</td>
          <td class="${pass?'pass':'fail'}">${pass?'Acreditado':'No acreditado'}</td>`;
        tbody.appendChild(tr);
      });
    }
    render();
  
    /* exportar a Excel */
    btnExp.addEventListener('click', () => {
      const wb = XLSX.utils.book_new();
      const header = ['N° Control','Nombre Completo','% Asistencia','Resultado'];
      const data = [header];
  
      tbody.querySelectorAll('tr').forEach(tr => {
        const row = [...tr.children].map(td => td.textContent);
        data.push(row);
      });
  
      const ws = XLSX.utils.aoa_to_sheet(data);
      XLSX.utils.book_append_sheet(wb, ws, 'Reporte');
      XLSX.writeFile(wb, 'reporte_asistencia.xlsx');
      notify('Excel generado 🎉');
    });
  });
  