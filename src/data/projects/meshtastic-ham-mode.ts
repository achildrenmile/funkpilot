import type { HamProject } from '../../types/projects';

export const meshtasticHamMode: HamProject = {
  id: 'meshtastic-ham-mode',
  name: 'HAM-Modus aktivieren',
  category: 'mesh-lora',
  difficulty: 1,
  description: 'Meshtastic für lizenzierte Funkamateure: Mehr Sendeleistung, Rufzeichen-Anzeige und erweiterte Frequenzen.',
  hardware: 'esp32-lora',
  projectType: 'guide',

  components: [
    { name: 'LoRa-Board', quantity: 1, notes: 'T-Beam, Heltec, RAK etc.' },
    { name: 'Amateurfunklizenz', quantity: 1, notes: 'Gültige Lizenz erforderlich!' },
  ],
  estimatedCost: '25-60 EUR',

  code: `# HAM-Modus für Meshtastic

## Übersicht

Der **HAM-Modus** schaltet erweiterte Funktionen für lizenzierte
Funkamateure frei:

- Höhere Sendeleistung
- Rufzeichen-Anzeige (statt Node-ID)
- Verschlüsselung deaktivierbar
- Erweiterte Frequenzoptionen

**WICHTIG**: Nur für Inhaber einer gültigen Amateurfunklizenz!

---

## Vorteile HAM-Modus

### Mehr Sendeleistung

| Modus | Max. Leistung | Regelung |
|-------|--------------|----------|
| Standard (ISM) | 25 mW ERP | ETSI EN 300 220 |
| HAM 70cm | 25 W ERP | CEPT |
| HAM 23cm | 100 W ERP | National |

### Rufzeichen-Anzeige

- Statt "!abcd1234" → "OE8YML"
- Erfüllt Identifikationspflicht
- Professioneller Auftritt

### Keine Verschlüsselung

- Amateurfunk verbietet Verschlüsselung
- Klartext-Übertragung
- Transparenz für alle

---

## HAM-Modus aktivieren

### Methode 1: CLI (Empfohlen)

\`\`\`bash
# Lizenz-Nutzung aktivieren
meshtastic --set lora.override_duty_cycle true

# Rufzeichen als Node-Name setzen
meshtastic --set device.name "OE8YML"

# Sendeleistung erhöhen (in dBm)
# Vorsicht: Hardware-Limits beachten!
meshtastic --set lora.tx_power 27

# Verschlüsselung deaktivieren
meshtastic --ch-set psk none --ch-index 0
\`\`\`

### Methode 2: App

1. Einstellungen → LoRa
2. "Override Duty Cycle" aktivieren
3. TX Power erhöhen
4. Kanal → PSK auf "none"

### Methode 3: Web-Interface

1. Node im Browser öffnen (IP-Adresse)
2. Config → LoRa
3. Einstellungen anpassen

---

## Rechtliche Aspekte

### Was erlaubt ist

✅ Höhere Sendeleistung (bis 25W auf 70cm)
✅ Duty Cycle ignorieren (Dauerträger erlaubt)
✅ Unverschlüsselte Kommunikation
✅ Experimentelle Frequenzen

### Was erforderlich ist

⚠️ Gültige Amateurfunklizenz
⚠️ Rufzeichen-Identifikation
⚠️ Stationstagebuch (je nach Land)
⚠️ Klartext (keine Verschlüsselung)

### Was verboten bleibt

❌ Verschlüsselte Inhalte (auch mit Lizenz!)
❌ Kommerzielle Nutzung
❌ Weitergabe an Unlizenzierte
❌ Störungen verursachen

---

## Frequenzwahl

### ISM-Band (Standard)

\`\`\`
Frequenz: 868.0 - 868.6 MHz
Leistung: Max 25 mW ERP
Duty Cycle: 1%
Lizenz: Nicht erforderlich
\`\`\`

### 70cm Amateurfunkband

\`\`\`
Frequenz: 433.05 - 434.79 MHz (Region 1)
         430.0 - 440.0 MHz (allgemein)
Leistung: Max 25 W ERP (mit Lizenz)
Duty Cycle: Keiner
Lizenz: Erforderlich
\`\`\`

**Hinweis**: Für 70cm benötigst du 433 MHz Hardware!

### 23cm Amateurfunkband

\`\`\`
Frequenz: 1240 - 1300 MHz
Leistung: Bis 100 W ERP
Lizenz: Erforderlich
Hardware: Speziell (selten für Meshtastic)
\`\`\`

---

## Konfiguration für 70cm (433 MHz)

Wenn du ein 433 MHz Board hast:

\`\`\`bash
# Region für 433 MHz
meshtastic --set lora.region EU_433

# Sendeleistung (mit Lizenz)
meshtastic --set lora.tx_power 20

# Duty Cycle überschreiben
meshtastic --set lora.override_duty_cycle true

# Rufzeichen
meshtastic --set device.name "OE8YML"

# Verschlüsselung aus
meshtastic --ch-set psk none --ch-index 0
\`\`\`

---

## TX Power Einstellungen

### Typische Werte

| Board | Max TX Power | Empfehlung |
|-------|-------------|------------|
| Heltec V3 | 22 dBm | 20 dBm |
| T-Beam | 22 dBm | 20 dBm |
| RAK 4631 | 22 dBm | 20 dBm |
| Station G2 | 30 dBm | 27 dBm |

### Power in Watt

| dBm | mW | W |
|-----|-----|---|
| 10 | 10 | 0.01 |
| 14 | 25 | 0.025 |
| 20 | 100 | 0.1 |
| 27 | 500 | 0.5 |
| 30 | 1000 | 1.0 |

**WARNUNG**: Höhere Leistung = mehr Stromverbrauch, mehr Wärme!

---

## Rufzeichen-Identifikation

### Automatisch

Mit \`device.name = "OE8YML"\` wird dein Rufzeichen
bei jeder Nachricht mitgesendet.

### Manuell

Regelmäßig Rufzeichen senden:
- Alle 10 Minuten empfohlen
- Bei jedem QSO-Beginn/Ende

### Portable-Kennung

\`\`\`bash
# Portable-Betrieb
meshtastic --set device.name "OE8YML/P"

# Mobile
meshtastic --set device.name "OE8YML/M"
\`\`\`

---

## MeshCom: Native HAM-Unterstützung

MeshCom (vom ÖVSV) ist speziell für Funkamateure:

- Nutzt 70cm Band (433 MHz)
- Automatische APRS-Integration
- ÖVSV-Gateway-Infrastruktur
- Rufzeichen nativ unterstützt

**Siehe**: MeshCom Getting Started Guide

---

## Gemischter Betrieb

### Lizenzierte + Unlizenzierte

In einem Mesh mit gemischten Nutzern:

- **ISM-Band bleiben** (868 MHz)
- **Verschlüsselung AUS** für alle
- Lizenzierte können mit höherer Leistung senden
- Rufzeichen für alle empfohlen (auch ohne Lizenz legal)

### Separates HAM-Netzwerk

Für reinen Amateurfunk-Betrieb:

- 433 MHz Hardware
- Eigener Kanal mit PSK=none
- Nur Lizenzierte Teilnehmer
- Volle Leistung nutzbar

---

## Zusammenfassung

### HAM-Modus Checkliste

- [ ] Gültige Amateurfunklizenz
- [ ] Rufzeichen als device.name gesetzt
- [ ] override_duty_cycle aktiviert
- [ ] tx_power nach Bedarf erhöht
- [ ] Verschlüsselung deaktiviert (psk none)
- [ ] Richtige Region gewählt (EU_868 oder EU_433)

### Quick Setup (HAM auf 868 MHz)

\`\`\`bash
meshtastic --set device.name "DEINRUFZEICHEN"
meshtastic --set lora.override_duty_cycle true
meshtastic --set lora.tx_power 20
meshtastic --ch-set psk none --ch-index 0
\`\`\`

### Quick Setup (HAM auf 433 MHz)

\`\`\`bash
meshtastic --set device.name "DEINRUFZEICHEN"
meshtastic --set lora.region EU_433
meshtastic --set lora.override_duty_cycle true
meshtastic --set lora.tx_power 20
meshtastic --ch-set psk none --ch-index 0
\`\`\`

---

## FAQ

**Kann ich verschlüsselt senden?**
Nein, im Amateurfunk ist Verschlüsselung verboten.

**Brauche ich spezielle Hardware?**
Für 433 MHz ja, für 868 MHz dieselbe wie ISM.

**Können Unlizenzierte mitlesen?**
Ja, ohne Verschlüsselung kann jeder mitlesen.

**Ist Meshtastic legal für HAM?**
Ja, solange Identifikation und Klartext eingehalten werden.
`,
  codeLanguage: 'markdown',
  codeFileName: 'HAM_MODE_GUIDE.md',

  externalLinks: [
    { title: 'Meshtastic HAM Docs', url: 'https://meshtastic.org/docs/configuration/radio/lora/#ham-mode' },
    { title: 'IARU Region 1 Bandplan', url: 'https://www.iaru-r1.org/reference/band-plans/' },
    { title: 'ÖVSV Bandplan', url: 'https://www.oevsv.at/funkbetrieb/bandplaene/' },
  ],

  customizationSuggestions: [
    'Wie viel Sendeleistung ist erlaubt?',
    'Muss ich die Verschlüsselung deaktivieren?',
    'Kann ich auf 433 MHz senden?',
    'Was ist der Unterschied zu MeshCom?',
    'Wie identifiziere ich mich korrekt?',
  ],

  hardwareOptions: [
    {
      name: 'LILYGO T-Beam v1.2 (868MHz)',
      price: '~35€',
      features: ['ISM + HAM möglich', 'GPS', 'Höhere Leistung mit Lizenz'],
      recommended: true,
    },
    {
      name: 'LILYGO T-Beam v1.2 (433MHz)',
      price: '~35€',
      features: ['Für 70cm Band', 'GPS', 'Volle HAM-Leistung'],
    },
    {
      name: 'Station G2 (B&Q)',
      price: '~100€',
      features: ['Bis 1W Ausgang', 'Für High-Power HAM'],
    },
  ],
};
