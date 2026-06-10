// Default template as a fallback if plantilla_folio.html is blocked by CORS
const fallbackTemplate = `
<div class="folio-top-stripe"></div>

<!-- Header -->
<div class="folio-header">
  <div class="folio-logo-title">
    <div class="folio-logo-container">
      <img class="folio-logo" src="logo_club.png" alt="CD Mangraners Escudo" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
      <div class="folio-logo-placeholder" style="display: none;">CDM</div>
    </div>
    <div class="folio-club-title">
      <span class="folio-club-name">MAGRANERS, C.D. A</span>
      <span class="folio-club-slogan">Campions dins i fora del camp</span>
      <span class="folio-club-sub">Som un projecte de formació, competició i valors</span>
    </div>
  </div>
  <div class="folio-doc-title-container">
    <span class="folio-doc-title">Convocatoria</span>
    <span class="folio-doc-subtitle">Oficial</span>
  </div>
</div>

<!-- Centered main title -->
<div class="folio-main-title-block">
  <h2 class="folio-main-title">CONVOCATORIA OFICIAL</h2>
  <div class="folio-main-subtitle">Jornada {{Jornada}} — {{Equipo}}</div>
</div>

<!-- Match Card Details Block -->
<div class="folio-match-card">
  <div class="folio-match-grid">
    <div class="folio-match-item col-span-2">
      <span class="folio-match-label">Rival</span>
      <span class="folio-match-value">{{Rival}}</span>
    </div>
    <div class="folio-match-item">
      <span class="folio-match-label">Día del Partido</span>
      <span class="folio-match-value">{{FechaHoraSplitDia}}</span>
    </div>
    <div class="folio-match-item">
      <span class="folio-match-label">Hora Partido</span>
      <span class="folio-match-value">{{FechaHoraSplitHora}}</span>
    </div>
    <div class="folio-match-item col-span-2">
      <span class="folio-match-label">Campo / Instalación</span>
      <span class="folio-match-value">{{Campo}}</span>
    </div>
    <div class="folio-match-item">
      <span class="folio-match-label">Hora Llegada</span>
      <span class="folio-match-value">{{HoraLlegada}}</span>
    </div>
    <div class="folio-match-item">
      <span class="folio-match-label">Condición</span>
      <span class="folio-badge-condicion {{CondicionClass}}">{{Condicion}}</span>
    </div>
    <div class="folio-match-item col-span-2">
      <span class="folio-match-label">Equipación Oficial</span>
      <span class="folio-match-value">{{Equipacion}}</span>
    </div>
    <div class="folio-match-item col-span-2">
      <span class="folio-match-label">Cuerpo Técnico</span>
      <span class="folio-match-value">{{CuerpoTecnico}}</span>
    </div>
  </div>
</div>

<!-- Squad Convocados -->
<div class="folio-squad-section">
  <div class="folio-section-title">Jugadores Convocados</div>
  <div class="folio-player-grid">
    {{ConvocadosRows}}
  </div>
</div>

<!-- Bottom Block (Observations & No Convocados) -->
<div class="folio-bottom-block">
  <!-- Observations -->
  <div class="folio-obs-card" id="folio-obs-container" style="{{ShowObservations}}">
    <div class="folio-obs-title">Observaciones de Convocatoria</div>
    <div class="folio-obs-body">{{Observaciones}}</div>
  </div>

  <!-- Non convocados -->
  <div class="folio-no-conv-card" id="folio-noconv-container" style="{{ShowNoConvocados}}">
    <div class="folio-no-conv-title">Situación de Plantilla (No Convocados)</div>
    <div class="folio-no-conv-grid">
      {{NoConvocadosRows}}
    </div>
  </div>
</div>

<!-- Footer -->
<div class="folio-footer">
  <div class="folio-footer-info">
    <div class="folio-footer-motto">Som un projecte de formació, competició i valors</div>
    <div>CD Mangraners — Coordinación Deportiva</div>
    <div style="font-size: 7px; color: #94a3b8; margin-top: 1px;">Documento generado automáticamente para uso interno del club</div>
  </div>
  <div class="folio-signature-container">
    <div class="folio-signature-line" id="folio-signature-label">{{FirmaResponsable}}</div>
  </div>
</div>
`;

// Staff Directory (name -> formatted phone, clean digits)
const staffDirectory = {
  "Federico Ferreira": { formatted: "600 000 004", digits: "600000004" },
  "Joel Benitez": { formatted: "600 000 001", digits: "600000001" },
  "Felipe Filartiga": { formatted: "600 000 000", digits: "600000000" },
  "Ariel Gimenez": { formatted: "600 000 002", digits: "600000002" },
  "Rodrigo Caceres": { formatted: "600 000 003", digits: "600000003" },
  "Pedro Quintana": { formatted: "600 000 005", digits: "600000005" },
  "Aureliano Torres": { formatted: "600 000 006", digits: "600000006" },
  "Buena Ferreira": { formatted: "600 000 007", digits: "600000007" }
};

// Player lists in memory
let convocadosList = [];
let noConvocadosList = [];
let templateHtml = "";

document.addEventListener("DOMContentLoaded", () => {
  // Load template
  loadTemplate();

  // Setup Live Listeners
  setupFormListeners();

  // Setup Interactive Player Editors
  setupPlayerEditors();

  // Setup Voice Assistant
  setupVoiceSpeech();

  // Setup Buttons
  document.getElementById("btn-load-demo").addEventListener("click", loadDemoData);
  document.getElementById("btn-clear").addEventListener("click", clearForm);
  document.getElementById("btn-download-pdf").addEventListener("click", downloadPDF);
  document.getElementById("btn-send-whatsapp").addEventListener("click", sendWhatsApp);
  document.getElementById("btn-generate").addEventListener("click", () => {
    const equipoVal = document.getElementById("inp-equipo").value;
    if (equipoVal) {
      const isBenjOrAlev = equipoVal.toLowerCase().includes("benjam") || equipoVal.toLowerCase().includes("alev");
      const limit = isBenjOrAlev ? 15 : 18;
      if (convocadosList.length > limit) {
        alert(`Atención: Has convocado a ${convocadosList.length} jugadores, pero el máximo para la categoría de ${equipoVal} es ${limit}. Por favor, reduce la convocatoria.`);
        return;
      }
    }
    updateLivePreview();
    alert("¡Vista previa de convocatoria generada con éxito!");
  });

  // Watch scale preview
  window.addEventListener("resize", scalePreviewSheet);
});

