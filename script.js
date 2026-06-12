/* ==========================================================================
   CD Mangraners - Planificador de Convocatorias
   Main Interactive Controller (From Scratch)
   ========================================================================== */

// 1. Setup Fallback HTML Template (matches plantilla_folio.html structure)
const fallbackTemplate = `
  <div class="folio-top-stripe"></div>
  <div class="folio-header">
    <div class="folio-logo-title">
      <div class="folio-logo-container">
        <img class="folio-logo" src="logo_club.jpg" alt="CD Mangraners Escudo" onerror="this.src='logo_club.png';">
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
  
  <div class="folio-header-divider"></div>

  <div class="folio-main-title-block">
    <h2 class="folio-main-title">CONVOCATORIA OFICIAL</h2>
    <div class="folio-main-subtitle">Jornada {{Jornada}} — {{Equipo}}</div>
  </div>

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

  <div class="folio-squad-section">
    <div class="folio-section-title">Jugadores Convocados</div>
    <div class="folio-player-grid">
      {{ConvocadosRows}}
    </div>
  </div>

  <div class="folio-bottom-block">
    <div class="folio-obs-card" id="folio-obs-container" style="{{ShowObservations}}">
      <div class="folio-obs-title">Observaciones de Convocatoria</div>
      <div class="folio-obs-body">{{Observaciones}}</div>
    </div>

    <div class="folio-no-conv-card" id="folio-noconv-container" style="{{ShowNoConvocados}}">
      <div class="folio-no-conv-title">Situación de Plantilla (No Convocados)</div>
      <div class="folio-no-conv-grid">
        {{NoConvocadosRows}}
      </div>
    </div>
  </div>

  <div class="folio-footer">
    <div class="folio-footer-info">
      <div class="folio-footer-motto">Som un projecte de formació, competició i valors</div>
      <div>CD Mangraners — Coordinación Deportiva</div>
      <div style="font-size: 7px; color: #94a3b8; margin-top: 1px;">Documento generado automáticamente para uso interno del club</div>
    </div>
    <div class="folio-signature-container">
      <div class="signature-image-container">
        <img src="firma_autorizada.jpg" alt="Firma Autorizada">
      </div>
      <div class="stamp-container">
        <img src="logo_club.jpg" alt="Sello Club">
      </div>
      <div class="folio-signature-line" id="folio-signature-label">{{FirmaResponsable}}</div>
    </div>
  </div>
`;

// Staff Directory (matching official coordinators and coaches)
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

// Global Roster Lists
let convocadosList = [];
let noConvocadosList = [];
let templateHtml = "";

// 2. Application Entrypoint
document.addEventListener("DOMContentLoaded", () => {
  // Load templates and initial state
  loadTemplateAsync();
  setupDynamicFormMappings();
  setupInteractiveListControls();
  setupSpeechRecognitionAssistant();
  
  // Register Actions
  document.getElementById("btn-generate").addEventListener("click", forceLiveRefresh);
  document.getElementById("btn-load-demo").addEventListener("click", loadDemoMatchday);
  document.getElementById("btn-download-pdf").addEventListener("click", downloadAsSinglePagePDF);
  document.getElementById("btn-clear").addEventListener("click", resetAllInputs);
  document.getElementById("btn-send-whatsapp").addEventListener("click", shareSquadCallWhatsApp);
  
  // Window Resizing Handlers
  window.addEventListener("resize", scaleLivePreviewPanel);
});

// 3. Load plantillas dynamically
async function loadTemplateAsync() {
  try {
    const res = await fetch("plantilla_folio.html");
    if (res.ok) {
      const text = await res.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(text, "text/html");
      const card = doc.getElementById("folio-preview-card");
      if (card) {
        templateHtml = card.innerHTML;
        console.log("Loaded template from plantilla_folio.html successfully.");
      } else {
        templateHtml = fallbackTemplate;
      }
    } else {
      templateHtml = fallbackTemplate;
    }
  } catch (e) {
    console.warn("CORS block or fetch error. Falling back to local template.", e);
    templateHtml = fallbackTemplate;
  }
  updateLivePreview();
}

