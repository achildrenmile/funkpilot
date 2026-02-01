import type { HamProject } from '../../types/projects';

export const meshNetworkPlanning: HamProject = {
  id: 'mesh-network-planning',
  name: {
    de: 'Mesh-Netzwerk planen',
    en: 'Mesh Network Planning',
    sl: 'Načrtovanje Mesh omrežja',
  },
  category: 'mesh-lora',
  difficulty: 2,
  description: {
    de: 'Strategische Planung eines LoRa-Mesh-Netzwerks. Standorte, Reichweiten, Redundanz und Skalierung.',
    en: 'Strategic planning of a LoRa mesh network. Locations, ranges, redundancy and scaling.',
    sl: 'Strateško načrtovanje LoRa mesh omrežja. Lokacije, dosegi, redundanca in skaliranje.',
  },
  hardware: 'esp32-lora',
  projectType: 'guide',

  components: [
    {
      name: { de: 'LoRa-Nodes', en: 'LoRa Nodes', sl: 'LoRa vozlišča' },
      quantity: 3,
      notes: { de: 'Minimum für Mesh', en: 'Minimum for mesh', sl: 'Minimum za mesh' },
    },
    {
      name: { de: 'Repeater/Router', en: 'Repeater/Router', sl: 'Repetitor/Usmerjevalnik' },
      quantity: 1,
      notes: { de: 'Für erweiterte Reichweite', en: 'For extended range', sl: 'Za razširjen doseg' },
    },
    {
      name: { de: 'Gateway (optional)', en: 'Gateway (optional)', sl: 'Gateway (neobvezno)' },
      quantity: 1,
      notes: { de: 'Für Internet-Anbindung', en: 'For internet connection', sl: 'Za internetno povezavo' },
    },
  ],
  estimatedCost: '100-300 EUR',

  code: {
    de: `# Mesh-Netzwerk planen

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
    en: `# Mesh Network Planning

## Basics

A mesh network consists of nodes that forward messages.
Good planning is crucial for range and reliability.

---

## Network Topologies

### Star (Hub & Spoke)

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

**Advantages**: Simple, one gateway is enough
**Disadvantages**: Single Point of Failure

### Line (Linear)

\`\`\`
[Client]──[Repeater]──[Repeater]──[Gateway]
\`\`\`

**Advantages**: Bridge large distances
**Disadvantages**: Many hops, high latency

### Mesh (Interconnected)

\`\`\`
    [Client]────[Repeater]────[Client]
        │           │             │
        │           │             │
  [Repeater]────[Gateway]────[Repeater]
        │           │             │
        │           │             │
    [Client]────[Repeater]────[Client]
\`\`\`

**Advantages**: Redundancy, multiple paths
**Disadvantages**: More nodes needed

---

## Location Selection

### Ideal Repeater Locations

| Factor | Importance | Description |
|--------|------------|-------------|
| **Height** | ⭐⭐⭐⭐⭐ | The higher, the better |
| **Line of Sight** | ⭐⭐⭐⭐⭐ | Clear view to other nodes |
| **Power Supply** | ⭐⭐⭐⭐ | Mains power or solar |
| **Access** | ⭐⭐⭐ | Reachable for maintenance |
| **Permission** | ⭐⭐⭐ | Ask the owner |

### Location Types

1. **Mountain Peak/Viewpoint**
   - Best range (10-50+ km)
   - Solar needed, hard to reach

2. **High-rise/Roof**
   - Good range (5-20 km)
   - Power available, permission needed

3. **Radio Tower/Mast**
   - Very good range
   - Often has power, permission needed

4. **Window Sill/Balcony**
   - Limited range (1-5 km)
   - Simple, power available

---

## Range Estimation

### Fresnel Zone

For optimal transmission, the first Fresnel zone must be clear:

\`\`\`
Radius (m) = 17.3 × √(d / f)

d = Distance (km)
f = Frequency (GHz) = 0.868
\`\`\`

**Example 10 km at 868 MHz:**
Radius = 17.3 × √(10 / 0.868) = 58.7 m

→ No obstacles higher than 60m in the middle!

### Typical Ranges

| Environment | Range | Conditions |
|-------------|-------|------------|
| Urban | 1-3 km | Buildings, reflections |
| Suburban | 3-8 km | Partially clear |
| Rural | 5-15 km | Few obstacles |
| Mountain to Mountain | 20-100+ km | Line of sight |

### Calculate Link Budget

\`\`\`
Received Power = TX Power + TX Antenna - Path Loss + RX Antenna
Minimum for LoRa SF10: -134 dBm (theoretical)
Practical: -120 dBm for reliable connection

Path Loss (Free Space):
L = 20×log₁₀(d) + 20×log₁₀(f) + 32.44
  = 20×log₁₀(10km) + 20×log₁₀(868MHz) + 32.44
  = 20 + 58.8 + 32.44 = 111.2 dB

Example:
TX = 14 dBm, TX Ant = 3 dBi, RX Ant = 3 dBi
14 + 3 - 111 + 3 = -91 dBm (OK!)
\`\`\`

---

## Network Design

### Step 1: Define Requirements

- **Coverage Area**: What area?
- **Number of Users**: How many clients?
- **Reliability**: Redundancy needed?
- **Internet**: Gateway desired?

### Step 2: Create Map

1. Open OpenStreetMap or Google Maps
2. Mark the desired area
3. Draw potential locations
4. Check line of sight (terrain)

**Tools:**
- [HeyWhatsThat](https://www.heywhatsthat.com/) - Visibility analysis
- [Radio Mobile](https://www.ve2dbe.com/rmonline.html) - Radio propagation
- [Google Earth](https://earth.google.com/) - 3D Terrain

### Step 3: Place Nodes

**Rule 1**: Each client should see at least 2 nodes
**Rule 2**: Repeaters at highest points
**Rule 3**: Gateway central or easily accessible

### Step 4: Set Hop Limit

| Network Size | Recommended Hop Limit |
|--------------|----------------------|
| Small (< 5 Nodes) | 3 |
| Medium (5-15 Nodes) | 4-5 |
| Large (> 15 Nodes) | 5-7 |

**Warning**: Too high hop limit = network overload!

---

## Planning Redundancy

### Avoid Single Point of Failure

\`\`\`
BAD:                         GOOD:
[A]──[B]──[C]               [A]──[B]──[C]
                                  ╲  ╱
                                   [D]
\`\`\`

### Backbone vs Edge

- **Backbone**: Repeaters connected to each other
- **Edge**: Clients at the network edge

\`\`\`
              ┌─────Backbone─────┐
              │                  │
[Client]──[Repeater]──[Gateway]──[Repeater]──[Client]
    │                                │
[Client]                        [Client]
\`\`\`

---

## Scaling

### Small Group (2-5 People)

- Everyone on the same channel
- No dedicated repeater needed
- Hop Limit: 3

### Local Community (10-30 Nodes)

- 1-3 repeaters at good locations
- Gateway for MQTT/Internet
- Hop Limit: 4-5

### Regional Network (50+ Nodes)

- Backbone of repeaters
- Multiple gateways
- Channel segmentation
- Hop Limit: 5-7

---

## Channel Planning

### When Multiple Channels?

- Different user groups
- Avoid overload
- Privacy

### Channel Examples

| Channel | Usage |
|---------|-------|
| LongFast (0) | Public, everyone |
| Private (1) | Group/Family |
| Admin (2) | Network maintenance |

---

## Network Planning Checklist

### Before Setup

- [ ] Coverage area defined
- [ ] Locations identified
- [ ] Line of sight checked
- [ ] Permissions obtained
- [ ] Power supply clarified
- [ ] Hardware ordered

### During Setup

- [ ] Nodes configured (same region/channel)
- [ ] Install repeaters first
- [ ] Perform range tests
- [ ] Document RSSI/SNR

### After Setup

- [ ] All nodes reachable?
- [ ] Redundancy paths working?
- [ ] Gateway online?
- [ ] Monitoring set up?

---

## Example: Village Network

**Goal**: Cover 5 km², 20 households

**Solution:**

\`\`\`
                    [Church Tower]
                     (Repeater)
                         │
    ┌────────────────────┼────────────────────┐
    │                    │                    │
[House A]            [Town Hall]          [House B]
                      (Gateway)
    │                    │                    │
    └────────────────────┼────────────────────┘
                         │
                      [Farm]
                    (Repeater)
\`\`\`

**Components:**
- 1× Gateway (Town Hall, Internet)
- 2× Repeater (Church Tower, Farm)
- 20× Clients (Households)
- Hop Limit: 4
`,
    sl: `# Načrtovanje Mesh omrežja

## Osnove

Mesh omrežje sestavljajo vozlišča, ki posredujejo sporočila.
Dobro načrtovanje je ključno za doseg in zanesljivost.

---

## Omrežne topologije

### Zvezda (Hub & Spoke)

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

**Prednosti**: Preprosto, zadostuje en gateway
**Slabosti**: Ena točka odpovedi

### Linija (Linearna)

\`\`\`
[Client]──[Repeater]──[Repeater]──[Gateway]
\`\`\`

**Prednosti**: Premostitev velikih razdalj
**Slabosti**: Veliko skokov, visoka latenca

### Mesh (Prepleteno)

\`\`\`
    [Client]────[Repeater]────[Client]
        │           │             │
        │           │             │
  [Repeater]────[Gateway]────[Repeater]
        │           │             │
        │           │             │
    [Client]────[Repeater]────[Client]
\`\`\`

**Prednosti**: Redundanca, več poti
**Slabosti**: Potrebnih več vozlišč

---

## Izbira lokacije

### Idealne lokacije za repetitorje

| Dejavnik | Pomembnost | Opis |
|----------|------------|------|
| **Višina** | ⭐⭐⭐⭐⭐ | Višje je bolje |
| **Vidna linija** | ⭐⭐⭐⭐⭐ | Prost pogled do drugih vozlišč |
| **Napajanje** | ⭐⭐⭐⭐ | Omrežno napajanje ali solarno |
| **Dostop** | ⭐⭐⭐ | Dostopno za vzdrževanje |
| **Dovoljenje** | ⭐⭐⭐ | Vprašaj lastnika |

### Tipi lokacij

1. **Gorski vrh/Razgledna točka**
   - Najboljši doseg (10-50+ km)
   - Potreben solarni panel, težko dostopno

2. **Visoka zgradba/Streha**
   - Dober doseg (5-20 km)
   - Elektrika na voljo, potrebno dovoljenje

3. **Radijski stolp/Drog**
   - Zelo dober doseg
   - Pogosto elektrika, potrebno dovoljenje

4. **Okensko polica/Balkon**
   - Omejen doseg (1-5 km)
   - Preprosto, elektrika na voljo

---

## Ocena dosega

### Fresnelova cona

Za optimalen prenos mora biti prva Fresnelova cona prosta:

\`\`\`
Radius (m) = 17.3 × √(d / f)

d = Razdalja (km)
f = Frekvenca (GHz) = 0.868
\`\`\`

**Primer 10 km pri 868 MHz:**
Radius = 17.3 × √(10 / 0.868) = 58.7 m

→ Nobene ovire višje od 60m na sredini!

### Tipični dosegi

| Okolje | Doseg | Pogoji |
|--------|-------|--------|
| Mesto | 1-3 km | Zgradbe, odboji |
| Predmestje | 3-8 km | Delno prosto |
| Podeželje | 5-15 km | Malo ovir |
| Gora do gore | 20-100+ km | Vidna linija |

### Izračun link budgeta

\`\`\`
Prejeta moč = TX moč + TX antena - Izguba poti + RX antena
Minimum za LoRa SF10: -134 dBm (teoretično)
Praktično: -120 dBm za zanesljivo povezavo

Izguba poti (prosto polje):
L = 20×log₁₀(d) + 20×log₁₀(f) + 32.44
  = 20×log₁₀(10km) + 20×log₁₀(868MHz) + 32.44
  = 20 + 58.8 + 32.44 = 111.2 dB

Primer:
TX = 14 dBm, TX Ant = 3 dBi, RX Ant = 3 dBi
14 + 3 - 111 + 3 = -91 dBm (OK!)
\`\`\`

---

## Načrtovanje omrežja

### Korak 1: Določi zahteve

- **Območje pokritosti**: Kakšna površina?
- **Število uporabnikov**: Koliko clientov?
- **Zanesljivost**: Potrebna redundanca?
- **Internet**: Željen gateway?

### Korak 2: Ustvari zemljevid

1. Odpri OpenStreetMap ali Google Maps
2. Označi želeno območje
3. Nariši potencialne lokacije
4. Preveri vidne linije (teren)

**Orodja:**
- [HeyWhatsThat](https://www.heywhatsthat.com/) - Analiza vidnosti
- [Radio Mobile](https://www.ve2dbe.com/rmonline.html) - Širjenje radijskih valov
- [Google Earth](https://earth.google.com/) - 3D teren

### Korak 3: Namesti vozlišča

**Pravilo 1**: Vsak client naj vidi vsaj 2 vozlišči
**Pravilo 2**: Repetitorji na najvišjih točkah
**Pravilo 3**: Gateway centralno ali lahko dostopen

### Korak 4: Nastavi Hop Limit

| Velikost omrežja | Priporočen Hop Limit |
|------------------|---------------------|
| Majhno (< 5 vozlišč) | 3 |
| Srednje (5-15 vozlišč) | 4-5 |
| Veliko (> 15 vozlišč) | 5-7 |

**Opozorilo**: Previsok hop limit = preobremenitev omrežja!

---

## Načrtovanje redundance

### Izogibanje eni točki odpovedi

\`\`\`
SLABO:                       DOBRO:
[A]──[B]──[C]               [A]──[B]──[C]
                                  ╲  ╱
                                   [D]
\`\`\`

### Backbone vs Edge

- **Backbone**: Repetitorji povezani med seboj
- **Edge**: Clienti na robu omrežja

\`\`\`
              ┌─────Backbone─────┐
              │                  │
[Client]──[Repeater]──[Gateway]──[Repeater]──[Client]
    │                                │
[Client]                        [Client]
\`\`\`

---

## Skaliranje

### Majhna skupina (2-5 oseb)

- Vsi na istem kanalu
- Ni potreben namenski repetitor
- Hop Limit: 3

### Lokalna skupnost (10-30 vozlišč)

- 1-3 repetitorji na dobrih lokacijah
- Gateway za MQTT/Internet
- Hop Limit: 4-5

### Regionalno omrežje (50+ vozlišč)

- Backbone iz repetitorjev
- Več gatewayev
- Segmentacija kanalov
- Hop Limit: 5-7

---

## Načrtovanje kanalov

### Kdaj več kanalov?

- Različne skupine uporabnikov
- Izogibanje preobremenitvi
- Zasebnost

### Primeri kanalov

| Kanal | Uporaba |
|-------|---------|
| LongFast (0) | Javno, vsi |
| Private (1) | Skupina/Družina |
| Admin (2) | Vzdrževanje omrežja |

---

## Kontrolni seznam načrtovanja omrežja

### Pred postavitvijo

- [ ] Območje pokritosti določeno
- [ ] Lokacije identificirane
- [ ] Vidne linije preverjene
- [ ] Dovoljenja pridobljena
- [ ] Napajanje razjasnjeno
- [ ] Strojna oprema naročena

### Med postavitvijo

- [ ] Vozlišča konfigurirana (ista regija/kanal)
- [ ] Najprej namesti repetitorje
- [ ] Izvedi teste dosega
- [ ] Dokumentiraj RSSI/SNR

### Po postavitvi

- [ ] Vsa vozlišča dosegljiva?
- [ ] Redundančne poti delujejo?
- [ ] Gateway online?
- [ ] Monitoring nastavljen?

---

## Primer: Vaško omrežje

**Cilj**: Pokriti 5 km², 20 gospodinjstev

**Rešitev:**

\`\`\`
                    [Cerkveni stolp]
                      (Repeater)
                          │
    ┌─────────────────────┼─────────────────────┐
    │                     │                     │
[Hiša A]              [Občina]              [Hiša B]
                      (Gateway)
    │                     │                     │
    └─────────────────────┼─────────────────────┘
                          │
                       [Kmetija]
                      (Repeater)
\`\`\`

**Komponente:**
- 1× Gateway (Občina, Internet)
- 2× Repeater (Cerkveni stolp, Kmetija)
- 20× Clientov (Gospodinjstva)
- Hop Limit: 4
`,
  },
  codeLanguage: 'markdown',
  codeFileName: 'MESH_NETWORK_PLANNING.md',

  externalLinks: [
    {
      title: {
        de: 'HeyWhatsThat (Sichtbarkeit)',
        en: 'HeyWhatsThat (Visibility)',
        sl: 'HeyWhatsThat (Vidnost)',
      },
      url: 'https://www.heywhatsthat.com/',
    },
    {
      title: {
        de: 'Radio Mobile Online',
        en: 'Radio Mobile Online',
        sl: 'Radio Mobile Online',
      },
      url: 'https://www.ve2dbe.com/rmonline.html',
    },
    {
      title: {
        de: 'Meshtastic Reichweiten-Tests',
        en: 'Meshtastic Range Tests',
        sl: 'Meshtastic testi dosega',
      },
      url: 'https://meshtastic.org/docs/overview/range-tests/',
    },
  ],

  customizationSuggestions: [
    { de: 'Wie berechne ich die Reichweite?', en: 'How do I calculate the range?', sl: 'Kako izračunam doseg?' },
    { de: 'Wo sollte ich Repeater platzieren?', en: 'Where should I place repeaters?', sl: 'Kje naj namestim repetitorje?' },
    { de: 'Wie viele Nodes kann ein Netzwerk haben?', en: 'How many nodes can a network have?', sl: 'Koliko vozlišč ima lahko omrežje?' },
    { de: 'Was ist das optimale Hop Limit?', en: 'What is the optimal hop limit?', sl: 'Kateri je optimalen hop limit?' },
    { de: 'Wie vermeide ich Netzwerk-Überlastung?', en: 'How do I avoid network overload?', sl: 'Kako se izognem preobremenitvi omrežja?' },
  ],

  hardwareOptions: [
    {
      name: { de: 'Starter Set (3 Nodes)', en: 'Starter Set (3 Nodes)', sl: 'Začetni komplet (3 vozlišča)' },
      price: '~100€',
      features: [
        { de: '3× Heltec V3', en: '3× Heltec V3', sl: '3× Heltec V3' },
        { de: 'Für kleine Gruppe', en: 'For small group', sl: 'Za majhno skupino' },
      ],
      recommended: true,
    },
    {
      name: { de: 'Community Set (5 Nodes)', en: 'Community Set (5 Nodes)', sl: 'Skupnostni komplet (5 vozlišč)' },
      price: '~180€',
      features: [
        { de: '2× T-Beam (Repeater)', en: '2× T-Beam (Repeater)', sl: '2× T-Beam (Repeater)' },
        { de: '3× Heltec (Client)', en: '3× Heltec (Client)', sl: '3× Heltec (Client)' },
      ],
    },
    {
      name: { de: 'Outdoor Repeater', en: 'Outdoor Repeater', sl: 'Zunanji repetitor' },
      price: '~100€',
      features: [
        { de: 'RAK WisMesh', en: 'RAK WisMesh', sl: 'RAK WisMesh' },
        { de: 'Wetterfest', en: 'Weatherproof', sl: 'Odporen na vreme' },
        { de: 'Solar', en: 'Solar', sl: 'Solarno' },
      ],
    },
  ],
};
