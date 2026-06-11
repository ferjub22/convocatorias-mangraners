#!/usr/bin/env python3
import os
import re
import sys
import json
import subprocess
import argparse

# Paths
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
CALENDAR_JS_PATH = os.path.join(BASE_DIR, "calendar_data.js")
PLAYERS_JS_PATH = os.path.join(BASE_DIR, "players_data.js")
TEMPLATE_PATH = os.path.join(BASE_DIR, "plantilla_folio.html")
OUTPUT_DIR = os.path.dirname(BASE_DIR)  # Save PDF in CLASE 4 folder

# Mappings
team_to_cat = {
    "Benjamí S10": "PRIMERA DIVISIÓ BENJAMÍ S10 (GRUP 13)",
    "Aleví S11": "SEGONA DIVISIÓ ALEVÍ S11 (GRUP 18)",
    "Aleví S12": "SEGONA DIVISIÓ ALEVÍ S12 (GRUP 22)",
    "Infantil S14": "INFANTIL SEGONA DIVISIÓ S14 (GRUP 28)",
    "Cadet S16": "Cadet Segona Divisió S16 - Grup 24",
    "Juvenil": "JUVENIL SEGONA DIVISIÓ (GRUP 46)",
    "Quarta Catalana": "QUARTA CATALANA (GRUP 29)"
}

team_to_staff = {
    "Benjamí S10": "Felipe Filartiga y Joel Benitez",
    "Aleví S11": "Felipe Filartiga y Joel Benitez",
    "Aleví S12": "Joel Benitez",
    "Infantil S14": "Federico Ferreira",
    "Cadet S16": "Federico Ferreira y Joel Benitez",
    "Juvenil": "Aureliano Torres y Buena Ferreira",
    "Quarta Catalana": "Aureliano Torres y Buena Ferreira"
}

def load_js_data(filepath, var_name):
    """Loads a JSON-like object declared as a JS const/var."""
    if not os.path.exists(filepath):
        print(f"Error: No se encontró el archivo de datos {filepath}")
        sys.exit(1)
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # regex to strip variable declaration const VAR = { ... };
    match = re.search(rf'const\s+{var_name}\s*=\s*(.*);', content, re.DOTALL)
    if not match:
        match = re.search(rf'{var_name}\s*=\s*(.*)', content, re.DOTALL)
        
    if match:
        json_str = match.group(1).strip()
        if json_str.endswith(';'):
            json_str = json_str[:-1]
        try:
            return json.loads(json_str)
        except json.JSONDecodeError as e:
            # Fallback if there are trailing commas or unquoted keys (though our data files are clean JSON)
            # Let's try fixing common trailing commas
            fixed_str = re.sub(r',\s*([\]}])', r'\1', json_str)
            return json.loads(fixed_str)
            
    raise ValueError(f"No se pudo cargar la variable {var_name} de {filepath}")

def calculate_arrival_time(kickoff_str):
    """Calculates arrival time as kickoff minus 1 hour."""
    if not kickoff_str or kickoff_str in ["-", "A confirmar"]:
        return "A confirmar"
    match = re.search(r'(\d{1,2}):(\d{2})', kickoff_str)
    if not match:
        return kickoff_str
    hr = int(match.group(1))
    min_val = int(match.group(2))
    hr = hr - 1
    if hr < 0:
        hr = 23
    return f"{hr:02d}:{min_val:02d} h"

def format_convocados_rows(players):
    """Generates player card HTML blocks for Convocados."""
    rows_html = ""
    for idx, p in enumerate(players):
        num_str = f"{idx + 1:02d}"
        rows_html += f"""
        <div class="folio-player-card">
          <span class="folio-player-num">{num_str}</span>
          <div class="folio-player-details">
            <span class="folio-player-name">{p['name']}</span>
            <span class="folio-player-pos">{p['pos']}</span>
          </div>
        </div>
        """
    return rows_html

def format_no_convocados_rows(players):
    """Generates player status list HTML blocks for No Convocados."""
    rows_html = ""
    for p in players:
        reason = p.get('reason', 'tecnica')
        if reason == 'lesion':
            badge_class = "folio-badge-injury"
            badge_text = "Lesión"
            desc_text = "No convocado por situación física o lesión. Pendiente de evolución."
        elif reason == 'sancion':
            badge_class = "folio-badge-suspension"
            badge_text = "Sanción"
            desc_text = "No convocado por sanción o cumplimiento disciplinario."
        else:
            badge_class = "folio-badge-dt"
            badge_text = "Decisión Técnica"
            desc_text = "No convocado por decisión técnica dentro de la planificación deportiva semanal."
            
        rows_html += f"""
        <div class="folio-no-conv-row">
          <span class="folio-no-conv-badge {badge_class}">{badge_text}</span>
          <span class="folio-no-conv-player">{p['name']}</span>
          <span class="folio-no-conv-desc">{desc_text}</span>
        </div>
        """
    return rows_html

