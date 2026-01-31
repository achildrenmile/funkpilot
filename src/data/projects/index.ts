// Existing projects
import { cwKeyerBasic } from './cw-keyer-basic';
import { swrMeter } from './swr-meter';
import { aprsTracker } from './aprs-tracker';
import { antennaSwitch } from './antenna-switch';

// CW/Morse projects
import { morseDecoder } from './morse-decoder';
import { morseTrainer } from './morse-trainer';
import { beaconKeyer } from './beacon-keyer';

// Measurement projects
import { frequencyCounter } from './frequency-counter';
import { dummyLoad } from './dummy-load';
import { fieldStrengthMeter } from './field-strength-meter';

// Audio/NF projects
import { cwAudioFilter } from './cw-audio-filter';
import { nfAmplifier } from './nf-amplifier';
import { voxCircuit } from './vox-circuit';

// Digital/APRS projects
import { digimodeInterface } from './digimode-interface';
import { ft8Sync } from './ft8-sync';
import { simpleTnc } from './simple-tnc';

// Control projects
import { rotorController } from './rotor-controller';
import { pttInterface } from './ptt-interface';
import { bandfilterSwitch } from './bandfilter-switch';

// Mesh/LoRa Guides
import { meshtasticGettingStarted } from './meshtastic-getting-started';
import { meshcomGettingStarted } from './meshcom-getting-started';
import { meshcoreGettingStarted } from './meshcore-getting-started';

import type { HamProject } from '../../types/projects';

export const ALL_PROJECTS: HamProject[] = [
  // Mesh/LoRa Guides (am Anfang für Sichtbarkeit)
  meshtasticGettingStarted,
  meshcomGettingStarted,
  meshcoreGettingStarted,

  // CW/Morse
  cwKeyerBasic,
  morseDecoder,
  morseTrainer,
  beaconKeyer,

  // Measurement
  swrMeter,
  frequencyCounter,
  dummyLoad,
  fieldStrengthMeter,

  // Audio/NF
  cwAudioFilter,
  nfAmplifier,
  voxCircuit,

  // Digital/APRS
  aprsTracker,
  digimodeInterface,
  ft8Sync,
  simpleTnc,

  // Control
  antennaSwitch,
  rotorController,
  pttInterface,
  bandfilterSwitch,
];

export function getProjectById(id: string): HamProject | undefined {
  return ALL_PROJECTS.find(p => p.id === id);
}

export function getProjectsByCategory(category: string): HamProject[] {
  if (category === 'all') return ALL_PROJECTS;
  return ALL_PROJECTS.filter(p => p.category === category);
}

// Re-export all projects
export {
  // Mesh/LoRa Guides
  meshtasticGettingStarted,
  meshcomGettingStarted,
  meshcoreGettingStarted,
  // Existing
  cwKeyerBasic,
  swrMeter,
  aprsTracker,
  antennaSwitch,
  // CW/Morse
  morseDecoder,
  morseTrainer,
  beaconKeyer,
  // Measurement
  frequencyCounter,
  dummyLoad,
  fieldStrengthMeter,
  // Audio/NF
  cwAudioFilter,
  nfAmplifier,
  voxCircuit,
  // Digital
  digimodeInterface,
  ft8Sync,
  simpleTnc,
  // Control
  rotorController,
  pttInterface,
  bandfilterSwitch,
};
