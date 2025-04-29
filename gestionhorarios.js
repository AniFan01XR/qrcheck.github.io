// gestionhorarios.js
document.addEventListener('DOMContentLoaded', () => {
    if (!sessionStorage.authenticated) return location.replace('index.html');
  
    /* ---------- claves por profesor ---------- */
    const user   = sessionStorage.username || 'user';
    const KEY    = `qr_schedules_${user}`;
  
    /* ---------- utilidades LS ---------- */
    const getSched = () => JSON.parse(localStorage.getItem(KEY)||'[]');
    const setSched = arr => localStorage.setItem(KEY, JSON.stringify(arr));
  
    /* ---------- refs ---------- */
    const $ = s => document.querySelector(s);
    const form   = $('#class-form');
    const title  = $('#form-title');
    const subjIn = $('#subject');
    const startIn= $('#start');
    const endIn  = $('#end');
    const daysBox= [...document.querySelectorAll('#day-group input')];
    const cancel = $('#cancel-btn');
    const tbody  = $('#schedule-table tbody');
    const toast  = $('#notification');
  
    let editIdx = null;
  
    const notify = msg => {toast.textContent=msg;toast.style.display='block';
                           setTimeout(()=>toast.style.display='none',2000);};
  
    /* ---------- render tabla ---------- */
    function render(){
      const list = getSched();
      tbody.innerHTML='';
      list.forEach((c,i)=>{
        const tr=document.createElement('tr');
        tr.innerHTML=`
          <td>${c.subj}</td>
          <td>${c.days.join(', ')}</td>
          <td>${c.start} – ${c.end}</td>
          <td>${c.horasSem}</td>
          <td>
            <button class="action-btn" data-edit="${i}" title="Editar"><i class="fas fa-pen"></i></button>
            <button class="action-btn" data-del="${i}"  title="Eliminar"><i class="fas fa-trash"></i></button>
          </td>`;
        tbody.appendChild(tr);
      });
    }
    render();
  
    /* ---------- helpers ---------- */
    const calcHoras = (s,e,nd) => {
      const [hs,ms]=s.split(':').map(Number),
            [he,me]=e.split(':').map(Number);
      const hrs = (he+me/60) - (hs+ms/60);
      return (hrs*nd).toFixed(1);
    };
  
    /* ---------- alta / edición ---------- */
    form.addEventListener('submit',e=>{
      e.preventDefault();
      const subj = subjIn.value.trim();
      const days = daysBox.filter(c=>c.checked).map(c=>c.value);
      if(!days.length) return notify('Selecciona al menos un día');
      const start=startIn.value,end=endIn.value;
      if(!start||!end||start>=end) return notify('Hora inválida');
  
      const semHrs = calcHoras(start,end,days.length);
      const arr = getSched();
  
      if(editIdx===null){
        arr.push({subj,days,start,end,horasSem:semHrs});
        notify('Clase añadida');
      }else{
        arr[editIdx]={subj,days,start,end,horasSem:semHrs};
        editIdx=null; title.textContent='Añadir Clase'; cancel.style.display='none';
        notify('Clase actualizada');
      }
      setSched(arr); form.reset(); render();
      daysBox.forEach(c=>c.checked=false);
    });
  
    cancel.addEventListener('click',()=>{
      editIdx=null; form.reset(); daysBox.forEach(c=>c.checked=false);
      title.textContent='Añadir Clase'; cancel.style.display='none';
    });
  
    /* ---------- acciones tabla ---------- */
    tbody.addEventListener('click',e=>{
      const ed = e.target.closest('[data-edit]')?.dataset.edit;
      const dl = e.target.closest('[data-del]')?.dataset.del;
      const arr=getSched();
      if(ed!==undefined){
        const c=arr[ed];
        subjIn.value=c.subj;
        daysBox.forEach(cb=>cb.checked=c.days.includes(cb.value));
        startIn.value=c.start; endIn.value=c.end;
        editIdx=parseInt(ed,10);
        title.textContent='Editar Clase'; cancel.style.display='inline-block';
      }
      if(dl!==undefined){
        if(confirm('¿Eliminar clase?')){
          arr.splice(dl,1); setSched(arr); render(); notify('Eliminada');
        }
      }
    });
  });
  