// 4. Form Mappings & Auto-populations
function setupDynamicFormMappings() {
  const teamSelect = document.getElementById("inp-equipo");
  const catSelect = document.getElementById("inp-categoria");
  const jornadaSelect = document.getElementById("inp-jornada");
  const horaInput = document.getElementById("inp-hora");
  
  const teamToCatMap = {
    "Benjamí S10": "PRIMERA DIVISIÓ BENJAMÍ S10 (GRUP 13)",
    "Aleví S11": "SEGONA DIVISIÓ ALEVÍ S11 (GRUP 18)",
    "Aleví S12": "SEGONA DIVISIÓ ALEVÍ S12 (GRUP 22)",
    "Infantil S14": "INFANTIL SEGONA DIVISIÓ S14 (GRUP 28)",
    "Cadet S16": "Cadet Segona Divisió S16 - Grup 24",
    "Juvenil": "JUVENIL SEGONA DIVISIÓ (GRUP 46)",
    "Quarta Catalana": "QUARTA CATALANA (GRUP 29)"
  };

  const catToTeamMap = {};
  for (let key in teamToCatMap) {
    catToTeamMap[teamToCatMap[key]] = key;
  }

  const teamToStaffMap = {
    "Benjamí S10": "Felipe Filartiga y Joel Benitez",
    "Aleví S11": "Felipe Filartiga y Joel Benitez",
    "Aleví S12": "Joel Benitez",
    "Infantil S14": "Federico Ferreira",
    "Cadet S16": "Federico Ferreira y Joel Benitez",
    "Juvenil": "Aureliano Torres y Buena Ferreira",
    "Quarta Catalana": "Aureliano Torres y Buena Ferreira"
  };

  // Sync Team -> Category and Staff
  if (teamSelect && catSelect) {
    let lastTeam = teamSelect.value;
    let lastCat = catSelect.value;

    teamSelect.addEventListener("change", () => {
      const team = teamSelect.value;
      if (convocadosList.length > 0 || noConvocadosList.length > 0) {
        if (!confirm("Cambiar de equipo borrará la lista de jugadores seleccionados. ¿Deseas continuar?")) {
          teamSelect.value = lastTeam;
          return;
        }
      }
      lastTeam = team;
      
      if (teamToCatMap[team]) {
        catSelect.value = teamToCatMap[team];
        lastCat = teamToCatMap[team];
      }
      
      if (teamToStaffMap[team]) {
        document.getElementById("inp-cuerpo").value = teamToStaffMap[team];
      }

      // Reset roster lists
      convocadosList = [];
      noConvocadosList = [];
      renderConvocadosList();
      renderNoConvocadosList();
      
      // Load team specific dropdown options
      updateJornadaDropdownOptions(team);
      autoPopulateMatchDetails();
      updateLivePreview();
    });

    // Sync Category -> Team and Staff
    catSelect.addEventListener("change", () => {
      const cat = catSelect.value;
      if (convocadosList.length > 0 || noConvocadosList.length > 0) {
        if (!confirm("Cambiar de equipo borrará la lista de jugadores seleccionados. ¿Deseas continuar?")) {
          catSelect.value = lastCat;
          return;
        }
      }
      lastCat = cat;

      if (catToTeamMap[cat]) {
        const team = catToTeamMap[cat];
        teamSelect.value = team;
        lastTeam = team;
        
        if (teamToStaffMap[team]) {
          document.getElementById("inp-cuerpo").value = teamToStaffMap[team];
        }

        // Reset lists
        convocadosList = [];
        noConvocadosList = [];
        renderConvocadosList();
        renderNoConvocadosList();
        
        updateJornadaDropdownOptions(team);
        autoPopulateMatchDetails();
        updateLivePreview();
      }
    });
  }

  if (jornadaSelect) {
    jornadaSelect.addEventListener("change", () => {
      autoPopulateMatchDetails();
    });
  }

  if (horaInput) {
    const triggerArrivalCalc = () => {
      autoCalculateArrivalTime(horaInput.value);
    };
    horaInput.addEventListener("input", triggerArrivalCalc);
    horaInput.addEventListener("change", triggerArrivalCalc);
  }

  // Register Live Input Event Triggers for all inputs
  const inputsToWatch = [
    "inp-rival", "inp-dia", "inp-hora", "inp-llegada", "inp-campo",
    "inp-condicion", "inp-equipacion", "inp-cuerpo", "inp-obs"
  ];
  inputsToWatch.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener("input", updateLivePreview);
      el.addEventListener("change", updateLivePreview);
    }
  });
}

// 5. Update Jornada dropdown choices dynamically
let currentActiveTeamForJornada = "";
function updateJornadaDropdownOptions(team) {
  if (team === currentActiveTeamForJornada) return;
  currentActiveTeamForJornada = team;

  const select = document.getElementById("inp-jornada");
  if (!select) return;

  const currentVal = select.value;
  select.innerHTML = '<option value="">-- Seleccionar --</option>';

  if (!team) return;

  // Benjamín S10 has 26 matches, others have 30
  const totalMatches = team === "Benjamí S10" ? 26 : 30;

  for (let i = 1; i <= totalMatches; i++) {
    const opt = document.createElement("option");
    opt.value = i.toString();
    opt.textContent = `Jornada ${i}`;
    select.appendChild(opt);
  }

  if (currentVal && parseInt(currentVal) <= totalMatches) {
    select.value = currentVal;
  }
}

// 6. Auto-populate from calendar data structure
function autoPopulateMatchDetails() {
  const team = document.getElementById("inp-equipo").value;
  const jornada = document.getElementById("inp-jornada").value;

  if (!team || !jornada) return;

  if (typeof CD_MANGRANERS_CALENDARS !== "undefined" && CD_MANGRANERS_CALENDARS[team] && CD_MANGRANERS_CALENDARS[team][jornada]) {
    const match = CD_MANGRANERS_CALENDARS[team][jornada];

    document.getElementById("inp-rival").value = match.rival || "";
    
    // Normalize condition values (Local, Visitante, Fuera)
    if (match.condicion === "Local" || match.condicion === "Visitante" || match.condicion === "Fuera") {
      document.getElementById("inp-condicion").value = match.condicion === "Fuera" ? "Visitante" : match.condicion;
    } else {
      document.getElementById("inp-condicion").value = "Visitante";
    }

    document.getElementById("inp-dia").value = match.dia || "";
    document.getElementById("inp-hora").value = match.hora || "";
    document.getElementById("inp-campo").value = match.campo || "";

    autoCalculateArrivalTime(match.hora || "");
    updateLivePreview();
  }
}

