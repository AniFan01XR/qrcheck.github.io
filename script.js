document.addEventListener("DOMContentLoaded", () => {
  /* ============================
     LOGIN / AUTENTICACIÓN
  ===============================*/
  const loginModal = document.getElementById("login-modal");
  const loginForm = document.getElementById("login-form");
  const loginUserInput = document.getElementById("login-user");
  const loginPassInput = document.getElementById("login-pass");
  const loginError = document.getElementById("login-error");
  const mainContainer = document.querySelector(".container");

  const validUser = "admin";
  const validPass = "admin123";

  function checkLogin(e) {
    e.preventDefault();
    const user = loginUserInput.value.trim();
    const pass = loginPassInput.value.trim();
    
    if (user === validUser && pass === validPass) {
      loginModal.classList.add("fade-out");
      setTimeout(() => {
        loginModal.style.display = "none";
        mainContainer.style.display = "flex";
        startScanning();
      }, 500);
    } else {
      loginError.textContent = "Credenciales incorrectas. Intenta de nuevo.";
      loginError.style.display = "block";
    }
  }
  
  if (loginForm) {
    loginForm.addEventListener("submit", checkLogin);
  }

  /* ============================
     CONFIGURACIÓN GENERAL
  ===============================*/
  const attendanceList = document.getElementById("attendance-list");
  const exportButton = document.getElementById("export-excel");
  const toggleScanButton = document.getElementById("toggle-scan");
  const muteVoiceCheckbox = document.getElementById("mute-voice");
  const generateTeacherQRButton = document.getElementById("generate-teacher-qr");
  const teacherQRContainer = document.getElementById("teacher-qr-container");
  const burstModeCheckbox = document.getElementById("burst-mode");
  const notificationElement = document.getElementById("notification");
  const manageScheduleButton = document.getElementById("manage-schedule");
  const scheduleModal = document.getElementById("schedule-modal");
  const closeScheduleModalButton = document.getElementById("close-schedule-modal");
  const addScheduleButton = document.getElementById("add-schedule");
  const classInfoInput = document.getElementById("class-info");
  const scheduleListContainer = document.getElementById("schedule-list");

  let attendanceRecords = [];
  let scanningActive = true;
  let voiceEnabled = true;
  let burstModeEnabled = false;
  const fixedFps = 45;
  let recentScans = {};

  // Arreglo para almacenar los bloques de horarios
  let schedules = [];

  // Configuración del lector QR
  let qrScanner = new Html5Qrcode("qr-reader");

  // Función para emitir mensajes por voz
  function speakMessage(message) {
    if (!voiceEnabled) return;
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(message);
      utterance.lang = "es-ES";
      utterance.pitch = 1;
      utterance.rate = 1;
      window.speechSynthesis.speak(utterance);
    } else {
      console.warn("El navegador no soporta SpeechSynthesis.");
    }
  }

  // Función para mostrar notificaciones (toast)
  function showNotification(message, type = "info") {
    if (burstModeEnabled) return;
    if (!notificationElement) return;
    notificationElement.textContent = message;
    notificationElement.classList.remove("fade-out");
    notificationElement.classList.add("fade-in");
    notificationElement.style.display = "block";
    setTimeout(() => {
      notificationElement.classList.remove("fade-in");
      notificationElement.classList.add("fade-out");
      setTimeout(() => {
        notificationElement.style.display = "none";
      }, 500);
    }, 3000);
  }

  // Función para guardar registro en BD (futuro)
  function saveRecordToDB(record) {
    console.log("Guardando en base de datos:", record);
    // Futuro: integrar conexión a BD
  }

  // Función que se ejecuta al escanear un QR
  function onScanSuccess(decodedText, decodedResult) {
    const isNumeric = /^\d+$/.test(decodedText);
    if (!isNumeric) {
      showNotification(`Valor no válido: ${decodedText}`, "error");
      speakMessage("El valor escaneado no es un número de control válido.");
      return;
    }
    const now = Date.now();
    if (attendanceRecords.includes(decodedText)) {
      if (recentScans[decodedText] && now - recentScans[decodedText] < 5000) {
        return;
      } else {
        recentScans[decodedText] = now;
        const duplicateMsg = `La asistencia ya se encuentra registrada para el Alumno: ${decodedText}`;
        showNotification(duplicateMsg, "error");
        speakMessage(duplicateMsg);
        return;
      }
    } else {
      attendanceRecords.push(decodedText);
      recentScans[decodedText] = now;
      const li = document.createElement("li");
      li.textContent = `Asistencia: ${decodedText} - ${new Date().toLocaleTimeString()}`;
      li.classList.add("fade-in-item");
      attendanceList.appendChild(li);
      const successMsg = `Asistencia registrada para el Alumno: ${decodedText}`;
      showNotification(successMsg, "success");
      speakMessage(successMsg);
      saveRecordToDB({ code: decodedText, time: new Date().toLocaleTimeString() });
    }
  }

  // Función para iniciar el escáner (tras el login)
  function startScanning() {
    qrScanner.start(
      { facingMode: "environment" },
      { fps: fixedFps, qrbox: 300 },
      onScanSuccess
    ).catch((err) => {
      console.error("Error al iniciar el escáner:", err);
      showNotification("No se pudo acceder a la cámara.", "error");
      speakMessage("No se pudo acceder a la cámara. Revisa los permisos.");
    });
  }

  // Función para detener el escáner
  function stopScanning() {
    qrScanner.stop().catch((err) => {
      console.error("Error al detener el escáner:", err);
    });
  }

  // Botón para alternar el escaneo
  toggleScanButton.addEventListener("click", () => {
    if (scanningActive) {
      stopScanning();
      toggleScanButton.textContent = "Iniciar Escaneo";
      scanningActive = false;
      showNotification("Escaneo detenido. Listo para continuar cuando se reinicie.", "info");
      speakMessage("Escaneo detenido. Listo para continuar el registro.");
    } else {
      qrScanner = new Html5Qrcode("qr-reader");
      startScanning();
      toggleScanButton.textContent = "Detener Escaneo";
      scanningActive = true;
      showNotification("Escaneo iniciado. Listo para registrar.", "info");
      speakMessage("Escaneo iniciado. Listo para continuar el registro.");
    }
  });

  // Exportar registros a Excel
  exportButton.addEventListener("click", () => {
    const workbook = XLSX.utils.book_new();
    const worksheetData = [["Código", "Hora"]];
    attendanceRecords.forEach((record) => {
      worksheetData.push([record, new Date().toLocaleTimeString()]);
    });
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    XLSX.utils.book_append_sheet(workbook, worksheet, "Asistencias");
    XLSX.writeFile(workbook, "asistencias.xlsx");
  });

  // Control para silenciar voz
  muteVoiceCheckbox.addEventListener("change", (e) => {
    voiceEnabled = !e.target.checked;
  });

  // Modo Ráfaga
  burstModeCheckbox.addEventListener("change", (e) => {
    burstModeEnabled = e.target.checked;
    if (burstModeEnabled) {
      speakMessage("Modo ráfaga activado. Las notificaciones visuales se han desactivado.");
    } else {
      speakMessage("Modo ráfaga desactivado. Las notificaciones visuales se activarán.");
    }
  });

  // Generar QR del Profesor
  generateTeacherQRButton.addEventListener("click", () => {
    teacherQRContainer.innerHTML = "";
    const teacherQRContent = "PROF-QR-2025"; // Personaliza según necesites
    new QRCode(teacherQRContainer, {
      text: teacherQRContent,
      width: 180,
      height: 180,
      colorDark: "#000000",
      colorLight: "#ffffff",
      correctLevel: QRCode.CorrectLevel.H,
    });
    showNotification("Código QR del profesor generado.", "info");
    speakMessage("Código QR del profesor generado.");
  });

  /* ============================
       ADMINISTRACIÓN DE HORARIOS INTERACTIVA
  ===============================*/
  // Mostrar el modal de horarios
  manageScheduleButton.addEventListener("click", () => {
    scheduleModal.style.display = "flex";
  });

  // Cerrar el modal de horarios
  closeScheduleModalButton.addEventListener("click", () => {
    scheduleModal.style.display = "none";
  });

  // Función para incrementar una hora en formato "HH:MM"
  function incrementTime(timeStr) {
    let [h, m] = timeStr.split(":").map(Number);
    h = h + 1;
    if (h < 10) h = "0" + h;
    return `${h}:${m < 10 ? "0" + m : m}`;
  }

  // Función para actualizar la lista de horarios (resumen)
  function updateScheduleList() {
    scheduleListContainer.innerHTML = "";
    schedules.forEach((sch, index) => {
      const div = document.createElement("div");
      div.classList.add("schedule-item");
      div.innerHTML = `<strong>${sch.day}</strong> de ${sch.start} a ${sch.end} - ${sch.classInfo}
                        <button data-index="${index}" class="delete-schedule">Eliminar</button>`;
      scheduleListContainer.appendChild(div);
    });
  }

  // Al hacer clic en "Añadir Horario", se agrupan las celdas seleccionadas por día y se crean bloques
  addScheduleButton.addEventListener("click", () => {
    const classInfo = classInfoInput.value.trim();
    if (!classInfo) {
      alert("Ingresa la información de la clase.");
      return;
    }
    // Obtener todas las celdas seleccionadas
    const selectedCells = Array.from(document.querySelectorAll("#schedule-grid td.selected"));
    if(selectedCells.length === 0) {
      alert("Selecciona al menos una celda.");
      return;
    }
    // Agrupar por día
    const cellsByDay = {};
    selectedCells.forEach(cell => {
      const day = cell.dataset.day;
      if (!cellsByDay[day]) cellsByDay[day] = [];
      cellsByDay[day].push(cell.dataset.hour);
    });
    // Función para convertir tiempo "HH:MM" a minutos
    const toMinutes = (t) => {
      const [h, m] = t.split(":").map(Number);
      return h * 60 + m;
    };
    // Por cada día, agrupar las horas contiguas
    for (const day in cellsByDay) {
      let times = cellsByDay[day];
      // Convertir y ordenar
      let timesObj = times.map(t => ({ t, minutes: toMinutes(t) }));
      timesObj.sort((a, b) => a.minutes - b.minutes);
      // Agrupar bloques
      let start = timesObj[0].t;
      let end = timesObj[0].t;
      for (let i = 1; i < timesObj.length; i++) {
        if (timesObj[i].minutes === timesObj[i - 1].minutes + 60) {
          // Contiguo
          end = timesObj[i].t;
        } else {
          // Finaliza bloque, se guarda
          schedules.push({
            day: day,
            start: start,
            end: incrementTime(end),
            classInfo: classInfo
          });
          start = timesObj[i].t;
          end = timesObj[i].t;
        }
      }
      // Agregar último bloque
      schedules.push({
        day: day,
        start: start,
        end: incrementTime(end),
        classInfo: classInfo
      });
      // Marcar las celdas correspondientes como programadas (quitar "selected")
      selectedCells.forEach(cell => {
        if(cell.dataset.day === day) {
          const cellMin = toMinutes(cell.dataset.hour);
          // Para cada bloque, si el tiempo está comprendido entre start y end (exclusivo del final)
          const block = schedules.find(s => s.day === day && toMinutes(s.start) === toMinutes(start));
          // Para este ejemplo, se marcarán todas las celdas seleccionadas de ese día
          cell.textContent = classInfo;
          cell.classList.remove("selected");
          cell.classList.add("scheduled");
        }
      });
    }
    classInfoInput.value = "";
    updateScheduleList();
  });

  // Delegar eventos para eliminar una entrada de horario
  scheduleListContainer.addEventListener("click", (e) => {
    if(e.target.classList.contains("delete-schedule")) {
      const index = e.target.getAttribute("data-index");
      // Eliminar el bloque de horarios del arreglo
      const removed = schedules.splice(index, 1)[0];
      updateScheduleList();
      // Limpiar la cuadrícula: quitar el texto y la clase "scheduled" de las celdas que coincidan
      const scheduleCells = document.querySelectorAll("#schedule-grid td");
      scheduleCells.forEach(cell => {
        if(cell.dataset.day === removed.day && cell.textContent === removed.classInfo) {
          cell.textContent = "";
          cell.classList.remove("scheduled");
        }
      });
      showNotification("Horario eliminado.", "info");
    }
  });

  // Configurar la interacción de la cuadrícula de horarios (click y arrastre)
  const scheduleCells = document.querySelectorAll("#schedule-grid td");
  let isDragging = false;
  scheduleCells.forEach(cell => {
    cell.addEventListener("mousedown", () => {
      isDragging = true;
      cell.classList.toggle("selected");
    });
    cell.addEventListener("mouseover", () => {
      if (isDragging) {
        cell.classList.add("selected");
      }
    });
  });
  document.addEventListener("mouseup", () => {
    isDragging = false;
  });

});