// Load Template File or Fallback
async function loadTemplate() {
  try {
    const res = await fetch("plantilla_folio.html");
    if (res.ok) {
      const text = await res.text();
      // Extract the body content of the template
      const parser = new DOMParser();
      const doc = parser.parseFromString(text, "text/html");
      const wrapper = doc.getElementById("folio-preview-card");
      if (wrapper) {
        templateHtml = wrapper.innerHTML;
        console.log("Loaded template from plantilla_folio.html successfully.");
      } else {
        templateHtml = fallbackTemplate;
      }
    } else {
      templateHtml = fallbackTemplate;
    }
  } catch (e) {
    console.warn("CORS block or network error while fetching plantilla_folio.html. Falling back to local template string.", e);
    templateHtml = fallbackTemplate;
  }
  updateLivePreview();
}

// Setup Form Listeners for Instant Live Update
function setupFormListeners() {
  const fields = [
    "inp-jornada", "inp-equipo", "inp-categoria", "inp-rival",
    "inp-dia", "inp-hora", "inp-llegada", "inp-campo",
    "inp-condicion", "inp-equipacion", "inp-cuerpo", "inp-obs"
  ];
  fields.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener("input", updateLivePreview);
      el.addEventListener("change", updateLivePreview);
    }
  });

  // Link Equipo and Categoria select fields
  const equipoSelect = document.getElementById("inp-equipo");
  const categoriaSelect = document.getElementById("inp-categoria");

  const teamToCat = {
    "Benjamí S10": "PRIMERA DIVISIÓ BENJAMÍ S10 (GRUP 13)",
    "Aleví S11": "SEGONA DIVISIÓ ALEVÍ S11 (GRUP 18)",
    "Aleví S12": "SEGONA DIVISIÓ ALEVÍ S12 (GRUP 22)",
    "Infantil S14": "INFANTIL SEGONA DIVISIÓ S14 (GRUP 28)",
    "Cadet S16": "Cadet Segona Divisió S16 - Grup 24",
    "Juvenil": "JUVENIL SEGONA DIVISIÓ (GRUP 46)",
    "Quarta Catalana": "QUARTA CATALANA (GRUP 29)"
  };

  const catToTeam = {
    "PRIMERA DIVISIÓ BENJAMÍ S10 (GRUP 13)": "Benjamí S10",
    "SEGONA DIVISIÓ ALEVÍ S11 (GRUP 18)": "Aleví S11",
    "SEGONA DIVISIÓ ALEVÍ S12 (GRUP 22)": "Aleví S12",
    "INFANTIL SEGONA DIVISIÓ S14 (GRUP 28)": "Infantil S14",
    "Cadet Segona Divisió S16 - Grup 24": "Cadet S16",
    "JUVENIL SEGONA DIVISIÓ (GRUP 46)": "Juvenil",
    "QUARTA CATALANA (GRUP 29)": "Quarta Catalana"
  };

  const teamToStaff = {
    "Benjamí S10": "Felipe Filartiga y Joel Benitez",
    "Aleví S11": "Felipe Filartiga y Joel Benitez",
    "Aleví S12": "Joel Benitez",
    "Infantil S14": "Federico Ferreira",
    "Cadet S16": "Federico Ferreira y Joel Benitez",
    "Juvenil": "Aureliano Torres y Buena Ferreira",
    "Quarta Catalana": "Aureliano Torres y Buena Ferreira"
  };

  if (equipoSelect && categoriaSelect) {
    let lastTeam = equipoSelect.value;
    let lastCat = categoriaSelect.value;

    equipoSelect.addEventListener("change", () => {
      const selectedTeam = equipoSelect.value;
      if (convocadosList.length > 0 || noConvocadosList.length > 0) {
        if (!confirm("Cambiar de equipo borrará la lista de jugadores seleccionados. ¿Deseas continuar?")) {
          equipoSelect.value = lastTeam;
          return;
        }
      }
      lastTeam = selectedTeam;
      if (teamToCat[selectedTeam]) {
        categoriaSelect.value = teamToCat[selectedTeam];
        lastCat = teamToCat[selectedTeam];
        if (teamToStaff[selectedTeam]) {
          document.getElementById("inp-cuerpo").value = teamToStaff[selectedTeam];
        }
        // Clear lists when switching category
        convocadosList = [];
        noConvocadosList = [];
        renderConvocadosEditor();
        renderNoConvocadosEditor();
        
        autoPopulateMatchDetails();
        updateLivePreview();
      }
    });

    categoriaSelect.addEventListener("change", () => {
      const selectedCat = categoriaSelect.value;
      if (convocadosList.length > 0 || noConvocadosList.length > 0) {
        if (!confirm("Cambiar de equipo borrará la lista de jugadores seleccionados. ¿Deseas continuar?")) {
          categoriaSelect.value = lastCat;
          return;
        }
      }
      lastCat = selectedCat;
      if (catToTeam[selectedCat]) {
        const team = catToTeam[selectedCat];
        equipoSelect.value = team;
        lastTeam = team;
        if (teamToStaff[team]) {
          document.getElementById("inp-cuerpo").value = teamToStaff[team];
        }
        // Clear lists when switching category
        convocadosList = [];
        noConvocadosList = [];
        renderConvocadosEditor();
        renderNoConvocadosEditor();
        
        autoPopulateMatchDetails();
        updateLivePreview();
      }
    });
  }

  const jornadaSelect = document.getElementById("inp-jornada");
  if (jornadaSelect) {
    jornadaSelect.addEventListener("change", () => {
      autoPopulateMatchDetails();
    });
  }

  const horaInput = document.getElementById("inp-hora");
  if (horaInput) {
    const handleHoraChange = () => {
      autoCalculateArrivalTime(horaInput.value);
    };
    horaInput.addEventListener("input", handleHoraChange);
    horaInput.addEventListener("change", handleHoraChange);
  }
}