// 7. Calculate 1 hour before arrival
function autoCalculateArrivalTime(kickoff) {
  const arrivalInput = document.getElementById("inp-llegada");
  if (!arrivalInput) return;

  if (!kickoff || kickoff.toLowerCase().includes("confirmar") || kickoff.trim() === "-") {
    arrivalInput.value = "A confirmar";
    updateLivePreview();
    return;
  }

  const matches = kickoff.match(/(\d{1,2})[:\.](\d{2})/);
  if (matches) {
    let hh = parseInt(matches[1], 10);
    const mm = matches[2];

    // Deduct 1 hr
    hh = (hh - 1 + 24) % 24;
    const formattedHour = hh.toString().padStart(2, '0');
    arrivalInput.value = `${formattedHour}:${mm}`;
  } else {
    arrivalInput.value = "A confirmar";
  }
  updateLivePreview();
}

// 8. Player select management & interaction
function setupInteractiveListControls() {
  const convSel = document.getElementById("sel-available-conv");
  const noConvSel = document.getElementById("sel-available-noconv");

  if (convSel) {
    convSel.addEventListener("change", function() {
      const name = this.value;
      if (!name) return;

      const team = document.getElementById("inp-equipo").value;
      if (!team) {
        alert("Por favor, selecciona un equipo primero.");
        this.value = "";
        return;
      }

      // Check lists size limits
      const isBenjOrAlev = team.toLowerCase().includes("benjam") || team.toLowerCase().includes("alev");
      const limit = isBenjOrAlev ? 15 : 18;
      if (convocadosList.length >= limit) {
        alert(`Límite alcanzado: Las categorías Benjamín y Alevín admiten 15 convocados, las demás un máximo de ${limit}.`);
        this.value = "";
        return;
      }

      if (name === "__custom__") {
        const cName = prompt("Nombre y apellidos del jugador:");
        if (!cName) { this.value = ""; return; }
        const cPos = prompt("Demarcación (ej. Defensa, Portero, Delantero):", "Jugador") || "Jugador";
        convocadosList.push({ name: cName, pos: cPos });
      } else {
        // Resolve roster pos
        let rosterObj = null;
        if (typeof CD_MANGRANERS_PLAYERS !== "undefined" && CD_MANGRANERS_PLAYERS[team]) {
          rosterObj = CD_MANGRANERS_PLAYERS[team].find(p => p.name === name);
        }
        const pos = rosterObj ? rosterObj.pos : "Jugador";

        // De-duplicate from non convocados
        noConvocadosList = noConvocadosList.filter(p => p.name !== name);
        convocadosList.push({ name, pos });
      }

      this.value = "";
      renderConvocadosList();
      renderNoConvocadosList();
      updateLivePreview();
    });
  }

  if (noConvSel) {
    noConvSel.addEventListener("change", function() {
      const name = this.value;
      if (!name) return;

      const team = document.getElementById("inp-equipo").value;
      if (!team) {
        alert("Por favor, selecciona un equipo primero.");
        this.value = "";
        return;
      }

      if (name === "__custom__") {
        const cName = prompt("Nombre y apellidos del jugador:");
        if (!cName) { this.value = ""; return; }
        const cPos = prompt("Demarcación (ej. Defensa, Portero, Delantero):", "Jugador") || "Jugador";
        noConvocadosList.push({ name: cName, pos: cPos, reason: "tecnica" });
      } else {
        let rosterObj = null;
        if (typeof CD_MANGRANERS_PLAYERS !== "undefined" && CD_MANGRANERS_PLAYERS[team]) {
          rosterObj = CD_MANGRANERS_PLAYERS[team].find(p => p.name === name);
        }
        const pos = rosterObj ? rosterObj.pos : "Jugador";

        // De-duplicate from convocados
        convocadosList = convocadosList.filter(p => p.name !== name);
        noConvocadosList.push({ name, pos, reason: "tecnica" });
      }

      this.value = "";
      renderConvocadosList();
      renderNoConvocadosList();
      updateLivePreview();
    });
  }
}

// 9. Available roster dropdown filter population
function populateAvailableRosters() {
  const team = document.getElementById("inp-equipo").value;
  const convSelect = document.getElementById("sel-available-conv");
  const noConvSelect = document.getElementById("sel-available-noconv");

  if (!convSelect || !noConvSelect) return;

  convSelect.innerHTML = '<option value="">-- Seleccionar jugador para convocar --</option>';
  noConvSelect.innerHTML = '<option value="">-- Seleccionar jugador no convocado --</option>';

  if (!team) return;

  const roster = (typeof CD_MANGRANERS_PLAYERS !== "undefined" && CD_MANGRANERS_PLAYERS[team]) ? CD_MANGRANERS_PLAYERS[team] : [];

  // Make list of all candidates (union of roster and custom names currently selected)
  const namesMap = new Map();
  roster.forEach(p => namesMap.set(p.name, p.pos));
  convocadosList.forEach(p => { if(!namesMap.has(p.name)) namesMap.set(p.name, p.pos); });
  noConvocadosList.forEach(p => { if(!namesMap.has(p.name)) namesMap.set(p.name, p.pos); });

  namesMap.forEach((pos, name) => {
    const inConv = convocadosList.some(p => p.name === name);
    const inNoConv = noConvocadosList.some(p => p.name === name);

    if (!inConv && !inNoConv) {
      const opt1 = document.createElement("option");
      opt1.value = name;
      opt1.textContent = `${name} (${pos})`;
      convSelect.appendChild(opt1);

      const opt2 = document.createElement("option");
      opt2.value = name;
      opt2.textContent = `${name} (${pos})`;
      noConvSelect.appendChild(opt2);
    }
  });

  // Add custom player options
  const customOpt1 = document.createElement("option");
  customOpt1.value = "__custom__";
  customOpt1.textContent = "[ + Añadir jugador personalizado... ]";
  convSelect.appendChild(customOpt1);

  const customOpt2 = document.createElement("option");
  customOpt2.value = "__custom__";
  customOpt2.textContent = "[ + Añadir jugador personalizado... ]";
  noConvSelect.appendChild(customOpt2);
}

