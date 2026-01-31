import { cwKeyerBasic } from './cw-keyer-basic';
import { swrMeter } from './swr-meter';
import { aprsTracker } from './aprs-tracker';
import { antennaSwitch } from './antenna-switch';
import type { HamProject } from '../../types/projects';

export const ALL_PROJECTS: HamProject[] = [
  cwKeyerBasic,
  swrMeter,
  aprsTracker,
  antennaSwitch,
];

export function getProjectById(id: string): HamProject | undefined {
  return ALL_PROJECTS.find(p => p.id === id);
}

export function getProjectsByCategory(category: string): HamProject[] {
  if (category === 'all') return ALL_PROJECTS;
  return ALL_PROJECTS.filter(p => p.category === category);
}

export { cwKeyerBasic, swrMeter, aprsTracker, antennaSwitch };