// Auto-populate match details based on selected team and matchday
function autoPopulateMatchDetails() {
  const equipoSelect = document.getElementById("inp-equipo");
  const jornadaSelect = document.getElementById("inp-jornada");
  if (!equipoSelect || !jornadaSelect) return;

  const equipo = equipoSelect.value;
  const jornada = jornadaSelect.value;

  if (!equipo || !jornada) return;

  if (typeof CD_MANGRANERS_CALENDARS !== "undefined" && CD_MANGRANERS_CALENDARS[equipo] && CD_MANGRANERS_CALENDARS[equipo][jornada]) {
    const match = CD_MANGRANERS_CALENDARS[equipo][jornada];
    
    document.getElementById("inp-rival").value = match.rival || "";
    
    if (match.condicion === "Local" || match.condicion === "Fuera") {
      document.getElementById("inp-condicion").value = match.condicion;
    } else {
      document.getElementById("inp-condicion").value = "Fuera";
    }
    
    document.getElementById("inp-dia").value = match.dia || "";
    document.getElementById("inp-hora").value = match.hora || "";
    document.getElementById("inp-campo").value = match.campo || "";
    
    // Auto calculate arrival time (1 hour before)
    autoCalculateArrivalTime(match.hora || "");
    
    updateLivePreview();
  }
}

// Auto-calculate arrival time exactly 1 hour before match kickoff
function autoCalculateArrivalTime(matchTime) {
  const arrivalInput = document.getElementById("inp-llegada");
  if (!arrivalInput) return;

  if (!matchTime || matchTime.toLowerCase().includes("confirmar") || matchTime.trim() === "-") {
    arrivalInput.value = "A confirmar";
    updateLivePreview();
    return;
  }

  const timeMatch = matchTime.match(/(\d{1,2})[:\.](\d{2})/);
  if (timeMatch) {
    let hour = parseInt(timeMatch[1], 10);
    const minute = timeMatch[2];
    
    // Subtract 1 hour
    hour = (hour - 1 + 24) % 24;
    
    // Format back to HH:MM
    const paddedHour = hour.toString().padStart(2, '0');
    arrivalInput.value = `${paddedHour}:${minute}`;
  } else {
    arrivalInput.value = "A confirmar";
  }
  updateLivePreview();
}

// Setup Interactive Editors for Convocados & No Convocados
function setupPlayerEditors() {
  const convSelect = document.getElementById("sel-available-conv");
  const noConvSelect = document.getElementById("sel-available-noconv");

  if (convSelect) {
    convSelect.addEventListener("change", function() {
      const selectedValue = this.value;
      if (!selectedValue) return;

      const equipo = document.getElementById("inp-equipo").value;
      if (!equipo) {
        alert("Por favor, selecciona un equipo primero.");
        this.value = "";
        return;
      }

      // Check limit (15 for Benjamín/Alevín, 18 for others)
      const isBenjOrAlev = equipo.toLowerCase().includes("benjam") || equipo.toLowerCase().includes("alev");
      const limit = isBenjOrAlev ? 15 : 18;
      if (convocadosList.length >= limit) {
        alert(`Límite alcanzado: Esta categoría (${equipo}) admite un máximo de ${limit} jugadores convocados.`);
        this.value = "";
        return;
      }

      if (selectedValue === "__custom__") {
        const customName = prompt("Introduce el nombre y apellidos del jugador:");
        if (!customName) {
          this.value = "";
          return;
        }
        const customPos = prompt("Introduce la demarcación (ej. Defensa, Delantero, Portero):", "Jugador") || "Jugador";
        
        convocadosList.push({ name: customName, pos: customPos });
      } else {
        // Find player in roster
        let playerObj = null;
        if (typeof CD_MANGRANERS_PLAYERS !== "undefined" && CD_MANGRANERS_PLAYERS[equipo]) {
          playerObj = CD_MANGRANERS_PLAYERS[equipo].find(p => p.name === selectedValue);
        }
        if (!playerObj) {
          playerObj = convocadosList.find(p => p.name === selectedValue) || noConvocadosList.find(p => p.name === selectedValue);
        }
        
        const pos = playerObj ? playerObj.pos : "Jugador";
        
        // Remove from No Convocados if present (state synchronization)
        noConvocadosList = noConvocadosList.filter(p => p.name !== selectedValue);
        
        convocadosList.push({ name: selectedValue, pos: pos });
      }

      this.value = ""; // Reset dropdown
      renderConvocadosEditor();
      renderNoConvocadosEditor();
      updateLivePreview();
    });
  }

  if (noConvSelect) {
    noConvSelect.addEventListener("change", function() {
      const selectedValue = this.value;
      if (!selectedValue) return;

      const equipo = document.getElementById("inp-equipo").value;
      if (!equipo) {
        alert("Por favor, selecciona un equipo primero.");
        this.value = "";
        return;
      }

      if (selectedValue === "__custom__") {
        const customName = prompt("Introduce el nombre y apellidos del jugador:");
        if (!customName) {
          this.value = "";
          return;
        }
        const customPos = prompt("Introduce la demarcación (ej. Defensa, Delantero, Portero):", "Jugador") || "Jugador";
        
        noConvocadosList.push({ name: customName, pos: customPos, reason: "tecnica" });
      } else {
        // Find player in roster
        let playerObj = null;
        if (typeof CD_MANGRANERS_PLAYERS !== "undefined" && CD_MANGRANERS_PLAYERS[equipo]) {
          playerObj = CD_MANGRANERS_PLAYERS[equipo].find(p => p.name === selectedValue);
        }
        if (!playerObj) {
          playerObj = convocadosList.find(p => p.name === selectedValue) || noConvocadosList.find(p => p.name === selectedValue);
        }
        
        const pos = playerObj ? playerObj.pos : "Jugador";
        
        // Remove from Convocados if present (state synchronization)
        convocadosList = convocadosList.filter(p => p.name !== selectedValue);
        
        noConvocadosList.push({ name: selectedValue, pos: pos, reason: "tecnica" });
      }

      this.value = ""; // Reset dropdown
      renderConvocadosEditor();
      renderNoConvocadosEditor();
      updateLivePreview();
    });
  }
}