// 10. Render Convocados editor rows
function renderConvocadosList() {
  const container = document.getElementById("convocados-list-container");
  if (!container) return;

  container.innerHTML = "";
  if (convocadosList.length === 0) {
    container.innerHTML = '<div class="empty-list-placeholder">Ningún jugador convocado aún.</div>';
    return;
  }

  convocadosList.forEach((p, idx) => {
    const div = document.createElement("div");
    div.className = "player-item-row";
    div.innerHTML = `
      <input type="text" value="${p.name}" oninput="updateConvocadoName(${idx}, this.value)" style="flex: 2;">
      <input type="text" value="${p.pos}" oninput="updateConvocadoPos(${idx}, this.value)" style="flex: 1; max-width: 120px;">
      <button type="button" class="remove-btn" onclick="removeConvocado(${idx})" title="Remover jugador">&times;</button>
    `;
    container.appendChild(div);
  });
}

// 11. Render No Convocados editor rows
function renderNoConvocadosList() {
  const container = document.getElementById("noconv-list-container");
  if (!container) return;

  container.innerHTML = "";
  if (noConvocadosList.length === 0) {
    container.innerHTML = '<div class="empty-list-placeholder">Ningún jugador no convocado aún.</div>';
    return;
  }

  noConvocadosList.forEach((p, idx) => {
    const div = document.createElement("div");
    div.className = "noconv-item-row";
    div.innerHTML = `
      <input type="text" value="${p.name}" oninput="updateNoConvocadoName(${idx}, this.value)" style="flex: 2;">
      <select onchange="updateNoConvocadoReason(${idx}, this.value)" style="flex: 1; max-width: 130px;">
        <option value="tecnica" ${p.reason === "tecnica" ? "selected" : ""}>D. Técnica</option>
        <option value="lesion" ${p.reason === "lesion" ? "selected" : ""}>Lesión</option>
        <option value="sancion" ${p.reason === "sancion" ? "selected" : ""}>Sanción</option>
      </select>
      <button type="button" class="remove-btn" onclick="removeNoConvocado(${idx})" title="Remover jugador">&times;</button>
    `;
    container.appendChild(div);
  });
}

