import type { HamProject } from '../../types/projects';

export const meshNetworkPlanning: HamProject = {
  id: 'mesh-network-planning',
  name: 'Mesh-Netzwerk planen',
  category: 'mesh-lora',
  difficulty: 2,
  description: 'Strategische Planung eines LoRa-Mesh-Netzwerks. Standorte, Reichweiten, Redundanz und Skalierung.',
  hardware: 'esp32-lora',
  projectType: 'guide',

  components: [
    { name: 'LoRa-Nodes', quantity: 3, notes: 'Minimum für Mesh' },
    { name: 'Repeater/Router', quantity: 1, notes: 'Für erweiterte Reichweite' },
    { name: 'Gateway (optional)', quantity: 1, notes: 'Für Internet-Anbindung' },
  ],
  estimatedCost: '100-300 EUR',

  code: `# Mesh-Netzwerk planen

## Grundlagen

Ein Mesh-Netzwerk besteht aus Nodes die Nachrichten weiterleiten.
Gute Planung ist entscheidend für Reichweite und Zuverlässigkeit.

---

## Netzwerk-Topologien

### Stern (Hub & Spoke)

\`\`\`
        [Client]
            │
    [Client]─┼─[Client]
            │
       [Gateway]
            │
    [Client]─┼─[Client]
            │
        [Client]
\`\`\`

**Vorteile**: Einfach, ein Gateway reicht
**Nachteile**: Single Point of Failure

### Linie (Linear)

\`\`\`
[Client]──[Repeater]──[Repeater]──[Gateway]
\`\`\`

**Vorteile**: Große Strecken überbrücken
**Nachteile**: Viele Hops, hohe Latenz

### Mesh (Vermascht)

\`\`\`
    [Client]────[Repeater]────[Client]
        │           │             │
        │           │             │
  [Repeater]────[Gateway]────[Repeater]
        │           │             │
        │           │             │
    [Client]────[Repeater]────[Client]
\`\`\`

**Vorteile**: Redundanz, mehrere Pfade
**Nachteile**: Mehr Nodes nötig

---

## Standort-Auswahl

### Ideale Repeater-Standorte

| Faktor | Wichtigkeit | Beschreibung |
|--------|-------------|--------------|
| **Höhe** | ⭐⭐⭐⭐⭐ | Je höher, desto besser |
| **Sichtverbindung** | ⭐⭐⭐⭐⭐ | Freie Sicht zu anderen Nodes |
| **Stromversorgung** | ⭐⭐⭐⭐ | Netzstrom oder Solar |
| **Zugang** | ⭐⭐⭐ | Für Wartung erreichbar |
| **Genehmigung** | ⭐⭐⭐ | Eigentümer fragen |

### Standort-Typen

1. **Berggipfel/Aussichtspunkt**
   - Beste Reichweite (10-50+ km)
   - Solar nötig, schwer erreichbar

2. **Hochhaus/Dach**
   - Gute Reichweite (5-20 km)
   - Strom vorhanden, Genehmigung nötig

3. **Funkturm/Mast**
   - Sehr gute Reichweite
   - Oft Strom, Genehmigung nötig

4. **Fensterbank/Balkon**
   - Begrenzte Reichweite (1-5 km)
   - Einfach, Strom vorhanden

---

## Reichweiten-Schätzung

### Fresnel-Zone

Für optimale Übertragung muss die erste Fresnel-Zone frei sein:

\`\`\`
Radius (m) = 17.3 × √(d / f)

d = Distanz (km)
f = Frequenz (GHz) = 0.868
\`\`\`

**Beispiel 10 km bei 868 MHz:**
Radius = 17.3 × √(10 / 0.868) = 58.7 m

→ Keine Hindernisse höher als 60m in der Mitte!

### Typische Reichweiten

| Umgebung | Reichweite | Bedingungen |
|----------|------------|-------------|
| Stadt | 1-3 km | Gebäude, Reflexionen |
| Vorstadt | 3-8 km | Teilweise frei |
| Land | 5-15 km | Wenig Hindernisse |
| Berg zu Berg | 20-100+ km | Freie Sicht |

### Link-Budget berechnen

\`\`\`
Empfangene Leistung = TX Power + TX Antenna - Pfadverlust + RX Antenna
Minimum für LoRa SF10: -134 dBm (theoretisch)
Praktisch: -120 dBm für zuverlässige Verbindung

Pfadverlust (Freifeld):
L = 20×log₁₀(d) + 20×log₁₀(f) + 32.44
  = 20×log₁₀(10km) + 20×log₁₀(868MHz) + 32.44
  = 20 + 58.8 + 32.44 = 111.2 dB

Beispiel:
TX = 14 dBm, TX Ant = 3 dBi, RX Ant = 3 dBi
14 + 3 - 111 + 3 = -91 dBm (OK!)
\`\`\`

---

## Netzwerk-Design

### Schritt 1: Anforderungen definieren

- **Abdeckungsgebiet**: Welche Fläche?
- **Nutzeranzahl**: Wie viele Clients?
- **Zuverlässigkeit**: Redundanz nötig?
- **Internet**: Gateway gewünscht?

### Schritt 2: Karte erstellen

1. OpenStreetMap oder Google Maps öffnen
2. Gewünschtes Gebiet markieren
3. Potenzielle Standorte einzeichnen
4. Sichtlinien prüfen (Terrain)

**Tools:**
- [HeyWhatsThat](https://www.heywhatsthat.com/) - Sichtbarkeitsanalyse
- [Radio Mobile](https://www.ve2dbe.com/rmonline.html) - Funkausbreitung
- [Google Earth](https://earth.google.com/) - 3D Terrain

### Schritt 3: Nodes platzieren

**Regel 1**: Jeder Client sollte mindestens 2 Nodes sehen
**Regel 2**: Repeater an höchsten Punkten
**Regel 3**: Gateway zentral oder gut erreichbar

### Schritt 4: Hop Limit festlegen

| Netzwerkgröße | Empfohlenes Hop Limit |
|---------------|----------------------|
| Klein (< 5 Nodes) | 3 |
| Mittel (5-15 Nodes) | 4-5 |
| Groß (> 15 Nodes) | 5-7 |

**Achtung**: Zu hohes Hop Limit = Netzwerk-Überlastung!

---

## Redundanz planen

### Single Point of Failure vermeiden

\`\`\`
SCHLECHT:                    GUT:
[A]──[B]──[C]               [A]──[B]──[C]
                                  ╲  ╱
                                   [D]
\`\`\`

### Backbone vs Edge

- **Backbone**: Repeater untereinander verbunden
- **Edge**: Clients am Rand des Netzwerks

\`\`\`
              ┌─────Backbone─────┐
              │                  │
[Client]──[Repeater]──[Gateway]──[Repeater]──[Client]
    │                                │
[Client]                        [Client]
\`\`\`

---

## Skalierung

### Kleine Gruppe (2-5 Personen)

- Alle auf gleichem Channel
- Kein dedizierter Repeater nötig
- Hop Limit: 3

### Lokale Community (10-30 Nodes)

- 1-3 Repeater an guten Standorten
- Gateway für MQTT/Internet
- Hop Limit: 4-5

### Regionales Netzwerk (50+ Nodes)

- Backbone aus Repeatern
- Mehrere Gateways
- Channel-Segmentierung
- Hop Limit: 5-7

---

## Kanalplanung

### Wann mehrere Kanäle?

- Verschiedene Nutzergruppen
- Überlastung vermeiden
- Privatsphäre

### Kanal-Beispiele

| Kanal | Nutzung |
|-------|---------|
| LongFast (0) | Öffentlich, alle |
| Private (1) | Gruppe/Familie |
| Admin (2) | Netzwerk-Wartung |

---

## Checkliste Netzwerk-Planung

### Vor dem Aufbau

- [ ] Abdeckungsgebiet definiert
- [ ] Standorte identifiziert
- [ ] Sichtlinien geprüft
- [ ] Genehmigungen eingeholt
- [ ] Stromversorgung geklärt
- [ ] Hardware bestellt

### Beim Aufbau

- [ ] Nodes konfiguriert (gleiche Region/Channel)
- [ ] Repeater zuerst installieren
- [ ] Reichweitentests durchführen
- [ ] RSSI/SNR dokumentieren

### Nach dem Aufbau

- [ ] Alle Nodes erreichbar?
- [ ] Redundanzpfade funktionieren?
- [ ] Gateway online?
- [ ] Monitoring eingerichtet?

---

## Beispiel: Dorf-Netzwerk

**Ziel**: 5 km² abdecken, 20 Haushalte

**Lösung:**

\`\`\`
                    [Kirchturn]
                    (Repeater)
                        │
    ┌───────────────────┼───────────────────┐
    │                   │                   │
[Haus A]            [Rathaus]           [Haus B]
                    (Gateway)
    │                   │                   │
    └───────────────────┼───────────────────┘
                        │
                    [Bauernhof]
                    (Repeater)
\`\`\`

**Komponenten:**
- 1× Gateway (Rathaus, Internet)
- 2× Repeater (Kirchturm, Bauernhof)
- 20× Clients (Haushalte)
- Hop Limit: 4
`,
  codeLanguage: 'markdown',
  codeFileName: 'MESH_NETWORK_PLANNING.md',

  externalLinks: [
    { title: 'HeyWhatsThat (Sichtbarkeit)', url: 'https://www.heywhatsthat.com/' },
    { title: 'Radio Mobile Online', url: 'https://www.ve2dbe.com/rmonline.html' },
    { title: 'Meshtastic Range Tests', url: 'https://meshtastic.org/docs/overview/range-tests/' },
  ],

  customizationSuggestions: [
    'Wie berechne ich die Reichweite?',
    'Wo sollte ich Repeater platzieren?',
    'Wie viele Nodes kann ein Netzwerk haben?',
    'Was ist das optimale Hop Limit?',
    'Wie vermeide ich Netzwerk-Überlastung?',
  ],

  hardwareOptions: [
    {
      name: 'Starter Set (3 Nodes)',
      price: '~100€',
      features: ['3× Heltec V3', 'Für kleine Gruppe'],
      recommended: true,
    },
    {
      name: 'Community Set (5 Nodes)',
      price: '~180€',
      features: ['2× T-Beam (Repeater)', '3× Heltec (Client)'],
    },
    {
      name: 'Outdoor Repeater',
      price: '~100€',
      features: ['RAK WisMesh', 'Wetterfest', 'Solar'],
    },
  ],
};