// Render Convocados editor list
function renderConvocadosEditor() {
  const container = document.getElementById("convocados-list-container");
  container.innerHTML = "";

  if (convocadosList.length === 0) {
    container.innerHTML = `<div class="empty-list-placeholder">Ningún jugador convocado aún. Agrégalos en el formulario.</div>`;
    return;
  }

  convocadosList.forEach((p, idx) => {
    const row = document.createElement("div");
    row.className = "player-item-row";
    row.innerHTML = `
      <input type="text" value="${p.name}" oninput="updateConvocadoName(${idx}, this.value)">
      <input type="text" value="${p.pos}" oninput="updateConvocadoPos(${idx}, this.value)" style="width: 40%">
      <button class="remove-btn" onclick="removeConvocado(${idx})" title="Remover jugador">×</button>
    `;
    container.appendChild(row);
  });
}

// Render No Convocados editor list
function renderNoConvocadosEditor() {
  const container = document.getElementById("noconv-list-container");
  container.innerHTML = "";

  if (noConvocadosList.length === 0) {
    container.innerHTML = `<div class="empty-list-placeholder">Ningún no convocado. Agrégalos en el formulario.</div>`;
    return;
  }

  noConvocadosList.forEach((p, idx) => {
    const row = document.createElement("div");
    row.className = "noconv-item-row";
    row.innerHTML = `
      <input type="text" value="${p.name}" oninput="updateNoConvocadoName(${idx}, this.value)">
      <select onchange="updateNoConvocadoReason(${idx}, this.value)">
        <option value="tecnica" ${p.reason === "tecnica" ? "selected" : ""}>D. Técnica</option>
        <option value="lesion" ${p.reason === "lesion" ? "selected" : ""}>Lesión</option>
        <option value="sancion" ${p.reason === "sancion" ? "selected" : ""}>Sanción</option>
      </select>
      <button class="remove-btn" onclick="removeNoConvocado(${idx})" title="Remover jugador">×</button>
    `;
    container.appendChild(row);
  });
}

// Editor update functions (scoped globally for DOM onclicks)
window.removeConvocado = function(idx) {
  convocadosList.splice(idx, 1);
  renderConvocadosEditor();
  updateLivePreview();
};
window.updateConvocadoName = function(idx, val) {
  convocadosList[idx].name = val;
  updateLivePreview();
};
window.updateConvocadoPos = function(idx, val) {
  convocadosList[idx].pos = val;
  updateLivePreview();
};

window.removeNoConvocado = function(idx) {
  noConvocadosList.splice(idx, 1);
  renderNoConvocadosEditor();
  updateLivePreview();
};
window.updateNoConvocadoName = function(idx, val) {
  noConvocadosList[idx].name = val;
  updateLivePreview();
};
window.updateNoConvocadoReason = function(idx, val) {
  noConvocadosList[idx].reason = val;
  updateLivePreview();
};

let lastSelectedTeam = "INIT_PLACEHOLDER"; // ensure initial population triggers

function updateJornadaDropdown(team) {
  if (team === lastSelectedTeam) return;
  lastSelectedTeam = team;

  const jornadaSelect = document.getElementById("inp-jornada");
  if (!jornadaSelect) return;
  
  const currentVal = jornadaSelect.value;
  const maxJornadas = team === "Benjamí S10" ? 26 : 30;

  jornadaSelect.innerHTML = '<option value="">-- Seleccionar --</option>';
  for (let i = 1; i <= maxJornadas; i++) {
    const opt = document.createElement("option");
    opt.value = i.toString();
    opt.textContent = `Jornada ${i}`;
    jornadaSelect.appendChild(opt);
  }

  // Restore previous value if within range
  if (currentVal && parseInt(currentVal) <= maxJornadas) {
    jornadaSelect.value = currentVal;
  } else {
    jornadaSelect.value = "";
  }
}

function updateLimitHeader() {
  const equipo = document.getElementById("inp-equipo").value;
  const limitSpan = document.getElementById("conv-limit-info");
  if (!limitSpan) return;

  if (!equipo) {
    limitSpan.textContent = "(Límite: 18)";
    limitSpan.style.color = "var(--color-text-muted)";
    return;
  }

  const isBenjOrAlev = equipo.toLowerCase().includes("benjam") || equipo.toLowerCase().includes("alev");
  const limit = isBenjOrAlev ? 15 : 18;
  limitSpan.textContent = `(Convocados: ${convocadosList.length}/${limit})`;
  
  if (convocadosList.length > limit) {
    limitSpan.style.color = "#ef4444"; // red warning
    limitSpan.style.fontWeight = "bold";
  } else if (convocadosList.length === limit) {
    limitSpan.style.color = "var(--color-accent)"; // green at limit
    limitSpan.style.fontWeight = "bold";
  } else {
    limitSpan.style.color = "var(--color-gold)";
    limitSpan.style.fontWeight = "normal";
  }
}

function populateAvailablePlayersDropdowns() {
  const equipo = document.getElementById("inp-equipo").value;
  const convSelect = document.getElementById("sel-available-conv");
  const noConvSelect = document.getElementById("sel-available-noconv");

  if (!convSelect || !noConvSelect) return;

  // Save current values to avoid resetting if not needed
  const prevConvVal = convSelect.value;
  const prevNoConvVal = noConvSelect.value;

  convSelect.innerHTML = '<option value="">-- Seleccionar jugador para convocar --</option>';
  noConvSelect.innerHTML = '<option value="">-- Seleccionar jugador no convocado --</option>';

  if (!equipo) return;

  const roster = (typeof CD_MANGRANERS_PLAYERS !== "undefined" && CD_MANGRANERS_PLAYERS[equipo]) ? CD_MANGRANERS_PLAYERS[equipo] : [];

  // Union of roster and custom players
  const allPlayersMap = new Map();
  roster.forEach(p => {
    allPlayersMap.set(p.name, { name: p.name, pos: p.pos });
  });
  convocadosList.forEach(p => {
    if (!allPlayersMap.has(p.name)) {
      allPlayersMap.set(p.name, { name: p.name, pos: p.pos });
    }
  });
  noConvocadosList.forEach(p => {
    if (!allPlayersMap.has(p.name)) {
      allPlayersMap.set(p.name, { name: p.name, pos: p.pos });
    }
  });

  allPlayersMap.forEach(player => {
    const isConvocado = convocadosList.some(p => p.name === player.name);
    const isNoConvocado = noConvocadosList.some(p => p.name === player.name);

    // 1. Populate Convocados dropdown (only if not selected in either list)
    if (!isConvocado && !isNoConvocado) {
      const opt = document.createElement("option");
      opt.value = player.name;
      opt.textContent = `${player.name} (${player.pos})`;
      convSelect.appendChild(opt);
    }

    // 2. Populate No Convocados dropdown (only if not selected in either list)
    if (!isNoConvocado && !isConvocado) {
      const opt = document.createElement("option");
      opt.value = player.name;
      opt.textContent = `${player.name} (${player.pos})`;
      noConvSelect.appendChild(opt);
    }
  });

  const customConvOpt = document.createElement("option");
  customConvOpt.value = "__custom__";
  customConvOpt.textContent = "[ + Añadir jugador personalizado... ]";
  convSelect.appendChild(customConvOpt);

  const customNoConvOpt = document.createElement("option");
  customNoConvOpt.value = "__custom__";
  customNoConvOpt.textContent = "[ + Añadir jugador personalizado... ]";
  noConvSelect.appendChild(customNoConvOpt);

  // Restore selections if valid
  if (prevConvVal && Array.from(convSelect.options).some(o => o.value === prevConvVal)) {
    convSelect.value = prevConvVal;
  }
  if (prevNoConvVal && Array.from(noConvSelect.options).some(o => o.value === prevNoConvVal)) {
    noConvSelect.value = prevNoConvVal;
  }
}

