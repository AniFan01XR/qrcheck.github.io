/* js/logs.js – sólo ADMIN */
if (sessionStorage.role !== 'ADMIN') location.href='welcome.html';

const logs = JSON.parse(localStorage.getItem('qr_logs') || '[]');
const tbody = document.querySelector('#tbl tbody');
const profSel = document.getElementById('sel-prof');
const d1 = document.getElementById('d1');
const d2 = document.getElementById('d2');

function render(list){
  tbody.innerHTML='';
  list.forEach(l=>{
    const tr=document.createElement('tr');
    tr.innerHTML=`<td>${l.prof}</td><td>${l.code}</td><td>${new Date(l.ts).toLocaleString()}</td>`;
    tbody.appendChild(tr);
  });
}

/* llena combo profesores */
[...new Set(logs.map(l=>l.prof))].forEach(p=>{
  profSel.add(new Option(p,p));
});
render(logs);

document.getElementById('filtrar').onclick = ()=>{
  let res = logs;
  if (profSel.value) res = res.filter(l=>l.prof===profSel.value);
  if (d1.value) res = res.filter(l=> l.ts >= new Date(d1.value).getTime() );
  if (d2.value) res = res.filter(l=> l.ts <= new Date(d2.value).getTime()+864e5 );
  render(res);
};
