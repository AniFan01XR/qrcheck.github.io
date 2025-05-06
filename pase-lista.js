// pase-lista.js

document.addEventListener('DOMContentLoaded', () => {
  if (!sessionStorage.authenticated) return location.replace('index.html');

  const locStatus    = document.getElementById('loc-status');
  const muteBtn      = document.getElementById('mute-btn');
  const toggleBtn    = document.getElementById('toggle-scan');
  const verifyBtn    = document.getElementById('verify-loc');
  const exportBtn    = document.getElementById('export-excel');
  const sendBtn      = document.getElementById('send-data');
  const attendanceUL = document.getElementById('attendance-list');
  const teacherDiv   = document.getElementById('teacher-qr');
  const notification = document.getElementById('notification');
  const fileInput    = document.getElementById('file-input');
  const useFileBtn   = document.getElementById('use-file-btn');

  let voiceEnabled = true,
      scanning     = true,
      attendance   = [];

  function notify(msg) {
    notification.textContent = msg;
    notification.style.display = 'block';
    setTimeout(() => notification.style.display = 'none', 2000);
    if (voiceEnabled && 'speechSynthesis' in window) {
      speechSynthesis.speak(new SpeechSynthesisUtterance(msg));
    }
  }

  function checkLocation() {
    if (!navigator.geolocation) {
      locStatus.textContent = 'GPS no soportado';
      return;
    }
    locStatus.textContent = 'Obteniendo ubicación…';
    navigator.geolocation.getCurrentPosition(pos => {
      const d = distanceMeters(
        pos.coords.latitude, pos.coords.longitude,
        19.646695663446657, -99.22834716784566
      );
      locStatus.textContent = d <= 500 ?
        `Dentro (${Math.round(d)}m)` :
        `Fuera (${Math.round(d)}m)`;
      locStatus.style.color = d <= 500 ? 'var(--primary)' : '#e8504c';
    }, () => {
      locStatus.textContent = 'Permiso ubicación denegado';
      locStatus.style.color = '#e8504c';
    }, { enableHighAccuracy: true });
  }
  function distanceMeters(lat1,lon1,lat2,lon2){
    const R=6371000, toRad=x=>x*Math.PI/180;
    const dLat=toRad(lat2-lat1), dLon=toRad(lon2-lon1);
    const a = Math.sin(dLat/2)**2 +
      Math.cos(toRad(lat1))*Math.cos(toRad(lat2))*
      Math.sin(dLon/2)**2;
    return R*2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a));
  }
  verifyBtn.addEventListener('click', checkLocation);
  checkLocation();

  muteBtn.addEventListener('click', () => {
    voiceEnabled = !voiceEnabled;
    muteBtn.innerHTML = voiceEnabled ?
      '<i class="fas fa-volume-up"></i> Silenciar' :
      '<i class="fas fa-volume-mute"></i> Activar voz';
  });

  const scanner = new Html5Qrcode('qr-reader');
  function onDecode(txt) {
    if (!/^\d+$/.test(txt)) return;
    if (attendance.includes(txt)) {
      notify(`Ya registrado: ${txt}`);
      return;
    }
    attendance.push(txt);
    const li = document.createElement('li');
    li.textContent = `${txt} — ${new Date().toLocaleTimeString()}`;
    attendanceUL.appendChild(li);
    notify(`Registro: ${txt}`);
  }

  function startScanner() {
    scanner.start(
      { facingMode: 'environment' },
      { fps: 15, qrbox: 250 },
      onDecode
    ).catch(err => {
      console.error(err);
      notify('Cámara no disponible, usa imagen');
      useFileBtn.style.display = 'inline-block';
    });
  }
  function stopScanner() {
    scanner.stop().catch(()=>{});
  }
  startScanner();

  toggleBtn.addEventListener('click', () => {
    if (scanning) {
      stopScanner();
      toggleBtn.innerHTML = '<i class="fas fa-play"></i> Iniciar Escaneo';
    } else {
      startScanner();
      toggleBtn.innerHTML = '<i class="fas fa-stopwatch"></i> Detener Escaneo';
    }
    scanning = !scanning;
  });

  useFileBtn.addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', e => {
    const file = e.target.files[0];
    if (!file) return;
    scanner.scanFile(file, true)
      .then(onDecode)
      .catch(() => notify('No se detectó QR en la imagen'));
  });

  exportBtn.addEventListener('click', () => {
    const wb   = XLSX.utils.book_new();
    const data = [['Código','Hora'], ...attendance.map(c => [c, new Date().toLocaleTimeString()])];
    const ws   = XLSX.utils.aoa_to_sheet(data);
    XLSX.utils.book_append_sheet(wb, ws, 'Asistencias');
    XLSX.writeFile(wb, 'asistencias.xlsx');
    notify('Excel creado');
  });

  sendBtn.addEventListener('click', () => {
    fetch('/api/attendance', {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({records: attendance})
    })
    .then(r=>r.ok?notify('Datos enviados'):notify('Error envío'))
    .catch(()=>notify('Error de red'));
  });

  function genProfQR() {
    teacherDiv.innerHTML = '';
    new QRCode(teacherDiv, {
      text: `PROF-${Date.now()}`,
      width: 160, height: 160
    });
  }
  genProfQR();
  setInterval(genProfQR, 300000);
});
