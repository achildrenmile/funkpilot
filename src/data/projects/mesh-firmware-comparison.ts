import type { HamProject } from '../../types/projects';

export const meshFirmwareComparison: HamProject = {
  id: 'mesh-firmware-comparison',
  name: 'Meshtastic vs MeshCore vs MeshCom',
  category: 'mesh-lora',
  difficulty: 1,
  description: 'Detaillierter Vergleich der drei wichtigsten LoRa-Mesh-Firmwares. Finde die richtige für deine Anwendung.',
  hardware: 'esp32-lora',
  projectType: 'guide',

  components: [
    { name: 'LoRa-fähiges Board', quantity: 1, notes: 'T-Beam, Heltec, RAK, etc.' },
  ],
  estimatedCost: '25-60 EUR',

  code: `# Meshtastic vs MeshCore vs MeshCom

## Übersicht

Drei Firmware-Optionen für LoRa-Mesh-Kommunikation:

| Aspekt | Meshtastic | MeshCore | MeshCom |
|--------|------------|----------|---------|
| **Fokus** | Allgemein | Power-User | Funkamateure |
| **Frequenz** | 868 MHz (EU) | 868 MHz (EU) | 433 MHz (70cm) |
| **Lizenz nötig** | Nein (ISM) | Nein (ISM) | Ja (Ham) |
| **Community** | Sehr groß | Wachsend | OE/DL fokussiert |

---

## Meshtastic

### Was ist Meshtastic?

Das **Original** und **meistverbreitete** LoRa-Mesh-Projekt.
Open Source, große Community, viele Geräte unterstützt.

### Vorteile

✅ **Größte Community** - Viele Nutzer, viel Support
✅ **Beste Dokumentation** - Umfangreiche Docs
✅ **Stabile Firmware** - Gut getestet
✅ **Viele Apps** - Android, iOS, Web, CLI
✅ **Keine Lizenz** - Läuft auf ISM 868 MHz
✅ **Verschlüsselung** - AES256 End-to-End
✅ **MQTT-Integration** - Internet-Bridge möglich

### Nachteile

❌ Konservativere Entwicklung (langsamer neue Features)
❌ Keine dedizierten Repeater-Rollen (bis vor kurzem)
❌ Manchmal überfüllte Kanäle in Städten

### Ideal für

- Einsteiger
- Outdoor/Wandern
- Off-Grid Kommunikation
- Notfunk ohne Lizenz
- Internationale Nutzung

### Links

- Web: https://meshtastic.org
- Flasher: https://flasher.meshtastic.org
- Discord: discord.gg/meshtastic

---

## MeshCore

### Was ist MeshCore?

Ein **leistungsstarker Fork** von Meshtastic mit erweiterten Features.
Entwickelt von Scott Powell (Ripple).

### Vorteile

✅ **Rooms** - Bessere Chatroom-Verwaltung
✅ **Repeater-Modus** - Dedizierte Relais-Funktion
✅ **Client-Management** - Sehen wer verbunden ist
✅ **Schnellere Updates** - Experimentelle Features früher
✅ **Erweiterte Routing-Optionen**
✅ **Companion App** - Eigenständige Android-App

### Nachteile

❌ Kleinere Community
❌ Weniger Dokumentation
❌ Experimenteller (mögliche Bugs)
❌ Nicht 100% Meshtastic-kompatibel

### Ideal für

- Power-User
- Netzwerk-Betreiber
- Wer erweiterte Features braucht
- Experimentierfreudige

### Links

- GitHub: github.com/ripplebiz/MeshCore
- Flasher: flasher.meshcore.co
- YouTube: @RippleWireless

---

## MeshCom

### Was ist MeshCom?

**Österreichisches Projekt** vom ÖVSV für Funkamateure.
Nutzt das 70cm Band (433 MHz) statt ISM.

### Vorteile

✅ **Mehr Sendeleistung** - Bis 500 mW (mit Lizenz)
✅ **70cm Band** - Weniger überlaufen als ISM
✅ **Lokale Community** - Aktiv in OE/DL
✅ **APRS-Integration** - Verbindung zum APRS-Netz
✅ **Ham-fokussierte Features**
✅ **Gateways vom ÖVSV** - Infrastruktur vorhanden

### Nachteile

❌ **Amateurfunklizenz erforderlich**
❌ Kleinere internationale Community
❌ Andere Frequenz (433 MHz Geräte nötig)
❌ Nicht kompatibel mit Meshtastic/MeshCore

### Ideal für

- Lizenzierte Funkamateure in OE/DL
- Wer mehr Leistung braucht
- APRS-Integration gewünscht
- Lokale OE/DL Community

### Links

- Wiki: wiki.oevsv.at/wiki/MeshCom
- Firmware: icssw.org/meshcom
- Karte: map.meshcom.at

---

## Entscheidungshilfe

### Habe ich eine Amateurfunklizenz?

**JA** → MeshCom (OE/DL) oder Meshtastic/MeshCore möglich
**NEIN** → Meshtastic oder MeshCore

### Wie experimentierfreudig bin ich?

**Stabil bevorzugt** → Meshtastic
**Neue Features wichtig** → MeshCore
**Ham-Community OE/DL** → MeshCom

### Mit wem will ich kommunizieren?

**Internationale Community** → Meshtastic (größte Verbreitung)
**Lokale OE/DL Funkamateure** → MeshCom
**Eigenes Netzwerk** → MeshCore oder Meshtastic

### Brauche ich mehr Reichweite/Leistung?

**Ja, und ich habe Lizenz** → MeshCom (500 mW möglich)
**Ja, ohne Lizenz** → Bessere Antenne, höherer Standort

---

## Kompatibilität

### Können verschiedene Firmwares kommunizieren?

| Von/Nach | Meshtastic | MeshCore | MeshCom |
|----------|------------|----------|---------|
| **Meshtastic** | ✅ Ja | ⚠️ Teilweise | ❌ Nein |
| **MeshCore** | ⚠️ Teilweise | ✅ Ja | ❌ Nein |
| **MeshCom** | ❌ Nein | ❌ Nein | ✅ Ja |

**Hinweis**: Meshtastic und MeshCore können im Basis-Modus kommunizieren,
erweiterte Features funktionieren nur innerhalb der gleichen Firmware.

MeshCom ist komplett inkompatibel (andere Frequenz, anderes Protokoll).

---

## Hardware-Anforderungen

Alle drei Firmwares unterstützen ähnliche Hardware:

| Hardware | Meshtastic | MeshCore | MeshCom |
|----------|------------|----------|---------|
| T-Beam | ✅ | ✅ | ✅ |
| T-Deck | ✅ | ✅ | ⚠️ |
| Heltec V3 | ✅ | ✅ | ✅ |
| RAK WisBlock | ✅ | ✅ | ✅ |
| Station G2 | ✅ | ✅ | ❓ |

**Wichtig für MeshCom**: 433 MHz Version des Boards nötig!

---

## Firmware wechseln

### Von Meshtastic zu MeshCore

1. Web-Flasher von MeshCore öffnen
2. Board anschließen
3. MeshCore flashen
4. Neu konfigurieren (Einstellungen gehen verloren!)

### Von Meshtastic zu MeshCom

1. Board muss 433 MHz Version sein!
2. MeshCom Firmware herunterladen
3. Mit ESPTool oder MeshCom Flasher flashen
4. Komplett neu konfigurieren

### Zurück zu Meshtastic

1. Meshtastic Web-Flasher
2. "Full Erase" vor dem Flashen empfohlen
3. Neu konfigurieren

---

## Empfehlung

### Für die meisten Nutzer: **Meshtastic**

- Größte Community
- Beste Dokumentation
- Stabilste Firmware
- Funktioniert international

### Für Power-User: **MeshCore**

- Erweiterte Features
- Bessere Repeater-Unterstützung
- Aktive Entwicklung

### Für OE/DL Funkamateure: **MeshCom**

- Lokale Community
- Mehr Sendeleistung
- APRS-Integration
- Infrastruktur vom ÖVSV

---

## Fazit

Es gibt keine "beste" Firmware - nur die richtige für deine Situation:

1. **Anfänger ohne Lizenz** → Meshtastic
2. **Experimentierfreudige** → MeshCore
3. **Lizenzierte in OE/DL** → MeshCom oder Meshtastic
4. **Internationale Nutzung** → Meshtastic
5. **Eigenes Netzwerk betreiben** → MeshCore

Probiere einfach aus! Die Firmware kann jederzeit gewechselt werden.
`,
  codeLanguage: 'markdown',
  codeFileName: 'FIRMWARE_COMPARISON.md',

  externalLinks: [
    { title: 'Meshtastic', url: 'https://meshtastic.org/' },
    { title: 'MeshCore', url: 'https://github.com/ripplebiz/MeshCore' },
    { title: 'MeshCom (ÖVSV)', url: 'https://wiki.oevsv.at/wiki/MeshCom' },
  ],

  customizationSuggestions: [
    'Welche Firmware für meine Situation?',
    'Kann ich zwischen Firmwares wechseln?',
    'Sind Meshtastic und MeshCore kompatibel?',
    'Brauche ich eine Amateurfunklizenz?',
    'Welche Hardware für welche Firmware?',
  ],

  hardwareOptions: [
    {
      name: 'LILYGO T-Beam v1.2 (868MHz)',
      price: '~35€',
      features: ['Meshtastic & MeshCore', 'GPS', 'Sehr beliebt'],
      recommended: true,
    },
    {
      name: 'LILYGO T-Beam v1.2 (433MHz)',
      price: '~35€',
      features: ['MeshCom (70cm)', 'GPS', 'Für Funkamateure'],
    },
    {
      name: 'Heltec LoRa V3 (868MHz)',
      price: '~25€',
      features: ['Alle Firmwares', 'Günstig', 'Kompakt'],
    },
  ],
};
