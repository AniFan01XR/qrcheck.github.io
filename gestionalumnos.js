// gestionalumnos.js
document.addEventListener('DOMContentLoaded', () => {
    if (!sessionStorage.authenticated) return location.replace('index.html');
  
    const KEY_STUD   = 'qr_students';      // lista alumnos
    const KEY_ATTEND = 'qr_attendance';    // registros asistencia
    const KEY_CLASSES= 'qr_totalClasses';  // clases impartidas
  
    const $ = s => document.querySelector(s);
  
    const form      = $('#alumno-form'),
          title     = $('#form-title'),
          ctrlIn    = $('#ctrl'),
          nomIn     = $('#nombre'),
          patIn     = $('#ap-pat'),
          matIn     = $('#ap-mat'),
          cancelBtn = $('#cancel-btn'),
          tbody     = $('#alumno-table tbody'),
          toast     = $('#notification');
  
    let editIndex = null;  // null = modo alta
  
    /* util storage */
    const getStudents   = () => JSON.parse(localStorage.getItem(KEY_STUD)||'[]');
    const setStudents   = arr => localStorage.setItem(KEY_STUD, JSON.stringify(arr));
    const getAttendance = () => JSON.parse(localStorage.getItem(KEY_ATTEND)||'{}');
    const totalClasses  = parseInt(localStorage.getItem(KEY_CLASSES)||'0',10) || 0;
  
    const notify = msg => {toast.textContent=msg;toast.style.display='block';
                           setTimeout(()=>toast.style.display='none',2200);};
  
    /* render tabla */
    function render(){
      const stu = getStudents(), att = getAttendance();
      tbody.innerHTML='';
      stu.forEach((s,i)=>{
        const p  = totalClasses? ((att[s.ctrl]||0)/totalClasses*100).toFixed(1)+'%' : '-';
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${s.ctrl}</td>
          <td>${s.nombre} ${s.apPat} ${s.apMat}</td>
          <td>${p}</td>
          <td>
            <button class="action-btn" data-edit="${i}" title="Editar"><i class="fas fa-pen"></i></button>
            <button class="action-btn" data-del="${i}"  title="Eliminar"><i class="fas fa-trash"></i></button>
          </td>`;
        tbody.appendChild(tr);
      });
    }
    render();
  
    /* alta / edición */
    form.addEventListener('submit', e=>{
      e.preventDefault();
      const ctrl   = ctrlIn.value.trim(),
            nombre = nomIn.value.trim(),
            apPat  = patIn.value.trim(),
            apMat  = matIn.value.trim();
  
      if(!/^\d{8,10}$/.test(ctrl)){   // ← aquí validamos longitud 8-10 dígitos
        notify('Número de control inválido');
        return;
      }
      const students = getStudents();
  
      if(editIndex===null){
        if(students.some(s=>s.ctrl===ctrl)) return notify('Ya existe ese número');
        students.push({ctrl,nombre,apPat,apMat});
        notify('Alumno añadido');
      }else{
        if(students.some((s,idx)=>s.ctrl===ctrl && idx!==editIndex))
          return notify('Otro alumno ya usa ese número');
        students[editIndex] = {ctrl,nombre,apPat,apMat};
        notify('Alumno actualizado');
        editIndex=null; title.textContent='Añadir Alumno'; cancelBtn.style.display='none';
      }
      setStudents(students); form.reset(); render();
    });
  
    cancelBtn.addEventListener('click', ()=>{
      editIndex=null; form.reset();
      title.textContent='Añadir Alumno'; cancelBtn.style.display='none';
    });
  
    tbody.addEventListener('click', e=>{
      const iEdit = e.target.closest('[data-edit]')?.dataset.edit;
      const iDel  = e.target.closest('[data-del]')?.dataset.del;
      const stu   = getStudents();
      if(iEdit!==undefined){
        const s=stu[iEdit];
        ctrlIn.value=s.ctrl; nomIn.value=s.nombre; patIn.value=s.apPat; matIn.value=s.apMat;
        editIndex=parseInt(iEdit,10); title.textContent='Editar Alumno'; cancelBtn.style.display='inline-block';
      }
      if(iDel!==undefined){
        if(confirm('¿Eliminar alumno?')){
          stu.splice(iDel,1); setStudents(stu); notify('Eliminado'); render();
        }
      }
    });
  });
  