// Update Live Preview Sheet HTML
function updateLivePreview() {
  if (!templateHtml) return;

  const equipoVal = document.getElementById("inp-equipo").value || "";
  updateJornadaDropdown(equipoVal);
  
  updateLimitHeader();
  populateAvailablePlayersDropdowns();

  const previewContainer = document.getElementById("folio-preview-container");
  
  // 1. Gather text values
  const jornada = document.getElementById("inp-jornada").value || "[Número]";
  const equipo = document.getElementById("inp-equipo").value || "[Equipo]";
  const categoria = document.getElementById("inp-categoria").value || "[Categoría]";
  const rival = document.getElementById("inp-rival").value || "[Rival]";
  const dia = document.getElementById("inp-dia").value || "[Día del partido]";
  const hora = document.getElementById("inp-hora").value || "[Hora]";
  const llegada = document.getElementById("inp-llegada").value || "[Hora]";
  const campo = document.getElementById("inp-campo").value || "[Campo de juego]";
  const condicion = document.getElementById("inp-condicion").value || "Fuera";
  const equipacion = document.getElementById("inp-equipacion").value || "[Equipación]";
  const cuerpo = document.getElementById("inp-cuerpo").value || "[Cuerpo técnico]";
  const obs = document.getElementById("inp-obs").value.trim();

  // 2. Format Convocados rows
  let convRowsHtml = "";
  if (convocadosList.length === 0) {
    convRowsHtml = `<div class="folio-empty-placeholder">No se han agregado jugadores convocados</div>`;
  } else {
    convocadosList.forEach((p, idx) => {
      const numStr = (idx + 1).toString().padStart(2, '0');
      convRowsHtml += `
        <div class="folio-player-card">
          <span class="folio-player-num">${numStr}</span>
          <div class="folio-player-details">
            <span class="folio-player-name">${p.name}</span>
            <span class="folio-player-pos">${p.pos}</span>
          </div>
        </div>
      `;
    });
  }

  // 3. Format No Convocados rows
  let noConvHtml = "";
  let showNoConvStyle = "display: block;";
  if (noConvocadosList.length === 0) {
    showNoConvStyle = "display: none;";
  } else {
    noConvocadosList.forEach(p => {
      let badgeClass = "folio-badge-dt";
      let badgeText = "Decisión Técnica";
      let descText = "No convocado por decisión técnica dentro de la planificación deportiva semanal.";

      if (p.reason === "lesion") {
        badgeClass = "folio-badge-injury";
        badgeText = "Lesión";
        descText = "No convocado por situación física o lesión. Pendiente de evolución.";
      } else if (p.reason === "sancion") {
        badgeClass = "folio-badge-suspension";
        badgeText = "Sanción";
        descText = "No convocado por sanción o cumplimiento disciplinario.";
      }

      noConvHtml += `
        <div class="folio-no-conv-row">
          <span class="folio-no-conv-badge ${badgeClass}">${badgeText}</span>
          <span class="folio-no-conv-player">${p.name}</span>
          <span class="folio-no-conv-desc">${descText}</span>
        </div>
      `;
    });
  }

  // 4. Format observations
  const showObsStyle = obs ? "display: block;" : "display: none;";

  // 5. Signature label DT
  // extract first DT name if present
  let dts = cuerpo.split(/y|,/)[0].trim() || "Dirección Deportiva";
  const signatureLabel = `${dts} (DT)`;

  // 6. Replace Placeholders in template
  const condicionClass = (condicion.toLowerCase() === "fuera") ? "fuera" : "";

  let replaced = templateHtml
    .replace(/{{Jornada}}/g, jornada)
    .replace(/{{Equipo}}/g, equipo)
    .replace(/{{Categoria}}/g, categoria)
    .replace(/{{Rival}}/g, rival)
    .replace(/{{FechaHoraSplitDia}}/g, dia)
    .replace(/{{FechaHoraSplitHora}}/g, hora)
    .replace(/{{HoraLlegada}}/g, llegada)
    .replace(/{{Campo}}/g, campo)
    .replace(/{{Condicion}}/g, condicion)
    .replace(/{{CondicionClass}}/g, condicionClass)
    .replace(/{{Equipacion}}/g, equipacion)
    .replace(/{{CuerpoTecnico}}/g, cuerpo)
    .replace(/{{ConvocadosRows}}/g, convRowsHtml)
    .replace(/{{ShowObservations}}/g, showObsStyle)
    .replace(/{{Observaciones}}/g, obs)
    .replace(/{{ShowNoConvocados}}/g, showNoConvStyle)
    .replace(/{{NoConvocadosRows}}/g, noConvHtml)
    .replace(/{{FirmaResponsable}}/g, signatureLabel);

  previewContainer.innerHTML = replaced;

  // Re-scale sheet to fit preview panel size
  scalePreviewSheet();
}

