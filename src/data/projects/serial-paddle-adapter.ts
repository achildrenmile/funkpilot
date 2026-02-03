import type { HamProject } from '../../types/projects';

export const serialPaddleAdapter: HamProject = {
  id: 'serial-paddle-adapter',
  name: {
    de: 'Serial Paddle-Adapter (Web Serial)',
    en: 'Serial Paddle Adapter (Web Serial)',
    sl: 'Serial Paddle adapter (Web Serial)',
  },
  category: 'cw-morse',
  difficulty: 1,
  morsefleet: true,
  description: {
    de: 'USB-Serial Adapter für Morse-Paddles. Nutzt Web Serial API für direkte Kommunikation mit Chrome/Edge. Drei Protokolle: Simple Binary, ASCII und Morserino. Ideal für MorseFleet Serial-Modus!',
    en: 'USB-Serial adapter for Morse paddles. Uses Web Serial API for direct communication with Chrome/Edge. Three protocols: Simple Binary, ASCII and Morserino. Ideal for MorseFleet Serial mode!',
    sl: 'USB-Serial adapter za Morse paddle. Uporablja Web Serial API za neposredno komunikacijo s Chrome/Edge. Trije protokoli: Simple Binary, ASCII in Morserino. Idealno za MorseFleet Serial način!',
  },
  hardware: 'arduino-nano',

  components: [
    { name: { de: 'Arduino Nano/Pro Micro/ESP32', en: 'Arduino Nano/Pro Micro/ESP32', sl: 'Arduino Nano/Pro Micro/ESP32' }, quantity: 1, notes: { de: 'jedes Board mit USB', en: 'any USB board', sl: 'katerakoli USB plošča' } },
    { name: { de: 'Klinkenbuchse 3.5mm TRS', en: '3.5mm TRS jack socket', sl: '3.5mm TRS vtičnica' }, quantity: 1, notes: { de: 'Stereo', en: 'Stereo', sl: 'Stereo' } },
    { name: { de: 'USB Kabel', en: 'USB cable', sl: 'USB kabel' }, quantity: 1 },
    { name: { de: 'Kondensator 10nF', en: 'Capacitor 10nF', sl: 'Kondenzator 10nF' }, quantity: 2, notes: { de: 'optional, für Entprellung', en: 'optional, for debouncing', sl: 'opcijsko, za odbijanje' } },
  ],
  estimatedCost: '~5€',

  code: {
    de: `// =====================================================
// MorseFleet Serial Adapter - Simple Binary Protocol
// Hardware: Arduino Nano, Pro Micro, ESP32 oder ähnlich
// Autor: FunkPilot / OE8YML
// Lizenz: MIT
// =====================================================
//
// PROTOKOLL: Simple Binary
// Sendet ein einzelnes Byte bei Zustandsänderung:
//
//   Byte-Format: 0b000000DH
//     Bit 1 (D) = Dit-Paddle (1=gedrückt, 0=losgelassen)
//     Bit 0 (H) = Dah-Paddle (1=gedrückt, 0=losgelassen)
//
//   Beispiele:
//     0x00 (0b00) = Beide losgelassen
//     0x01 (0b01) = Nur Dah gedrückt
//     0x02 (0b10) = Nur Dit gedrückt
//     0x03 (0b11) = Beide gedrückt (Squeeze)
//
// Kompatibel mit: MorseFleet (Chrome/Edge)
// Browser-Unterstützung: Chrome 89+, Edge 89+, Opera 76+
// =====================================================

// Pin-Belegung (anpassen je nach Board)
const int DIT_PIN = 2;   // 3.5mm Tip
const int DAH_PIN = 3;   // 3.5mm Ring
                          // GND = 3.5mm Sleeve

// Entprellzeit in Millisekunden
const int DEBOUNCE_MS = 5;

// Letzter gesendeter Zustand
byte lastState = 0;
unsigned long lastChange = 0;

void setup() {
  // Pins mit internem Pull-Up
  pinMode(DIT_PIN, INPUT_PULLUP);
  pinMode(DAH_PIN, INPUT_PULLUP);

  // Serial mit 115200 Baud (muss in MorseFleet übereinstimmen!)
  Serial.begin(115200);

  // Startmeldung (optional, für Debug)
  // Serial.println("MorseFleet Serial Adapter Ready");
}

void loop() {
  // Paddle-Zustand lesen (LOW = gedrückt wegen INPUT_PULLUP)
  byte ditPressed = !digitalRead(DIT_PIN);
  byte dahPressed = !digitalRead(DAH_PIN);

  // Kombinieren: Bit 1 = Dit, Bit 0 = Dah
  byte currentState = (ditPressed << 1) | dahPressed;

  // Entprellung und nur bei Änderung senden
  if (currentState != lastState && (millis() - lastChange) > DEBOUNCE_MS) {
    Serial.write(currentState);
    lastState = currentState;
    lastChange = millis();
  }
}

// =====================================================
// ALTERNATIVE: ASCII-Protokoll (für Debugging)
// =====================================================
//
// Statt des Binary-Protokolls können Sie auch ASCII senden:
//   D = Dit gedrückt
//   d = Dit losgelassen
//   H = Dah gedrückt
//   h = Dah losgelassen
//
// Ändern Sie dazu die loop()-Funktion wie folgt:
//
/*
bool lastDit = false;
bool lastDah = false;

void loop() {
  bool ditPressed = !digitalRead(DIT_PIN);
  bool dahPressed = !digitalRead(DAH_PIN);

  if (millis() - lastChange < DEBOUNCE_MS) return;

  if (ditPressed != lastDit) {
    Serial.write(ditPressed ? 'D' : 'd');
    lastDit = ditPressed;
    lastChange = millis();
  }

  if (dahPressed != lastDah) {
    Serial.write(dahPressed ? 'H' : 'h');
    lastDah = dahPressed;
    lastChange = millis();
  }
}
*/

// =====================================================
// VERDRAHTUNG:
// =====================================================
//
//        Arduino Nano/Pro Micro
//       ┌─────────────────────┐
//       │                     │
//       │  D2 ────────────────────── Tip (Dit)
//       │                     │         │
//       │  D3 ────────────────────── Ring (Dah)
//       │                     │         │
//       │  GND ───────────────────── Sleeve (Ground)
//       │                     │
//       │  USB ──── zum Computer
//       │                     │
//       └─────────────────────┘
//
//     3.5mm TRS Buchse:
//          ┌───┬───┬─────────┐
//          │TIP│RNG│ SLEEVE  │
//          │Dit│Dah│  GND    │
//          └───┴───┴─────────┘
//
// Optional: 10nF Kondensatoren parallel zu den Kontakten
//           für Hardware-Entprellung
//
// =====================================================
// ESP32 VARIANTE:
// =====================================================
//
// Für ESP32 einfach die Pins ändern:
//
//   const int DIT_PIN = 4;   // GPIO4
//   const int DAH_PIN = 5;   // GPIO5
//
// Der Rest des Codes bleibt identisch!
//
// =====================================================
// VERWENDUNG MIT MORSEFLEET:
// =====================================================
//
// 1. Code auf Arduino/ESP32 hochladen
// 2. Paddle über 3.5mm Buchse anschließen
// 3. MorseFleet in Chrome oder Edge öffnen
// 4. Einstellungen (Zahnrad) → "Serial (USB)" wählen
// 5. Baudrate: 115200 (oder passend zum Code)
// 6. Protokoll: Simple Binary (oder ASCII)
// 7. "Verbinden" klicken → Arduino aus der Liste wählen
// 8. Keyer-Modus wählen (Straight, Iambic A/B, etc.)
// 9. Spielen!
//
// =====================================================
// FEHLERBEHEBUNG:
// =====================================================
//
// - Kein Gerät in der Liste?
//   → USB-Kabel prüfen, anderen Port versuchen
//
// - Keine Reaktion?
//   → Baudrate prüfen (muss übereinstimmen!)
//
// - Prellende/unzuverlässige Eingabe?
//   → 10nF Kondensatoren über Paddle-Kontakte löten
//
// 73 de OE8YML
`,
    en: `// =====================================================
// MorseFleet Serial Adapter - Simple Binary Protocol
// Hardware: Arduino Nano, Pro Micro, ESP32 or similar
// Author: FunkPilot / OE8YML
// License: MIT
// =====================================================
//
// PROTOCOL: Simple Binary
// Sends a single byte on state change:
//
//   Byte format: 0b000000DH
//     Bit 1 (D) = Dit paddle (1=pressed, 0=released)
//     Bit 0 (H) = Dah paddle (1=pressed, 0=released)
//
//   Examples:
//     0x00 (0b00) = Both released
//     0x01 (0b01) = Dah pressed only
//     0x02 (0b10) = Dit pressed only
//     0x03 (0b11) = Both pressed (squeeze)
//
// Compatible with: MorseFleet (Chrome/Edge)
// Browser support: Chrome 89+, Edge 89+, Opera 76+
// =====================================================

// Pin assignments (adjust for your board)
const int DIT_PIN = 2;   // 3.5mm Tip
const int DAH_PIN = 3;   // 3.5mm Ring
                          // GND = 3.5mm Sleeve

// Debounce time in milliseconds
const int DEBOUNCE_MS = 5;

// Last sent state
byte lastState = 0;
unsigned long lastChange = 0;

void setup() {
  // Pins with internal pull-up
  pinMode(DIT_PIN, INPUT_PULLUP);
  pinMode(DAH_PIN, INPUT_PULLUP);

  // Serial at 115200 baud (must match MorseFleet settings!)
  Serial.begin(115200);

  // Startup message (optional, for debug)
  // Serial.println("MorseFleet Serial Adapter Ready");
}

void loop() {
  // Read paddle state (LOW = pressed due to INPUT_PULLUP)
  byte ditPressed = !digitalRead(DIT_PIN);
  byte dahPressed = !digitalRead(DAH_PIN);

  // Combine: Bit 1 = Dit, Bit 0 = Dah
  byte currentState = (ditPressed << 1) | dahPressed;

  // Debounce and send only on change
  if (currentState != lastState && (millis() - lastChange) > DEBOUNCE_MS) {
    Serial.write(currentState);
    lastState = currentState;
    lastChange = millis();
  }
}

// =====================================================
// ALTERNATIVE: ASCII Protocol (for debugging)
// =====================================================
//
// Instead of binary protocol, you can send ASCII:
//   D = Dit pressed
//   d = Dit released
//   H = Dah pressed
//   h = Dah released
//
// Modify the loop() function as follows:
//
/*
bool lastDit = false;
bool lastDah = false;

void loop() {
  bool ditPressed = !digitalRead(DIT_PIN);
  bool dahPressed = !digitalRead(DAH_PIN);

  if (millis() - lastChange < DEBOUNCE_MS) return;

  if (ditPressed != lastDit) {
    Serial.write(ditPressed ? 'D' : 'd');
    lastDit = ditPressed;
    lastChange = millis();
  }

  if (dahPressed != lastDah) {
    Serial.write(dahPressed ? 'H' : 'h');
    lastDah = dahPressed;
    lastChange = millis();
  }
}
*/

// =====================================================
// WIRING:
// =====================================================
//
//        Arduino Nano/Pro Micro
//       ┌─────────────────────┐
//       │                     │
//       │  D2 ────────────────────── Tip (Dit)
//       │                     │         │
//       │  D3 ────────────────────── Ring (Dah)
//       │                     │         │
//       │  GND ───────────────────── Sleeve (Ground)
//       │                     │
//       │  USB ──── to Computer
//       │                     │
//       └─────────────────────┘
//
//     3.5mm TRS Jack:
//          ┌───┬───┬─────────┐
//          │TIP│RNG│ SLEEVE  │
//          │Dit│Dah│  GND    │
//          └───┴───┴─────────┘
//
// Optional: 10nF capacitors across contacts
//           for hardware debouncing
//
// =====================================================
// ESP32 VARIANT:
// =====================================================
//
// For ESP32, just change the pins:
//
//   const int DIT_PIN = 4;   // GPIO4
//   const int DAH_PIN = 5;   // GPIO5
//
// The rest of the code remains identical!
//
// =====================================================
// USING WITH MORSEFLEET:
// =====================================================
//
// 1. Upload code to Arduino/ESP32
// 2. Connect paddle via 3.5mm jack
// 3. Open MorseFleet in Chrome or Edge
// 4. Settings (gear) → Select "Serial (USB)"
// 5. Baud rate: 115200 (or match your code)
// 6. Protocol: Simple Binary (or ASCII)
// 7. Click "Connect" → Select Arduino from list
// 8. Select keyer mode (Straight, Iambic A/B, etc.)
// 9. Play!
//
// =====================================================
// TROUBLESHOOTING:
// =====================================================
//
// - No device in list?
//   → Check USB cable, try different port
//
// - No response?
//   → Check baud rate (must match!)
//
// - Bouncy/unreliable input?
//   → Solder 10nF capacitors across paddle contacts
//
// 73 de OE8YML
`,
    sl: `// =====================================================
// MorseFleet Serial Adapter - Simple Binary Protocol
// Strojna oprema: Arduino Nano, Pro Micro, ESP32 ali podobno
// Avtor: FunkPilot / OE8YML
// Licenca: MIT
// =====================================================
//
// PROTOKOL: Simple Binary
// Pošlje en bajt ob spremembi stanja:
//
//   Format bajta: 0b000000DH
//     Bit 1 (D) = Dit paddle (1=pritisnjen, 0=spuščen)
//     Bit 0 (H) = Dah paddle (1=pritisnjen, 0=spuščen)
//
//   Primeri:
//     0x00 (0b00) = Oba spuščena
//     0x01 (0b01) = Samo Dah pritisnjen
//     0x02 (0b10) = Samo Dit pritisnjen
//     0x03 (0b11) = Oba pritisnjena (squeeze)
//
// Združljivo z: MorseFleet (Chrome/Edge)
// Podpora brskalnikov: Chrome 89+, Edge 89+, Opera 76+
// =====================================================

// Dodelitev pinov (prilagodite za vašo ploščo)
const int DIT_PIN = 2;   // 3.5mm Tip
const int DAH_PIN = 3;   // 3.5mm Ring
                          // GND = 3.5mm Sleeve

// Čas odbijanja v milisekundah
const int DEBOUNCE_MS = 5;

// Zadnje poslano stanje
byte lastState = 0;
unsigned long lastChange = 0;

void setup() {
  // Pini z notranjim pull-up
  pinMode(DIT_PIN, INPUT_PULLUP);
  pinMode(DAH_PIN, INPUT_PULLUP);

  // Serial pri 115200 baudov (mora se ujemati z MorseFleet nastavitvami!)
  Serial.begin(115200);

  // Zagonsko sporočilo (opcijsko, za debug)
  // Serial.println("MorseFleet Serial Adapter Ready");
}

void loop() {
  // Preberi stanje paddle (LOW = pritisnjen zaradi INPUT_PULLUP)
  byte ditPressed = !digitalRead(DIT_PIN);
  byte dahPressed = !digitalRead(DAH_PIN);

  // Kombiniraj: Bit 1 = Dit, Bit 0 = Dah
  byte currentState = (ditPressed << 1) | dahPressed;

  // Odbijanje in pošlji samo ob spremembi
  if (currentState != lastState && (millis() - lastChange) > DEBOUNCE_MS) {
    Serial.write(currentState);
    lastState = currentState;
    lastChange = millis();
  }
}

// =====================================================
// ALTERNATIVA: ASCII protokol (za debugging)
// =====================================================
//
// Namesto binarnega protokola lahko pošljete ASCII:
//   D = Dit pritisnjen
//   d = Dit spuščen
//   H = Dah pritisnjen
//   h = Dah spuščen
//
// Spremenite loop() funkcijo kot sledi:
//
/*
bool lastDit = false;
bool lastDah = false;

void loop() {
  bool ditPressed = !digitalRead(DIT_PIN);
  bool dahPressed = !digitalRead(DAH_PIN);

  if (millis() - lastChange < DEBOUNCE_MS) return;

  if (ditPressed != lastDit) {
    Serial.write(ditPressed ? 'D' : 'd');
    lastDit = ditPressed;
    lastChange = millis();
  }

  if (dahPressed != lastDah) {
    Serial.write(dahPressed ? 'H' : 'h');
    lastDah = dahPressed;
    lastChange = millis();
  }
}
*/

// =====================================================
// OŽIČENJE:
// =====================================================
//
//        Arduino Nano/Pro Micro
//       ┌─────────────────────┐
//       │                     │
//       │  D2 ────────────────────── Tip (Dit)
//       │                     │         │
//       │  D3 ────────────────────── Ring (Dah)
//       │                     │         │
//       │  GND ───────────────────── Sleeve (Ground)
//       │                     │
//       │  USB ──── na računalnik
//       │                     │
//       └─────────────────────┘
//
//     3.5mm TRS vtičnica:
//          ┌───┬───┬─────────┐
//          │TIP│RNG│ SLEEVE  │
//          │Dit│Dah│  GND    │
//          └───┴───┴─────────┘
//
// Opcijsko: 10nF kondenzatorji čez kontakte
//           za strojno odbijanje
//
// =====================================================
// ESP32 VARIANTA:
// =====================================================
//
// Za ESP32 samo spremenite pine:
//
//   const int DIT_PIN = 4;   // GPIO4
//   const int DAH_PIN = 5;   // GPIO5
//
// Preostanek kode ostane enak!
//
// =====================================================
// UPORABA Z MORSEFLEET:
// =====================================================
//
// 1. Naložite kodo na Arduino/ESP32
// 2. Priključite paddle preko 3.5mm vtičnice
// 3. Odprite MorseFleet v Chrome ali Edge
// 4. Nastavitve (zobnik) → Izberite "Serial (USB)"
// 5. Baudna hitrost: 115200 (ali ujemajoča s kodo)
// 6. Protokol: Simple Binary (ali ASCII)
// 7. Kliknite "Poveži" → Izberite Arduino s seznama
// 8. Izberite način ključarja (Straight, Iambic A/B, itd.)
// 9. Igrajte!
//
// =====================================================
// ODPRAVLJANJE TEŽAV:
// =====================================================
//
// - Ni naprave na seznamu?
//   → Preverite USB kabel, poskusite drug port
//
// - Ni odziva?
//   → Preverite baudno hitrost (mora se ujemati!)
//
// - Preskakujoč/nezanesljiv vnos?
//   → Spajkajte 10nF kondenzatorje čez kontakte paddle
//
// 73 de OE8YML
`,
  },
  codeLanguage: 'cpp',
  codeFileName: 'serial_paddle_adapter.ino',

  wiring: [
    { from: { de: 'Arduino D2', en: 'Arduino D2', sl: 'Arduino D2' }, to: { de: '3.5mm Tip (Dit)', en: '3.5mm Tip (Dit)', sl: '3.5mm Tip (Dit)' }, color: 'Gelb' },
    { from: { de: 'Arduino D3', en: 'Arduino D3', sl: 'Arduino D3' }, to: { de: '3.5mm Ring (Dah)', en: '3.5mm Ring (Dah)', sl: '3.5mm Ring (Dah)' }, color: 'Orange' },
    { from: { de: 'Arduino GND', en: 'Arduino GND', sl: 'Arduino GND' }, to: { de: '3.5mm Sleeve (GND)', en: '3.5mm Sleeve (GND)', sl: '3.5mm Sleeve (GND)' }, color: 'Schwarz' },
  ],

  externalLinks: [
    { title: { de: 'Web Serial API Dokumentation', en: 'Web Serial API Documentation', sl: 'Web Serial API dokumentacija' }, url: 'https://developer.mozilla.org/en-US/docs/Web/API/Web_Serial_API' },
    { title: { de: 'MorseFleet CW-Spiel', en: 'MorseFleet CW Game', sl: 'MorseFleet CW igra' }, url: 'https://morsefleet.oe8yml.at/' },
    { title: { de: 'Web Serial Browser-Unterstützung', en: 'Web Serial Browser Support', sl: 'Web Serial podpora brskalnikov' }, url: 'https://caniuse.com/web-serial' },
  ],

  customizationSuggestions: [
    { de: 'LED-Statusanzeige für Verbindung hinzufügen', en: 'Add LED status indicator for connection', sl: 'Dodaj LED statusni indikator za povezavo' },
    { de: 'Protokoll per DIP-Schalter umschalten', en: 'Switch protocol via DIP switch', sl: 'Preklopi protokol preko DIP stikala' },
    { de: 'Baudrate konfigurierbar machen', en: 'Make baud rate configurable', sl: 'Naredi baudno hitrost nastavljivo' },
  ],
};