// 12. Globals for inline DOM events
window.removeConvocado = function(idx) {
  convocadosList.splice(idx, 1);
  renderConvocadosList();
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
  renderNoConvocadosList();
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

// 13. Update limits badges in form headers
function updateConvocadosLimitBadge() {
  const team = document.getElementById("inp-equipo").value;
  const badge = document.getElementById("conv-limit-info");
  if (!badge) return;

  if (!team) {
    badge.textContent = "(Límite: 18)";
    badge.style.color = "var(--color-text-muted)";
    return;
  }

  const isBenjOrAlev = team.toLowerCase().includes("benjam") || team.toLowerCase().includes("alev");
  const limit = isBenjOrAlev ? 15 : 18;
  badge.textContent = `(Convocados: ${convocadosList.length}/${limit})`;

  if (convocadosList.length > limit) {
    badge.style.color = "var(--color-danger)";
    badge.style.fontWeight = "bold";
  } else if (convocadosList.length === limit) {
    badge.style.color = "var(--color-accent)";
    badge.style.fontWeight = "bold";
  } else {
    badge.style.color = "var(--color-accent)";
    badge.style.fontWeight = "normal";
  }
}

// 14. Live Preview Builder
function updateLivePreview() {
  if (!templateHtml) return;

  const team = document.getElementById("inp-equipo").value || "";
  updateJornadaDropdownOptions(team);
  updateConvocadosLimitBadge();
  populateAvailableRosters();

  const previewContainer = document.getElementById("folio-preview-container");
  if (!previewContainer) return;

  // Gather values from form fields
  const jornada = document.getElementById("inp-jornada").value || "[Número]";
  const equipo = document.getElementById("inp-equipo").value || "[Equipo]";
  const categoria = document.getElementById("inp-categoria").value || "[Categoría]";
  const rival = document.getElementById("inp-rival").value || "[Rival]";
  const dia = document.getElementById("inp-dia").value || "[Día del partido]";
  const hora = document.getElementById("inp-hora").value || "[Hora]";
  const llegada = document.getElementById("inp-llegada").value || "[Hora]";
  const campo = document.getElementById("inp-campo").value || "[Campo de juego]";
  const condicion = document.getElementById("inp-condicion").value || "Visitante";
  const equipacion = document.getElementById("inp-equipacion").value || "[Equipación]";
  const cuerpo = document.getElementById("inp-cuerpo").value || "[Cuerpo técnico]";
  const obs = document.getElementById("inp-obs").value.trim();

  // Create HTML for convocados player cells
  let convRowsHtml = "";
  if (convocadosList.length === 0) {
    convRowsHtml = '<div class="folio-empty-placeholder">No se han seleccionado jugadores convocados</div>';
  } else {
    convocadosList.forEach((p, idx) => {
      const idxStr = (idx + 1).toString().padStart(2, '0');
      convRowsHtml += `
        <div class="folio-player-card">
          <span class="folio-player-num">${idxStr}</span>
          <div class="folio-player-details">
            <span class="folio-player-name">${p.name}</span>
            <span class="folio-player-pos">${p.pos}</span>
          </div>
        </div>
      `;
    });
  }

  // Create HTML for no convocados rows
  let noConvRowsHtml = "";
  const showNoConvStyle = noConvocadosList.length > 0 ? "display: block;" : "display: none;";

  if (noConvocadosList.length > 0) {
    noConvocadosList.forEach(p => {
      let badgeClass = "folio-badge-dt";
      let badgeText = "D. Técnica";
      let descText = "No convocado por decisión técnica o rotación.";

      if (p.reason === "lesion") {
        badgeClass = "folio-badge-injury";
        badgeText = "Lesión";
        descText = "Baja médica o recuperación física.";
      } else if (p.reason === "sancion") {
        badgeClass = "folio-badge-suspension";
        badgeText = "Sanción";
        descText = "Baja disciplinaria federativa.";
      }

      noConvRowsHtml += `
        <div class="folio-no-conv-row">
          <span class="folio-no-conv-badge ${badgeClass}">${badgeText}</span>
          <span class="folio-no-conv-player">${p.name}</span>
          <span class="folio-no-conv-desc">${descText}</span>
        </div>
      `;
    });
  }

  // Define signature text
  const mainDT = cuerpo.split(/y|,/)[0].trim() || "Dirección Deportiva";
  const signatureLabel = `${mainDT} (DT)`;

  // Replacements
  const condicionClass = (condicion.toLowerCase() === "visitante" || condicion.toLowerCase() === "fuera") ? "visitante" : "local";
  const showObsStyle = obs ? "display: block;" : "display: none;";

  const compiled = templateHtml
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
    .replace(/{{NoConvocadosRows}}/g, noConvRowsHtml)
    .replace(/{{FirmaResponsable}}/g, signatureLabel);

  previewContainer.innerHTML = compiled;
  scaleLivePreviewPanel();
}

function forceLiveRefresh() {
  updateLivePreview();
}

// 15. Scale the A4 card layout to fit dashboard preview panel
function scaleLivePreviewPanel() {
  const panel = document.getElementById("preview-panel");
  const wrapper = document.getElementById("preview-scale-wrapper");
  const sheet = document.getElementById("folio-preview-card");

  if (!panel || !wrapper || !sheet) return;

  sheet.classList.remove("preview-mode");
  sheet.classList.add("pdf-export"); // Enforce clean standard DPI scaling class

  const padLeft = parseFloat(window.getComputedStyle(panel).paddingLeft) || 15;
  const padRight = parseFloat(window.getComputedStyle(panel).paddingRight) || 15;
  
  const panelWidth = panel.clientWidth - (padLeft + padRight);
  const A4Width = 794; // Standard pixel width of A4 page at 96 DPI

  let scale = panelWidth / A4Width;
  if (scale > 1.0) scale = 1.0;
  if (scale < 0.2) scale = 0.2;

  wrapper.style.transform = `scale(${scale})`;
  wrapper.style.transformOrigin = "top center";
  wrapper.style.width = `${A4Width}px`;
  wrapper.style.maxWidth = "100%";
  wrapper.style.margin = "0 auto";

  const scaledHeight = sheet.offsetHeight * scale;
  wrapper.style.height = `${scaledHeight}px`;
  wrapper.style.marginBottom = "20px";
  
  sheet.style.transform = "none";
}

// 16. Load demo dataset
function loadDemoMatchday() {
  document.getElementById("inp-equipo").value = "Cadet S16";
  updateJornadaDropdownOptions("Cadet S16");
  document.getElementById("inp-jornada").value = "1";
  document.getElementById("inp-categoria").value = "Cadet Segona Divisió S16 - Grup 24";
  document.getElementById("inp-rival").value = "CFJ Mollerussa B";
  document.getElementById("inp-dia").value = "Sábado, 13 de junio de 2026";
  document.getElementById("inp-hora").value = "17:45";
  document.getElementById("inp-llegada").value = "16:45";
  document.getElementById("inp-campo").value = "Camp Municipal de Mollerussa";
  document.getElementById("inp-condicion").value = "Visitante";
  document.getElementById("inp-equipacion").value = "1ª Equipación (Verde/Blanco)";
  document.getElementById("inp-cuerpo").value = "Federico Ferreira y Joel Benitez";
  document.getElementById("inp-obs").value = "Presentación en el campo 1 hora antes del partido con la ropa del club.";

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

  noConvocadosList = [
    { name: "Matias German Aguilera Barrios", pos: "Portero", reason: "tecnica" },
    { name: "Erwin Adriano Cortaza Mareco", pos: "Delantero", reason: "lesion" },
    { name: "Juan Alberto Roman Cardozo", pos: "Lateral Derecho", reason: "sancion" }
  ];

  renderConvocadosList();
  renderNoConvocadosList();
  updateLivePreview();
}

// 17. Reset form state
function resetAllInputs() {
  if (confirm("¿Estás seguro de que deseas vaciar todo el formulario?")) {
    document.getElementById("convocatoria-form").reset();
    convocadosList = [];
    noConvocadosList = [];
    renderConvocadosList();
    renderNoConvocadosList();
    updateLivePreview();
  }
}

// 18. Generate WhatsApp Text block
function shareSquadCallWhatsApp() {
  const team = document.getElementById("inp-equipo").value || "[Equipo]";
  const jornada = document.getElementById("inp-jornada").value || "[Jornada]";
  const rival = document.getElementById("inp-rival").value || "[Rival]";
  const dia = document.getElementById("inp-dia").value || "[Día]";
  const hora = document.getElementById("inp-hora").value || "[Hora]";
  const llegada = document.getElementById("inp-llegada").value || "[Llegada]";
  const campo = document.getElementById("inp-campo").value || "[Campo]";
  const cuerpo = document.getElementById("inp-cuerpo").value || "";

  if (convocadosList.length === 0) {
    alert("Por favor, convoca a jugadores antes de compartir.");
    return;
  }

  // Build list strings
  let convStr = "";
  convocadosList.forEach((p, idx) => {
    convStr += `\n*${(idx + 1).toString().padStart(2, '0')}.* ${p.name} (${p.pos})`;
  });

  let noConvStr = "";
  if (noConvocadosList.length > 0) {
    noConvStr = "\n\n*Bajas / Rotaciones:*";
    noConvocadosList.forEach(p => {
      let rText = "Decisión técnica";
      if (p.reason === "lesion") rText = "Lesión";
      if (p.reason === "sancion") rText = "Sanción";
      noConvStr += `\n- ${p.name} (${rText})`;
    });
  }

  const text = `🟢⚪ *CONVOCATORIA OFICIAL — CD MANGRANERS* 🟢⚪
*Jornada ${jornada}* — Categ. ${team}

🆚 *Rival:* ${rival}
📅 *Día:* ${dia}
⏰ *Hora Partido:* ${hora} H
📍 *Instalación:* ${campo}
⌚ *Cita en el campo:* ${llegada} H
👕 *Equipación:* ${document.getElementById("inp-equipacion").value || "Verde/Blanco"}

*JUGADORES CITADOS:*${convStr}${noConvStr}

📋 *Cuerpo Técnico:* ${cuerpo}
🤝 Som un projecte de formació, competició i valors. ¡Som-hi Mangraners!`;

  // Look up phone of the first DT if available
  let phoneStr = "";
  const firstDT = cuerpo.split(/y|,/)[0].trim();
  if (firstDT && staffDirectory[firstDT]) {
    phoneStr = staffDirectory[firstDT].digits;
  }

  let waUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
  if (phoneStr) {
    waUrl = `https://wa.me/34${phoneStr}?text=${encodeURIComponent(text)}`;
  }
  
  window.open(waUrl, "_blank");
}

// 19. Export to Single-page A4 PDF using isolated layouts
function downloadAsSinglePagePDF() {
  const card = document.getElementById("folio-preview-card");
  if (!card) {
    alert("Error: No se encontró la tarjeta de convocatoria.");
    return;
  }

  if (convocadosList.length === 0) {
    alert("Agrega jugadores convocados antes de descargar el PDF.");
    return;
  }

  const team = document.getElementById("inp-equipo").value || "CD_Mangraners";
  const jornada = document.getElementById("inp-jornada").value || "X";

  // Elements to toggle layouts during screenshot render
  const sidebar = document.querySelector(".form-panel");
  const preview = document.getElementById("preview-panel");
  const wrapper = document.getElementById("preview-scale-wrapper");
  const header = document.querySelector(".app-header");
  const container = document.querySelector(".dashboard-container");

  if (!sidebar || !preview || !wrapper) {
    alert("Error de estructura en el DOM para la exportación.");
    return;
  }

  // Backup scroll states and layouts
  const scrX = window.scrollX;
  const scrY = window.scrollY;
  const oldSidebarDisplay = sidebar.style.display;
  const oldPreviewFlex = preview.style.flex;
  const oldPreviewWidth = preview.style.width;
  const oldPreviewPadding = preview.style.padding;
  const oldPreviewJustify = preview.style.justifyContent;
  const oldPreviewAlign = preview.style.alignItems;
  const oldWrapperMargin = wrapper.style.margin;
  const oldWrapperMaxWidth = wrapper.style.maxWidth;
  const oldWrapperJustify = wrapper.style.justifyContent;
  const oldWrapperTransform = wrapper.style.transform;
  const oldWrapperWidth = wrapper.style.width;
  const oldWrapperHeight = wrapper.style.height;
  const oldHeaderDisplay = header ? header.style.display : "";
  const oldContainerHeight = container ? container.style.height : "";
  const oldContainerPadding = container ? container.style.padding : "";
  const oldContainerMargin = container ? container.style.margin : "";

  // Reset scroll to 0,0
  window.scrollTo(0, 0);

  // Apply absolute overrides to isolate the preview card at full 100% A4 size
  if (header) header.style.setProperty("display", "none", "important");
  if (container) {
    container.style.setProperty("height", "auto", "important");
    container.style.setProperty("padding", "0", "important");
    container.style.setProperty("margin", "0", "important");
  }
  sidebar.style.setProperty("display", "none", "important");
  preview.style.setProperty("flex", "none", "important");
  preview.style.setProperty("width", "100%", "important");
  preview.style.setProperty("padding", "0", "important");
  preview.style.setProperty("justify-content", "flex-start", "important");
  preview.style.setProperty("align-items", "flex-start", "important");
  
  wrapper.style.setProperty("margin", "0", "important");
  wrapper.style.setProperty("max-width", "100%", "important");
  wrapper.style.setProperty("justify-content", "flex-start", "important");
  wrapper.style.setProperty("transform", "none", "important");
  wrapper.style.setProperty("width", "794px", "important");
  wrapper.style.setProperty("height", "1123px", "important");

  // Force sheet to use export dimensions layout
  card.classList.remove("preview-mode");
  card.classList.add("pdf-export");

  const options = {
    margin: [0, 0, 0, 0],
    filename: `Convocatoria_${team.replace(/\s+/g, "_")}_Jornada_${jornada}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: {
      scale: 2.2, // Clean high resolution print DPI scaling
      useCORS: true,
      backgroundColor: '#ffffff'
    },
    jsPDF: {
      unit: 'mm',
      format: 'a4',
      orientation: 'portrait'
    }
  };

  const restoreLayoutState = () => {
    window.scrollTo(scrX, scrY);
    if (header) header.style.display = oldHeaderDisplay;
    if (container) {
      container.style.height = oldContainerHeight;
      container.style.padding = oldContainerPadding;
      container.style.margin = oldContainerMargin;
    }
    sidebar.style.display = oldSidebarDisplay;
    preview.style.flex = oldPreviewFlex;
    preview.style.width = oldPreviewWidth;
    preview.style.padding = oldPreviewPadding;
    preview.style.justifyContent = oldPreviewJustify;
    preview.style.alignItems = oldPreviewAlign;
    wrapper.style.margin = oldWrapperMargin;
    wrapper.style.maxWidth = oldWrapperMaxWidth;
    wrapper.style.justifyContent = oldWrapperJustify;
    wrapper.style.transform = oldWrapperTransform;
    wrapper.style.width = oldWrapperWidth;
    wrapper.style.height = oldWrapperHeight;

    card.classList.add("pdf-export");
    scaleLivePreviewPanel();
  };

  // Give DOM 200ms to calculate layout changes before screenshot captures
  setTimeout(() => {
    html2pdf().set(options).from(card).save().then(() => {
      restoreLayoutState();
    }).catch(err => {
      console.error("html2pdf compiling error:", err);
      restoreLayoutState();
      alert("Error al compilar el PDF de Convocatoria.");
    });
  }, 200);
}

// 20. Web Speech API Assistant
let speechObj = null;
function setupSpeechRecognitionAssistant() {
  const btnStart = document.getElementById("btn-voice-start");
  const txtArea = document.getElementById("voice-text-area");
  const btnProc = document.getElementById("btn-voice-process");
  const statusLog = document.getElementById("voice-status-log");

  const SpeechRecognitionClass = window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!SpeechRecognitionClass) {
    statusLog.innerHTML = "Reconocimiento de voz no soportado en este navegador.";
    btnStart.disabled = true;
    return;
  }

  speechObj = new SpeechRecognitionClass();
  speechObj.lang = "es-ES";
  speechObj.continuous = false;
  speechObj.interimResults = false;

  btnStart.addEventListener("click", () => {
    try {
      speechObj.start();
      statusLog.innerHTML = `<span class="pulse-red"></span> Grabando voz... Habla ahora.`;
      btnStart.disabled = true;
    } catch (e) {
      console.error(e);
    }
  });

  speechObj.onend = () => {
    btnStart.disabled = false;
    if (statusLog.innerHTML.includes("Grabando")) {
      statusLog.innerHTML = "Micrófono cerrado. Haz clic en 'Grabar Voz' para intentarlo de nuevo.";
    }
  };

  speechObj.onerror = (e) => {
    statusLog.innerHTML = `Error del micrófono: ${e.error}.`;
    btnStart.disabled = false;
  };

  speechObj.onresult = (e) => {
    const transcript = e.results[0][0].transcript;
    txtArea.value = (txtArea.value ? txtArea.value + " " : "") + transcript;
    statusLog.innerHTML = "Texto dictado. Pulsa 'Procesar Texto' para aplicarlo.";
  };

  btnProc.addEventListener("click", () => {
    const text = txtArea.value.trim();
    if (!text) return;
    
    parseVoiceTextAndPopulate(text);
    txtArea.value = "";
    statusLog.innerHTML = "Convocatoria interpretada y cargada con éxito.";
  });
}

// 21. Parse dictated texts with RegEx filters
function parseVoiceTextAndPopulate(text) {
  const lower = text.toLowerCase();

  // Jornada Match
  const jMatches = lower.match(/jornada\s*(\d+)/i);
  if (jMatches) {
    document.getElementById("inp-jornada").value = jMatches[1];
  }

  // Team Categories Match
  const teamsList = [
    { key: "cadet s16", name: "Cadet S16" },
    { key: "juvenil", name: "Juvenil" },
    { key: "benjami s10", name: "Benjamí S10" },
    { key: "benjamí s10", name: "Benjamí S10" },
    { key: "aleví s11", name: "Aleví S11" },
    { key: "alevi s11", name: "Aleví S11" },
    { key: "aleví s12", name: "Aleví S12" },
    { key: "alevi s12", name: "Aleví S12" },
    { key: "infantil s14", name: "Infantil S14" },
    { key: "quarta catalana", name: "Quarta Catalana" }
  ];
  
  let detectedTeam = "";
  for (let team of teamsList) {
    if (lower.includes(team.key)) {
      detectedTeam = team.name;
      document.getElementById("inp-equipo").value = team.name;
      // trigger change event to sync Category, Staff, and reset players lists
      const event = new Event('change');
      document.getElementById("inp-equipo").dispatchEvent(event);
      break;
    }
  }

  // Rival Match
  const rMatches = text.match(/(?:contra|partido contra|rival|versus)\s+([a-zA-Z0-9\s]+?)(?:,|\ssábado|\sdomingo|\slunes|\smartes|\smiércoles|\sjueves|\sviernes|campo|llegada|equipación|$)/i);
  if (rMatches) {
    document.getElementById("inp-rival").value = rMatches[1].trim();
  }

  // Match Day
  const dMatches = text.match(/(sábado|domingo|lunes|martes|miércoles|jueves|viernes)\s*(\d{1,2}\s+de\s+[a-z]+)?/i);
  if (dMatches) {
    let day = dMatches[1];
    if (dMatches[2]) day += ", " + dMatches[2];
    const fullDateMatches = text.match(/(sábado|domingo|lunes|martes|miércoles|jueves|viernes)\s+\d{1,2}\s+de\s+[a-z]+(?:\s+de\s+\d{4})?/i);
    document.getElementById("inp-dia").value = fullDateMatches ? fullDateMatches[0] : day;
  }

  // Kickoff time
  const hMatches = text.match(/(?:a las|hora)\s+(\d{1,2}[:\.]\d{2})/i);
  if (hMatches) {
    const time = hMatches[1].replace(".", ":");
    document.getElementById("inp-hora").value = time;
    autoCalculateArrivalTime(time);
  }

  // Arrival time
  const llMatches = text.match(/(?:llegada a las|llegada|citar a las)\s+(\d{1,2}[:\.]\d{2})/i);
  if (llMatches) {
    document.getElementById("inp-llegada").value = llMatches[1].replace(".", ":");
  }

  // Campo Match
  const cMatches = text.match(/(?:campo|instalación|en el campo|en)\s+([a-zA-Z0-9\s]+?)(?:,|\sequipación|cuerpo|convocados|$)/i);
  if (cMatches && !cMatches[1].toLowerCase().includes("llegada") && !cMatches[1].toLowerCase().includes("camiseta")) {
    document.getElementById("inp-campo").value = cMatches[1].trim();
  }

  // Kit Check
  const eMatches = text.match(/(?:equipación|camiseta)\s+([a-zA-Z0-9\s,]+?)(?:,|\sconvocados|cuerpo|$)/i);
  if (eMatches) {
    const kit = eMatches[1].toLowerCase();
    const selectKit = document.getElementById("inp-equipacion");
    if (kit.includes("segunda") || kit.includes("2") || kit.includes("negra")) {
      selectKit.value = "2ª Equipación (Negra)";
    } else {
      selectKit.value = "1ª Equipación (Verde/Blanco)";
    }
  }

  // Parse Convocados list block
  const convBlock = text.match(/convocados\s+([^#]+?)(?:no convocados|cuerpo técnico|cuerpo|observaciones|$)/i);
  if (convBlock) {
    const names = convBlock[1].split(/,|\by\b|\bo\b/).map(n => n.trim()).filter(n => n.length > 2);
    const limit = (detectedTeam.toLowerCase().includes("benjam") || detectedTeam.toLowerCase().includes("alev")) ? 15 : 18;

    convocadosList = names.map(n => {
      let capName = n.split(/\s+/).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
      return { name: capName, pos: "Jugador" };
    });

    if (convocadosList.length > limit) {
      alert(`Se detectaron ${convocadosList.length} jugadores en el dictado. Se importaron los primeros ${limit}.`);
      convocadosList = convocadosList.slice(0, limit);
    }
    renderConvocadosList();
  }

  // Parse No Convocados block
  const noConvBlock = text.match(/no convocados\s+([^#]+?)(?:observaciones|cuerpo|$)/i);
  if (noConvBlock) {
    const items = noConvBlock[1].split(/,|\by\b/).map(n => n.trim()).filter(n => n.length > 2);
    
    noConvocadosList = items.map(item => {
      let name = item;
      let reason = "tecnica";

      if (item.includes("lesión") || item.includes("lesion")) {
        reason = "lesion";
        name = item.replace(/por lesión|por lesion|lesionada?o?/gi, "").trim();
      } else if (item.includes("sanción") || item.includes("sancion")) {
        reason = "sancion";
        name = item.replace(/por sanción|por sancion|sancionada?o?/gi, "").trim();
      } else {
        name = item.replace(/por decisión técnica|por decision tecnica|decision tecnica/gi, "").trim();
      }

      name = name.split(/\s+/).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
      return { name, pos: "Jugador", reason };
    });
    renderNoConvocadosList();
  }

  updateLivePreview();
}