// Scale the A4 Preview Sheet visually to fit the container width
function scalePreviewSheet() {
  const panel = document.getElementById("preview-panel");
  const wrapper = document.getElementById("preview-scale-wrapper");
  const sheet = document.getElementById("folio-preview-card");
  
  if (!panel || !wrapper || !sheet) return;

  if (sheet.classList.contains("pdf-mode")) {
    wrapper.style.transform = "none";
    wrapper.style.width = "794px";
    wrapper.style.height = "1123px";
    wrapper.style.marginBottom = "0px";
    sheet.style.transform = "none";
    return;
  }

  // Preview / Screen Mode: Responsive and unscaled
  wrapper.style.transform = "none";
  wrapper.style.width = "100%";
  wrapper.style.maxWidth = "950px";
  wrapper.style.height = "auto";
  wrapper.style.marginBottom = "0px";
  sheet.style.transform = "none";
}

// Load Demo Data
function loadDemoData() {
  document.getElementById("inp-jornada").value = "1";
  document.getElementById("inp-equipo").value = "Cadet S16";
  document.getElementById("inp-categoria").value = "Cadet Segona Divisió S16 - Grup 24";
  document.getElementById("inp-rival").value = "CFJ Mollerussa B";
  document.getElementById("inp-dia").value = "Sábado, 13 de junio de 2026";
  document.getElementById("inp-hora").value = "17:45";
  document.getElementById("inp-llegada").value = "16:45";
  document.getElementById("inp-campo").value = "Camp Municipal de Mollerussa";
  document.getElementById("inp-condicion").value = "Fuera";
  document.getElementById("inp-equipacion").value = "1ª Equipación (Camiseta verde, pantalón blanco y medias verdes)";
  document.getElementById("inp-cuerpo").value = "Federico Ferreira y Joel Benitez";
  document.getElementById("inp-obs").value = "Presentación en el campo 1 hora antes del partido con la ropa del club.";

  // Convocados
  convocadosList = [
    { name: "Gustavo Felipe Molina Duarte", pos: "Portero" },
    { name: "Ángel Luciano Franco Almada", pos: "Lateral Derecho" },
    { name: "Ivan Emanuel Ramirez Ferreira", pos: "Defensa Central" },
    { name: "Mario Fernando Molas Roman", pos: "Lateral Izquierdo" },
    { name: "Mateo Esteban Vaida Cabrera", pos: "Central Izquierdo" },
    { name: "Cesar Alexis Brizuela Monzon", pos: "Volante Central" },
    { name: "Elian Samuel Colman Baez", pos: "Volante Central" },
    { name: "Gustavo Raul Medina Rivas", pos: "Volante Derecho" },
    { name: "Fabio Tadeo Orue Martinez", pos: "Extremo Izquierda" },
    { name: "Alessandro Sebastian Diana Nuñez", pos: "Extremo Derecha" },
    { name: "Ángel Rodrigo Alarcón", pos: "Delantero Centro" },
    { name: "Armando Isaias Peralta Leon", pos: "Delantero" },
    { name: "Blas Antonio Guillen Acosta", pos: "Delantero" },
    { name: "Tomas Ariel Gimenez Gavilan", pos: "Extremo Izquierda" },
    { name: "Pedro Ramon Gamarra Arndi", pos: "Delantero" },
    { name: "Tobias Ezequiel Santacruz Barrios", pos: "Portero" }
  ];

  // No Convocados
  noConvocadosList = [
    { name: "Matias German Aguilera Barrios", pos: "Portero", reason: "tecnica" },
    { name: "Erwin Adriano Cortaza Mareco", pos: "Delantero", reason: "lesion" },
    { name: "Juan Alberto Roman Cardozo", pos: "Lateral Derecho", reason: "sancion" }
  ];

  renderConvocadosEditor();
  renderNoConvocadosEditor();
  updateLivePreview();
}

// Clear Form
function clearForm() {
  if (confirm("¿Estás seguro de que deseas vaciar todo el formulario?")) {
    document.getElementById("inp-jornada").value = "";
    document.getElementById("inp-equipo").value = "";
    document.getElementById("inp-categoria").value = "";
    document.getElementById("inp-rival").value = "";
    document.getElementById("inp-dia").value = "";
    document.getElementById("inp-hora").value = "";
    document.getElementById("inp-llegada").value = "";
    document.getElementById("inp-campo").value = "";
    document.getElementById("inp-condicion").value = "Fuera";
    document.getElementById("inp-equipacion").value = "";
    document.getElementById("inp-cuerpo").value = "";
    document.getElementById("inp-obs").value = "";

    convocadosList = [];
    noConvocadosList = [];

    renderConvocadosEditor();
    renderNoConvocadosEditor();
    updateLivePreview();
  }
}

// Setup Voice Speech Recognition (Web Speech API)
let recognition;
function setupVoiceSpeech() {
  const btnVoice = document.getElementById("btn-voice-start");
  const txtVoice = document.getElementById("voice-text-area");
  const btnProcess = document.getElementById("btn-voice-process");
  const statusLog = document.getElementById("voice-status-log");

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!SpeechRecognition) {
    statusLog.innerHTML = "Tu navegador no soporta el reconocimiento de voz. Escribe o pega el texto para procesarlo.";
    btnVoice.disabled = true;
    return;
  }

  recognition = new SpeechRecognition();
  recognition.lang = "es-ES";
  recognition.continuous = false;
  recognition.interimResults = false;

  btnVoice.addEventListener("click", () => {
    try {
      recognition.start();
      statusLog.innerHTML = `<span class="pulse-red"></span> Escuchando... Habla ahora.`;
      btnVoice.disabled = true;
    } catch (e) {
      console.error(e);
    }
  });

  recognition.onend = () => {
    btnVoice.disabled = false;
    if (statusLog.innerHTML.includes("Escuchando")) {
      statusLog.innerHTML = "Micrófono desactivado. Puedes pulsar 'Grabar' de nuevo.";
    }
  };

  recognition.onerror = (event) => {
    statusLog.innerHTML = `Error de micrófono: ${event.error}. Inténtalo de nuevo.`;
    btnVoice.disabled = false;
  };

  recognition.onresult = (event) => {
    const text = event.results[0][0].transcript;
    txtVoice.value = (txtVoice.value ? txtVoice.value + " " : "") + text;
    statusLog.innerHTML = "Texto dictado transcrito. Haz clic en 'Procesar Dictado' para rellenar.";
  };

  // Process text area and autofill form
  btnProcess.addEventListener("click", () => {
    const text = txtVoice.value.trim();
    if (!text) return;
    
    parseAndFillVoiceText(text);
    txtVoice.value = "";
    statusLog.innerHTML = "¡Formulario autocompletado en base al dictado!";
  });
}

