import type { HamProject } from '../../types/projects';

export const antennaSwitch: HamProject = {
  id: 'antenna-switch',
  name: {
    de: 'Antennenumschalter 4-fach',
    en: '4-Way Antenna Switch',
    sl: '4-smerni antenski preklopnik'
  },
  category: 'antenna',
  difficulty: 1,
  description: {
    de: 'Ferngesteuerter 4-fach Antennenumschalter mit Relais. Memory-Funktion speichert letzte Auswahl. LED-Anzeige für aktive Antenne. Galvanisch getrennt vom Transceiver.',
    en: 'Remote-controlled 4-way antenna switch with relays. Memory function stores last selection. LED indicator for active antenna. Galvanically isolated from transceiver.',
    sl: 'Daljinsko krmljen 4-smerni antenski preklopnik z releji. Funkcija pomnilnika shrani zadnjo izbiro. LED indikator za aktivno anteno. Galvansko ločen od oddajnika.'
  },
  hardware: 'arduino-nano',

  components: [
    {
      name: { de: 'Arduino Nano', en: 'Arduino Nano', sl: 'Arduino Nano' },
      quantity: 1
    },
    {
      name: { de: 'Relais-Modul 4-fach', en: '4-Channel Relay Module', sl: '4-kanalni relejni modul' },
      quantity: 1,
      notes: { de: '5V, mit Optokoppler', en: '5V, with optocoupler', sl: '5V, z optosklopnikom' }
    },
    {
      name: { de: 'Koax-Relais', en: 'Coax Relay', sl: 'Koaksialni rele' },
      quantity: 4,
      notes: { de: 'oder BNC/SO239 Relais', en: 'or BNC/SO239 relay', sl: 'ali BNC/SO239 rele' }
    },
    {
      name: { de: 'LED 5mm', en: '5mm LED', sl: '5mm LED' },
      quantity: 4,
      notes: { de: 'verschiedene Farben', en: 'various colors', sl: 'različne barve' }
    },
    {
      name: { de: 'Taster', en: 'Push Button', sl: 'Tipka' },
      quantity: 4,
      notes: { de: 'für manuelle Auswahl', en: 'for manual selection', sl: 'za ročno izbiro' }
    },
    {
      name: { de: 'Widerstand 220 Ohm', en: '220 Ohm Resistor', sl: '220 Ohm upor' },
      quantity: 4,
      notes: { de: 'für LEDs', en: 'for LEDs', sl: 'za LED-e' }
    },
    {
      name: { de: 'Gehäuse Metall', en: 'Metal Enclosure', sl: 'Kovinsko ohišje' },
      quantity: 1,
      notes: { de: 'für HF-Schirmung', en: 'for RF shielding', sl: 'za RF zaščito' }
    },
    {
      name: { de: 'SO239/BNC Buchsen', en: 'SO239/BNC Connectors', sl: 'SO239/BNC konektorji' },
      quantity: 5,
      notes: { de: '1x Input, 4x Output', en: '1x Input, 4x Output', sl: '1x vhod, 4x izhod' }
    },
    {
      name: { de: 'DC-Buchse', en: 'DC Jack', sl: 'DC vtičnica' },
      quantity: 1,
      notes: { de: '12V Versorgung', en: '12V power supply', sl: '12V napajanje' }
    },
  ],
  estimatedCost: '~35€',

  code: `// =====================================================
// Antenna Switch 4-Way - FunkPilot DIY Project
// Antennenumschalter 4-fach - FunkPilot Bastelprojekt
// 4-smerni antenski preklopnik - FunkPilot DIY projekt
// Hardware: Arduino Nano + 4x Relay / Relais / Rele
// Author / Autor / Avtor: FunkPilot / OE8YML
// License / Lizenz / Licenca: MIT
// =====================================================

#include <EEPROM.h>

// ===== PIN ASSIGNMENT / PIN-BELEGUNG / RAZPOREDITEV PINOV =====
// Relays (Active LOW for most modules)
// Relais (Active LOW bei den meisten Modulen)
// Releji (Active LOW pri večini modulov)
const int RELAY_1 = 2;
const int RELAY_2 = 3;
const int RELAY_3 = 4;
const int RELAY_4 = 5;

// LEDs
const int LED_1 = 6;
const int LED_2 = 7;
const int LED_3 = 8;
const int LED_4 = 9;

// Buttons (Active LOW with pullup)
// Taster (Active LOW mit Pullup)
// Tipke (Active LOW s pullup)
const int BTN_1 = 10;
const int BTN_2 = 11;
const int BTN_3 = 12;
const int BTN_4 = A0;

// Arrays for easier handling
// Arrays für einfachere Handhabung
// Polja za lažje upravljanje
const int relays[] = {RELAY_1, RELAY_2, RELAY_3, RELAY_4};
const int leds[] = {LED_1, LED_2, LED_3, LED_4};
const int buttons[] = {BTN_1, BTN_2, BTN_3, BTN_4};

// ===== CONFIGURATION / KONFIGURATION / NASTAVITVE =====
const bool ACTIVE_LOW_RELAY = true;   // true for most relay modules / true für die meisten Relais-Module / true za večino relejnih modulov
const int DEBOUNCE_DELAY = 50;        // Debounce time in ms / Entprell-Zeit in ms / Čas za odpravo odbijanja v ms
const int EEPROM_ADDR = 0;            // Address for memory function / Adresse für Memory-Funktion / Naslov za funkcijo pomnilnika

// ===== VARIABLES / VARIABLEN / SPREMENLJIVKE =====
int currentAntenna = 0;               // 0-3 for antenna 1-4 / 0-3 für Antenne 1-4 / 0-3 za anteno 1-4
unsigned long lastButtonTime = 0;

void setup() {
  Serial.begin(9600);
  Serial.println(F("Antenna Switch v1.0"));
  Serial.println(F("FunkPilot Project"));

  // Relays as output / Relais als Ausgang / Releji kot izhod
  for (int i = 0; i < 4; i++) {
    pinMode(relays[i], OUTPUT);
    // All relays off / Alle Relais aus / Vsi releji izključeni
    digitalWrite(relays[i], ACTIVE_LOW_RELAY ? HIGH : LOW);
  }

  // LEDs as output / LEDs als Ausgang / LED-i kot izhod
  for (int i = 0; i < 4; i++) {
    pinMode(leds[i], OUTPUT);
    digitalWrite(leds[i], LOW);
  }

  // Buttons as input with pullup / Taster als Eingang mit Pullup / Tipke kot vhod s pullup
  for (int i = 0; i < 4; i++) {
    pinMode(buttons[i], INPUT_PULLUP);
  }

  // Load last selection from EEPROM / Letzte Auswahl aus EEPROM laden / Naloži zadnjo izbiro iz EEPROM
  loadFromMemory();

  // Startup sequence (all LEDs briefly on) / Startsequenz (alle LEDs kurz an) / Zagonska sekvenca (vse LED-e kratko prižgane)
  startupSequence();

  // Activate saved antenna / Gespeicherte Antenne aktivieren / Aktiviraj shranjeno anteno
  selectAntenna(currentAntenna);

  Serial.print(F("Active antenna: "));
  Serial.println(currentAntenna + 1);
}

void loop() {
  // Check buttons / Taster abfragen / Preveri tipke
  for (int i = 0; i < 4; i++) {
    if (digitalRead(buttons[i]) == LOW) {
      // Debounce / Entprellen / Odprava odbijanja
      delay(DEBOUNCE_DELAY);
      if (digitalRead(buttons[i]) == LOW) {
        // Switch antenna / Antenne wechseln / Preklopi anteno
        selectAntenna(i);

        // Wait until button released / Warten bis Taster losgelassen / Počakaj dokler tipka ni spuščena
        while (digitalRead(buttons[i]) == LOW) {
          delay(10);
        }
      }
    }
  }

  // Serial control (optional) / Serielle Steuerung (optional) / Serijsko krmiljenje (opcijsko)
  if (Serial.available() > 0) {
    char cmd = Serial.read();
    if (cmd >= '1' && cmd <= '4') {
      selectAntenna(cmd - '1');
    }
  }
}

void selectAntenna(int antenna) {
  if (antenna < 0 || antenna > 3) return;
  if (antenna == currentAntenna) return;  // Already active / Schon aktiv / Že aktivno

  Serial.print(F("Switching to antenna "));
  Serial.println(antenna + 1);

  // All relays off (Break-before-make) / Alle Relais aus (Break-before-make) / Vsi releji izključeni (Break-before-make)
  for (int i = 0; i < 4; i++) {
    digitalWrite(relays[i], ACTIVE_LOW_RELAY ? HIGH : LOW);
    digitalWrite(leds[i], LOW);
  }

  // Short pause for break-before-make / Kurze Pause für Break-before-make / Kratka pavza za break-before-make
  delay(50);

  // New relay on / Neues Relais ein / Nov rele vključen
  digitalWrite(relays[antenna], ACTIVE_LOW_RELAY ? LOW : HIGH);
  digitalWrite(leds[antenna], HIGH);

  currentAntenna = antenna;

  // Save to EEPROM / In EEPROM speichern / Shrani v EEPROM
  saveToMemory();

  Serial.print(F("Antenna "));
  Serial.print(antenna + 1);
  Serial.println(F(" active"));
}

void loadFromMemory() {
  int stored = EEPROM.read(EEPROM_ADDR);
  if (stored >= 0 && stored <= 3) {
    currentAntenna = stored;
    Serial.print(F("Loaded from memory: Antenna "));
    Serial.println(currentAntenna + 1);
  } else {
    // Invalid value -> Default antenna 1 / Ungültiger Wert -> Default Antenne 1 / Neveljavna vrednost -> Privzeta antena 1
    currentAntenna = 0;
    EEPROM.write(EEPROM_ADDR, 0);
  }
}

void saveToMemory() {
  // Only write if value changed (EEPROM protection) / Nur schreiben wenn sich Wert geändert hat (EEPROM-Schonung) / Zapiši samo če se je vrednost spremenila (zaščita EEPROM)
  if (EEPROM.read(EEPROM_ADDR) != currentAntenna) {
    EEPROM.write(EEPROM_ADDR, currentAntenna);
    Serial.println(F("Saved to memory"));
  }
}

void startupSequence() {
  // All LEDs on/off sequentially / Alle LEDs nacheinander an/aus / Vse LED-e zaporedno prižgane/ugasnjene
  for (int i = 0; i < 4; i++) {
    digitalWrite(leds[i], HIGH);
    delay(100);
  }
  delay(200);
  for (int i = 0; i < 4; i++) {
    digitalWrite(leds[i], LOW);
  }
  delay(100);
}

// ===== EXTENSIONS / ERWEITERUNGEN / RAZŠIRITVE =====
// You can add the following functions:
// Du kannst folgende Funktionen hinzufügen:
// Lahko dodaš naslednje funkcije:
//
// 1. CAT Control / CAT-Steuerung / CAT krmiljenje:
//    - Receive serial commands from transceiver / Serielle Befehle vom Transceiver empfangen / Sprejmi serijske ukaze od oddajnika
//    - Band decoder function / Band-Decoder Funktion / Funkcija dekodiranja pasu
//
// 2. Rotary Encoder / Drehencoder / Rotacijski enkoder:
//    - Rotary encoder instead of individual buttons / Drehencoder statt Einzeltaster / Rotacijski enkoder namesto posameznih tipk
//    - Cycle through antennas / Durchschalten der Antennen / Preklapljanje med antenami
//
// 3. LCD/OLED Display / LCD/OLED Anzeige / LCD/OLED zaslon:
//    - Show antenna name / Antennenname anzeigen / Prikaži ime antene
//    - SWR value (if SWR meter available) / SWR-Wert (wenn SWR-Meter vorhanden) / SWR vrednost (če je SWR meter na voljo)
//
// 4. Band Automation / Band-Automatik / Avtomatika pasu:
//    - Evaluate CI-V or CAT / CI-V oder CAT auswerten / Ovrednoti CI-V ali CAT
//    - Automatically select matching antenna / Automatisch passende Antenne wählen / Samodejno izberi ustrezno anteno
`,
  codeLanguage: 'cpp',
  codeFileName: 'antenna_switch.ino',

  wiring: [
    {
      from: 'Arduino D2',
      to: { de: 'Taster ANT1', en: 'Button ANT1', sl: 'Tipka ANT1' },
      color: 'Gelb',
      notes: { de: 'nach GND schalten', en: 'switch to GND', sl: 'preklopi na GND' }
    },
    {
      from: 'Arduino D3',
      to: { de: 'Taster ANT2', en: 'Button ANT2', sl: 'Tipka ANT2' },
      color: 'Gelb'
    },
    {
      from: 'Arduino D4',
      to: { de: 'Taster ANT3', en: 'Button ANT3', sl: 'Tipka ANT3' },
      color: 'Gelb'
    },
    {
      from: 'Arduino D5',
      to: { de: 'Taster ANT4', en: 'Button ANT4', sl: 'Tipka ANT4' },
      color: 'Gelb'
    },
    {
      from: 'Arduino D6',
      to: { de: 'Relais-Modul IN1', en: 'Relay Module IN1', sl: 'Relejni modul IN1' },
      color: 'Blau'
    },
    {
      from: 'Arduino D7',
      to: { de: 'Relais-Modul IN2', en: 'Relay Module IN2', sl: 'Relejni modul IN2' },
      color: 'Blau'
    },
    {
      from: 'Arduino D8',
      to: { de: 'Relais-Modul IN3', en: 'Relay Module IN3', sl: 'Relejni modul IN3' },
      color: 'Blau'
    },
    {
      from: 'Arduino D9',
      to: { de: 'Relais-Modul IN4', en: 'Relay Module IN4', sl: 'Relejni modul IN4' },
      color: 'Blau'
    },
    {
      from: 'Arduino D10',
      to: { de: 'LED1 Anode', en: 'LED1 Anode', sl: 'LED1 Anoda' },
      color: 'Grün',
      notes: { de: 'über 220Ω', en: 'via 220Ω', sl: 'preko 220Ω' }
    },
    {
      from: 'Arduino D11',
      to: { de: 'LED2 Anode', en: 'LED2 Anode', sl: 'LED2 Anoda' },
      color: 'Grün',
      notes: { de: 'über 220Ω', en: 'via 220Ω', sl: 'preko 220Ω' }
    },
    {
      from: 'Arduino D12',
      to: { de: 'LED3 Anode', en: 'LED3 Anode', sl: 'LED3 Anoda' },
      color: 'Grün',
      notes: { de: 'über 220Ω', en: 'via 220Ω', sl: 'preko 220Ω' }
    },
    {
      from: 'Arduino D13',
      to: { de: 'LED4 Anode', en: 'LED4 Anode', sl: 'LED4 Anoda' },
      color: 'Grün',
      notes: { de: 'über 220Ω', en: 'via 220Ω', sl: 'preko 220Ω' }
    },
    {
      from: 'Arduino 5V',
      to: { de: 'Relais-Modul VCC', en: 'Relay Module VCC', sl: 'Relejni modul VCC' },
      color: 'Rot'
    },
    {
      from: 'Arduino GND',
      to: { de: 'Relais-Modul GND + LEDs + Taster', en: 'Relay Module GND + LEDs + Buttons', sl: 'Relejni modul GND + LED-i + Tipke' },
      color: 'Schwarz'
    },
    {
      from: { de: 'Relais COM', en: 'Relay COM', sl: 'Rele COM' },
      to: { de: 'Koax-Relais', en: 'Coax Relay', sl: 'Koaksialni rele' },
      notes: { de: 'HF-Pfad umschalten', en: 'Switch RF path', sl: 'Preklopi RF pot' }
    },
  ],

  customizationSuggestions: [
    {
      de: 'Band-Decoder für automatische Umschaltung',
      en: 'Band decoder for automatic switching',
      sl: 'Dekoder pasu za samodejno preklapljanje'
    },
    {
      de: 'CAT/CI-V Steuerung vom Transceiver',
      en: 'CAT/CI-V control from transceiver',
      sl: 'CAT/CI-V krmiljenje iz oddajnika'
    },
    {
      de: 'OLED-Display mit Antennennamen',
      en: 'OLED display with antenna names',
      sl: 'OLED zaslon z imeni anten'
    },
    {
      de: 'Auf 6 oder 8 Antennen erweitern',
      en: 'Expand to 6 or 8 antennas',
      sl: 'Razširi na 6 ali 8 anten'
    },
    {
      de: 'Fernbedienung über WiFi (ESP32)',
      en: 'Remote control via WiFi (ESP32)',
      sl: 'Daljinsko krmiljenje preko WiFi (ESP32)'
    },
    {
      de: 'SWR-Warnung vor dem Umschalten',
      en: 'SWR warning before switching',
      sl: 'SWR opozorilo pred preklopom'
    },
  ],

  externalLinks: [
    {
      title: {
        de: 'Relais-Schaltung Grundlagen',
        en: 'Relay Circuit Basics',
        sl: 'Osnove relejnih vezij'
      },
      url: 'https://www.arduino.cc/en/Tutorial/BuiltInExamples/Relay'
    },
  ],
};
