import {getUsers,addOrUpdate,deleteUser} from './users-api.js';

document.addEventListener('DOMContentLoaded',()=>{
  if(sessionStorage.role!=='ADMIN') return location.href='welcome.html';

  const f = uForm, id=f.uid, name=f.uname, pass=f.upass, role=f.urole, cancel=document.getElementById('cancel');
  const tbody=document.querySelector('#uTable tbody'), toast=document.getElementById('toast');
  const notify=m=>{toast.textContent=m;toast.style.display='block';setTimeout(()=>toast.style.display='none',2200);};

  const render=()=>{
    tbody.innerHTML='';
    getUsers().forEach(u=>{
      tbody.insertAdjacentHTML('beforeend',`
        <tr><td>${u.id}</td><td>${u.user}</td><td>${u.rol}</td>
        <td>
          <button class="action-btn" data-e="${u.id}">✏️</button>
          <button class="action-btn" data-d="${u.id}">🗑️</button>
        </td></tr>`);
    });
  };
  render();

  f.onsubmit=e=>{
    e.preventDefault();
    addOrUpdate({id:id.value?Number(id.value):undefined,user:name.value.trim(),pass:pass.value.trim(),rol:role.value});
    notify('Guardado'); f.reset(); cancel.style.display='none'; render();
  };
  cancel.onclick=()=>{f.reset(); cancel.style.display='none';};

  tbody.onclick=e=>{
    const ed=e.target.dataset.e, del=e.target.dataset.d;
    if(ed){ const u=getUsers().find(x=>x.id==ed);
      id.value=u.id; name.value=u.user; pass.value=u.pass; role.value=u.rol; cancel.style.display='inline-block'; }
    if(del && confirm('¿Eliminar?')){ deleteUser(Number(del)); notify('Eliminado'); render(); }
  };
});