// Parse text using regexes and autofill
function parseAndFillVoiceText(text) {
  const lower = text.toLowerCase();

  // 1. Jornada
  const jMatch = lower.match(/jornada\s*(\d+)/i);
  if (jMatch) document.getElementById("inp-jornada").value = jMatch[1];

  // 2. Equipo & Categoría
  // Check for common club categories
  const categories = [
    { key: "cadet s16", name: "Cadet S16", cat: "Cadet Segona Divisió S16 - Grup 24" },
    { key: "juvenil", name: "Juvenil", cat: "JUVENIL SEGONA DIVISIÓ (GRUP 46)" },
    { key: "benjami s10", name: "Benjamí S10", cat: "PRIMERA DIVISIÓ BENJAMÍ S10 (GRUP 13)" },
    { key: "aleví s11", name: "Aleví S11", cat: "SEGONA DIVISIÓ ALEVÍ S11 (GRUP 18)" },
    { key: "alevi s11", name: "Aleví S11", cat: "SEGONA DIVISIÓ ALEVÍ S11 (GRUP 18)" },
    { key: "aleví s12", name: "Aleví S12", cat: "SEGONA DIVISIÓ ALEVÍ S12 (GRUP 22)" },
    { key: "alevi s12", name: "Aleví S12", cat: "SEGONA DIVISIÓ ALEVÍ S12 (GRUP 22)" },
    { key: "infantil s14", name: "Infantil S14", cat: "INFANTIL SEGONA DIVISIÓ S14 (GRUP 28)" },
    { key: "quarta catalana", name: "Quarta Catalana", cat: "QUARTA CATALANA (GRUP 29)" }
  ];
  let catFound = false;
  for (let c of categories) {
    if (lower.includes(c.key)) {
      document.getElementById("inp-equipo").value = c.name;
      document.getElementById("inp-categoria").value = c.cat;
      catFound = true;
      break;
    }
  }

  // 3. Rival
  const rMatch = text.match(/(?:contra|partido contra|rival|versus)\s+([a-zA-Z0-9\s]+?)(?:,|\ssábado|\sdomingo|\slunes|\smartes|\smiércoles|\sjueves|\sviernes|campo|llegada|equipación|$)/i);
  if (rMatch) document.getElementById("inp-rival").value = rMatch[1].trim();

  // 4. Día
  const dMatch = text.match(/(sábado|domingo|lunes|martes|miércoles|jueves|viernes)\s*(\d{1,2}\s+de\s+[a-z]+)?/i);
  if (dMatch) {
    let diaText = dMatch[1];
    if (dMatch[2]) diaText += ", " + dMatch[2];
    // try to match full date if present
    const fullDateMatch = text.match(/(sábado|domingo|lunes|martes|miércoles|jueves|viernes)\s+\d{1,2}\s+de\s+[a-z]+(?:\s+de\s+\d{4})?/i);
    document.getElementById("inp-dia").value = fullDateMatch ? fullDateMatch[0] : diaText;
  }

  // 5. Hora del partido
  const hMatch = text.match(/(?:a las|hora)\s+(\d{1,2}[:\.]\d{2})/i);
  if (hMatch) {
    const matchTime = hMatch[1].replace(".", ":");
    document.getElementById("inp-hora").value = matchTime;
    autoCalculateArrivalTime(matchTime);
  }

  // 6. Llegada
  const llMatch = text.match(/(?:llegada a las|llegada|citar a las)\s+(\d{1,2}[:\.]\d{2})/i);
  if (llMatch) {
    document.getElementById("inp-llegada").value = llMatch[1].replace(".", ":");
  } else if (hMatch) {
    autoCalculateArrivalTime(document.getElementById("inp-hora").value);
  }

  // 7. Campo
  const cMatch = text.match(/(?:campo|instalación|en el campo|en)\s+([a-zA-Z0-9\s]+?)(?:,|\sequipación|cuerpo|convocados|$)/i);
  if (cMatch && !cMatch[1].toLowerCase().includes("llegada") && !cMatch[1].toLowerCase().includes("camiseta")) {
    document.getElementById("inp-campo").value = cMatch[1].trim();
  }

  // 8. Equipación
  const eMatch = text.match(/(?:equipación|camiseta)\s+([a-zA-Z0-9\s,]+?)(?:,|\sconvocados|cuerpo|$)/i);
  if (eMatch) {
    const kitText = eMatch[1].toLowerCase();
    const kitSelect = document.getElementById("inp-equipacion");
    if (kitText.includes("segunda") || kitText.includes("2") || kitText.includes("negra") || kitText.includes("alternativa")) {
      kitSelect.value = "2ª Equipación (Camiseta negra, pantalón negro y medias negras)";
    } else {
      kitSelect.value = "1ª Equipación (Camiseta verde, pantalón blanco y medias verdes)";
    }
  }

  // 9. Convocados Parsing
  // Matches everything after "convocados" up to "no convocados", "cuerpo" or the end
  const convBlockMatch = text.match(/convocados\s+([^#]+?)(?:no convocados|cuerpo técnico|cuerpo|observaciones|$)/i);
  if (convBlockMatch) {
    const listText = convBlockMatch[1];
    // Split by commas, "y" or "o"
    const names = listText.split(/,|\by\b|\bo\b/).map(n => n.trim()).filter(n => n.length > 2);
    
    const equipoVal = document.getElementById("inp-equipo").value || "";
    const isBenjOrAlev = equipoVal.toLowerCase().includes("benjam") || equipoVal.toLowerCase().includes("alev");
    const limit = isBenjOrAlev ? 15 : 18;

    convocadosList = names.map(n => {
      // Clean names
      let name = n.charAt(0).toUpperCase() + n.slice(1);
      return { name, pos: "Jugador" };
    });

    if (convocadosList.length > limit) {
      alert(`Se han detectado ${convocadosList.length} jugadores en el dictado, pero la categoría ${equipoVal || "actual"} admite un máximo de ${limit}. Se han seleccionado los primeros ${limit}.`);
      convocadosList = convocadosList.slice(0, limit);
    }

    renderConvocadosEditor();
  }

  // 10. No Convocados Parsing
  const noConvBlockMatch = text.match(/no convocados\s+([^#]+?)(?:observaciones|cuerpo|$)/i);
  if (noConvBlockMatch) {
    const listText = noConvBlockMatch[1];
    const items = listText.split(/,|\by\b/).map(n => n.trim()).filter(n => n.length > 2);
    
    noConvocadosList = items.map(item => {
      let name = item;
      let reason = "tecnica"; // default

      if (item.includes("lesión") || item.includes("lesion")) {
        reason = "lesion";
        name = item.replace(/por lesión|por lesion|lesionada?o?/gi, "").trim();
      } else if (item.includes("sanción") || item.includes("sancion")) {
        reason = "sancion";
        name = item.replace(/por sanción|por sancion|sancionada?o?/gi, "").trim();
      } else {
        name = item.replace(/por decisión técnica|por decision tecnica|decision tecnica/gi, "").trim();
      }

      // Clean capitalize
      name = name.split(/\s+/).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
      return { name, pos: "Jugador", reason };
    });
    renderNoConvocadosEditor();
  }

  updateLivePreview();
}

// Download PDF using html2pdf
function downloadPDF() {
  const element = document.getElementById("folio-preview-card");
  const jornada = document.getElementById("inp-jornada").value || "X";
  const equipo = document.getElementById("inp-equipo").value || "Equipo";
  
  if (convocadosList.length === 0) {
    alert("Agrega jugadores convocados antes de descargar el PDF.");
    return;
  }

  // Check limit (15 for Benjamín/Alevín, 18 for others)
  const isBenjOrAlev = equipo.toLowerCase().includes("benjam") || equipo.toLowerCase().includes("alev");
  const limit = isBenjOrAlev ? 15 : 18;
  if (convocadosList.length > limit) {
    alert(`No se puede descargar el PDF: Has convocado a ${convocadosList.length} jugadores, pero el máximo para la categoría de ${equipo} es ${limit}.`);
    return;
  }

  // Temporarily switch to PDF mode
  element.classList.remove("preview-mode");
  element.classList.add("pdf-mode");

  const wrapper = document.getElementById("preview-scale-wrapper");
  const oldTransform = wrapper.style.transform;
  const oldWidth = wrapper.style.width;
  const oldHeight = wrapper.style.height;
  const oldMarginBottom = wrapper.style.marginBottom;
  
  wrapper.style.transform = "none";
  wrapper.style.width = "794px";
  wrapper.style.height = "1123px";
  wrapper.style.marginBottom = "0px";

  // Force synchronous layout reflow
  element.offsetHeight;

  const opt = {
    margin: 0,
    filename: `Convocatoria_Jornada_${jornada}_${equipo.replace(/\s+/g, "_")}.pdf`,
    image: { type: "jpeg", quality: 0.98 },
    html2canvas: { 
      scale: 2, 
      useCORS: true, 
      logging: true,
      x: 0,
      y: 0,
      scrollX: 0,
      scrollY: 0
    },
    jsPDF: { unit: "mm", format: "a4", orientation: "portrait" }
  };

  // Wait 250ms for browser to render styles and paint before capturing
  setTimeout(() => {
    html2pdf().set(opt).from(element).save().then(() => {
      // Restore styling mode
      element.classList.remove("pdf-mode");
      element.classList.add("preview-mode");
      wrapper.style.transform = oldTransform;
      if (oldWidth) wrapper.style.width = oldWidth; else wrapper.style.removeProperty("width");
      if (oldHeight) wrapper.style.height = oldHeight; else wrapper.style.removeProperty("height");
      wrapper.style.marginBottom = oldMarginBottom;
      scalePreviewSheet();
    }).catch(e => {
      console.error(e);
      element.classList.remove("pdf-mode");
      element.classList.add("preview-mode");
      wrapper.style.transform = oldTransform;
      if (oldWidth) wrapper.style.width = oldWidth; else wrapper.style.removeProperty("width");
      if (oldHeight) wrapper.style.height = oldHeight; else wrapper.style.removeProperty("height");
      wrapper.style.marginBottom = oldMarginBottom;
      scalePreviewSheet();
      alert("Error al compilar el PDF. Inténtalo de nuevo.");
    });
  }, 250);
}

// Open WhatsApp prepared message
function sendWhatsApp() {
  const jornada = document.getElementById("inp-jornada").value || "[Jornada]";
  const equipo = document.getElementById("inp-equipo").value || "[Equipo]";
  const rival = document.getElementById("inp-rival").value || "[Rival]";
  const dia = document.getElementById("inp-dia").value || "[Día]";
  const hora = document.getElementById("inp-hora").value || "[Hora]";
  const llegada = document.getElementById("inp-llegada").value || "[Llegada]";
  const campo = document.getElementById("inp-campo").value || "[Campo]";
  const cuerpo = document.getElementById("inp-cuerpo").value;

  // Check limit (15 for Benjamín/Alevín, 18 for others)
  const isBenjOrAlev = equipo.toLowerCase().includes("benjam") || equipo.toLowerCase().includes("alev");
  const limit = isBenjOrAlev ? 15 : 18;
  if (convocadosList.length > limit) {
    alert(`No se puede enviar por WhatsApp: Has convocado a ${convocadosList.length} jugadores, pero el máximo para la categoría de ${equipo} es ${limit}.`);
    return;
  }

  // Extract DT phone if known
  let phoneStr = "";
  let dts = cuerpo.split(/y|,/)[0].trim();
  if (dts && staffDirectory[dts]) {
    phoneStr = staffDirectory[dts].digits;
  }

  const msg = `Convocatoria Jornada ${jornada} — ${equipo} vs ${rival}. Partido el ${dia} a las ${hora}. Llegada a las ${llegada}. Campo: ${campo}.`;
  
  // Format WhatsApp link (with phone number if found, otherwise generic link)
  let url = `https://wa.me/?text=${encodeURIComponent(msg)}`;
  if (phoneStr) {
    url = `https://wa.me/34${phoneStr}?text=${encodeURIComponent(msg)}`;
  }

  // Open link
  window.open(url, "_blank");

  // Inform trainer to attach PDF manually
  alert("Se ha abierto WhatsApp Web con el mensaje preconfigurado.\n\nRecuerda adjuntar manualmente el PDF descargado en el chat para enviar la ficha oficial.");
}