def select_players_default(roster, limit):
    """Splits a roster list into convocados (up to limit) and no_convocados (rest)."""
    convocados = roster[:limit]
    no_convocados = []
    
    # Assign some random reasons for no convocados to make it look realistic
    reasons = ['tecnica', 'lesion', 'sancion']
    for idx, p in enumerate(roster[limit:]):
        reason = reasons[idx % len(reasons)]
        no_convocados.append({
            "name": p["name"],
            "pos": p["pos"],
            "reason": reason
        })
    return convocados, no_convocados

def main():
    parser = argparse.ArgumentParser(description="Generador de Convocatorias en PDF - CD Mangraners")
    parser.add_argument("--equipo", type=str, help="Nombre de la categoría (ej: 'Cadet S16')")
    parser.add_argument("--jornada", type=str, help="Número de la jornada (ej: '1')")
    parser.add_argument("--convocados", type=str, help="Nombres de convocados separados por comas")
    parser.add_argument("--no-convocados", type=str, help="Nombres y motivos de no convocados (ej: 'Nombre:lesion,Nombre2:tecnica')")
    parser.add_argument("--observaciones", type=str, help="Texto de observaciones adicionales")
    parser.add_argument("--equipacion", type=str, default="1ª Equipación (Camiseta verde, pantalón blanco y medias verdes)", help="Equipación oficial")
    
    args = parser.parse_args()

    # Load databases
    print("Cargando bases de datos locales...")
    calendars_db = load_js_data(CALENDAR_JS_PATH, "CD_MANGRANERS_CALENDARS")
    players_db = load_js_data(PLAYERS_JS_PATH, "CD_MANGRANERS_PLAYERS")
    
    teams = list(players_db.keys())
    
    selected_team = args.equipo
    selected_jornada = args.jornada
    
    # Interactive mode if arguments are missing
    if not selected_team or not selected_jornada:
        print("\n--- MÓDULO INTERACTIVO DE CONVOCATORIAS ---")
        print("Selecciona el equipo:")
        for idx, t in enumerate(teams):
            print(f"  {idx + 1}. {t}")
        try:
            team_choice = int(input("Número del equipo: ").strip())
            selected_team = teams[team_choice - 1]
        except (ValueError, IndexError):
            print("Selección no válida.")
            sys.exit(1)
            
        # Get matchdays
        team_calendar = calendars_db.get(selected_team, {})
        matchdays = sorted(list(team_calendar.keys()), key=lambda x: int(x))
        
        print(f"\nSelecciona la jornada (1 al {len(matchdays)}):")
        for m in matchdays[:5]: # Show first 5 matches for guide
            match_data = team_calendar[m]
            print(f"  Jornada {m}: vs {match_data['rival']} ({match_data['condicion']})")
        if len(matchdays) > 5:
            print("  ...")
            
        selected_jornada = input(f"Número de jornada [1-{len(matchdays)}]: ").strip()
        if selected_jornada not in team_calendar:
            print("Jornada fuera de rango.")
            sys.exit(1)
            
    # Resolve calendar data
    team_calendar = calendars_db.get(selected_team, {})
    match_data = team_calendar.get(selected_jornada)
    if not match_data:
        print(f"Error: No hay datos de partido en el calendario para {selected_team} - Jornada {selected_jornada}")
        sys.exit(1)
        
    rival = match_data.get("rival", "[Rival]")
    dia = match_data.get("dia", "[Día]")
    hora = match_data.get("hora", "A confirmar")
    campo = match_data.get("campo", "[Campo de juego]")
    condicion = match_data.get("condicion", "Visitante")
    if condicion == "Fuera":
        condicion = "Visitante"
    llegada = calculate_arrival_time(hora)
    
    # Staff & Category
    categoria = team_to_cat.get(selected_team, "[Categoría]")
    cuerpo = team_to_staff.get(selected_team, "[Cuerpo Técnico]")
    
    # Limit
    is_benj_or_alev = "benjam" in selected_team.lower() or "alev" in selected_team.lower()
    limit = 15 if is_benj_or_alev else 18
    
    # Resolve Players lists
    roster = players_db.get(selected_team, [])
    convocados = []
    no_convocados = []
    
    if args.convocados:
        names = [n.strip() for n in args.convocados.split(",")]
        for n in names:
            # find in roster or add custom
            matched = next((p for p in roster if p["name"].lower() == n.lower()), None)
            if matched:
                convocados.append(matched)
            else:
                convocados.append({"name": n, "pos": "Jugador"})
                
        # Resolve no convocados
        if args.no_convocados:
            noconv_items = [n.strip() for n in args.no_convocados.split(",")]
            for item in noconv_items:
                reason = 'tecnica'
                name = item
                if ':' in item:
                    parts = item.split(':')
                    name = parts[0].strip()
                    reason = parts[1].strip()
                matched = next((p for p in roster if p["name"].lower() == name.lower()), None)
                pos = matched["pos"] if matched else "Jugador"
                no_convocados.append({"name": name, "pos": pos, "reason": reason})
        else:
            # Roster minus convocados
            for p in roster:
                if not any(c["name"].lower() == p["name"].lower() for c in convocados):
                    no_convocados.append({"name": p["name"], "pos": p["pos"], "reason": "tecnica"})
    else:
        # Default split from roster
        convocados, no_convocados = select_players_default(roster, limit)
        
    # Observations
    obs = args.observaciones
    if not obs:
        if not args.equipo: # If interactive mode
            obs_input = input("\n¿Añadir observaciones personalizadas? (Presiona ENTER para usar por defecto): ").strip()
            obs = obs_input if obs_input else f"Presentarse con la indumentaria oficial de paseo del club 1 hora antes del partido ({llegada})."
        else:
            obs = f"Presentarse con la indumentaria oficial de paseo del club 1 hora antes del partido ({llegada})."
            
    # Load template
    if not os.path.exists(TEMPLATE_PATH):
        print(f"Error: No se encontró la plantilla de folio HTML en {TEMPLATE_PATH}")
        sys.exit(1)
        
    with open(TEMPLATE_PATH, 'r', encoding='utf-8') as f:
        template_content = f.read()
        
    # Replace placeholder tags
    signature_label = f"{cuerpo.split(' y ')[0].split(',')[0]} (DT)"
    condicion_class = "fuera" if (condicion.lower() == "fuera" or condicion.lower() == "visitante") else ""
    show_obs_style = "display: block;" if obs else "display: none;"
    show_no_conv_style = "display: block;" if no_convocados else "display: none;"
    
    replaced = template_content \
        .replace("{{Jornada}}", selected_jornada) \
        .replace("{{Equipo}}", selected_team) \
        .replace("{{Categoria}}", categoria) \
        .replace("{{Rival}}", rival) \
        .replace("{{FechaHoraSplitDia}}", dia) \
        .replace("{{FechaHoraSplitHora}}", hora) \
        .replace("{{HoraLlegada}}", llegada) \
        .replace("{{Campo}}", campo) \
        .replace("{{Condicion}}", condicion) \
        .replace("{{CondicionClass}}", condicion_class) \
        .replace("{{Equipacion}}", args.equipacion) \
        .replace("{{CuerpoTecnico}}", cuerpo) \
        .replace("{{ConvocadosRows}}", format_convocados_rows(convocados)) \
        .replace("{{ShowObservations}}", show_obs_style) \
        .replace("{{Observaciones}}", obs) \
        .replace("{{ShowNoConvocados}}", show_no_conv_style) \
        .replace("{{NoConvocadosRows}}", format_no_convocados_rows(no_convocados)) \
        .replace("{{FirmaResponsable}}", signature_label)

    # Force the PDF compilation stylesheet rule by swapping the class
    replaced = replaced.replace('class="folio-container"', 'class="folio-container pdf-mode"')
    replaced = replaced.replace('class="folio-container preview-mode"', 'class="folio-container pdf-mode"')
    
    # Inject page layout rules for headless printing
    print_style = """
    <style>
      @page {
        size: A4 portrait;
        margin: 0 !important;
      }
      html, body {
        width: 210mm !important;
        height: 297mm !important;
        margin: 0 !important;
        padding: 0 !important;
        background-color: #ffffff !important;
        overflow: hidden !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      .pdf-mode.folio-container {
        width: 210mm !important;
        height: 297mm !important;
        box-sizing: border-box !important;
        overflow: hidden !important;
        page-break-inside: avoid !important;
        page-break-after: avoid !important;
      }
    </style>
    </head>
    """
    replaced = replaced.replace("</head>", print_style)
    
    # Save intermediate HTML temporarily
    temp_html_filename = f"temp_convocatoria_{selected_team}_{selected_jornada}.html".replace(" ", "_")
    temp_html_path = os.path.join(BASE_DIR, temp_html_filename)
    
    with open(temp_html_path, 'w', encoding='utf-8') as f:
        f.write(replaced)
        
    # Target PDF File
    pdf_filename = f"CONVOCATORIA_{selected_team}_Jornada_{selected_jornada}.pdf".replace(" ", "_")
    pdf_output_path = os.path.join(OUTPUT_DIR, pdf_filename)
    
    print(f"\nCompilando convocatoria a PDF...")
    chrome_path = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
    
    if not os.path.exists(chrome_path):
        print(f"Error: Google Chrome no se encuentra en {chrome_path}. No se puede compilar a PDF.")
        print(f"Se ha conservado el archivo HTML temporal para que puedas imprimirlo manualmente en: {temp_html_path}")
        sys.exit(1)
        
    cmd = [
        chrome_path,
        "--headless",
        "--disable-gpu",
        "--no-sandbox",
        "--no-pdf-header-footer",
        f"--print-to-pdf={pdf_output_path}",
        temp_html_path
    ]
    
    res = subprocess.run(cmd, capture_output=True, text=True)
    if res.returncode == 0:
        print("\n" + "="*50)
        print("¡CONVOCATORIA GENERADA CON ÉXITO!")
        print(f"Ubicación del PDF: {pdf_output_path}")
        print("="*50)
        os.remove(temp_html_path)
    else:
        print(f"Error al compilar el PDF con Google Chrome.")
        print(f"Stdout: {res.stdout}")
        print(f"Stderr: {res.stderr}")
        print(f"Se ha conservado el archivo HTML temporal para depurar: {temp_html_path}")

if __name__ == "__main__":
    main()
