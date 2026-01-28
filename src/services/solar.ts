import type { SolarData } from '../types';
import * as api from './api';

// Cache for solar data
let cachedSolarData: SolarData | null = null;
let lastFetchTime: number = 0;
const CACHE_DURATION = 15 * 60 * 1000; // 15 minutes

/**
 * Get current solar data (with caching)
 */
export async function getSolarData(): Promise<SolarData> {
  const now = Date.now();

  // Return cached data if still valid
  if (cachedSolarData && (now - lastFetchTime) < CACHE_DURATION) {
    return cachedSolarData;
  }

  // Try to fetch from backend
  try {
    const data = await api.getSolarData();
    cachedSolarData = {
      ...data,
      updatedAt: new Date(data.updatedAt),
    };
    lastFetchTime = now;
    return cachedSolarData;
  } catch (error) {
    console.error('Error fetching solar data:', error);

    // Return cached data if available, otherwise simulated
    if (cachedSolarData) {
      return cachedSolarData;
    }

    return simulateSolarData();
  }
}

/**
 * Simulate realistic solar data when API is unavailable
 */
function simulateSolarData(): SolarData {
  const hour = new Date().getUTCHours();
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);

  const baseSFI = 130 + Math.sin(dayOfYear * 2 * Math.PI / 27) * 30;
  const sfi = Math.round(baseSFI + (Math.random() - 0.5) * 20);
  const baseK = 2 + Math.sin(hour * Math.PI / 12) * 1;
  const kIndex = Math.round(Math.max(0, Math.min(9, baseK + (Math.random() - 0.5) * 2)));
  const aIndex = Math.round(kIndex * 4 + (Math.random() - 0.5) * 5);
  const sunspots = Math.round((sfi - 60) * 0.8 + (Math.random() - 0.5) * 20);

  const xrayLevels = ['A1.0', 'A5.0', 'B1.0', 'B2.0', 'B5.0', 'C1.0'];
  const xrayIndex = Math.min(xrayLevels.length - 1, Math.floor(kIndex / 2));
  const xrayFlux = xrayLevels[xrayIndex];

  return {
    sfi: Math.max(60, Math.min(300, sfi)),
    kIndex: Math.max(0, Math.min(9, kIndex)),
    aIndex: Math.max(0, Math.min(400, aIndex)),
    sunspots: Math.max(0, sunspots),
    xrayFlux,
    updatedAt: new Date(),
  };
}

/**
 * Get condition quality indicator
 */
export function getConditionQuality(solarData: SolarData): {
  overall: 'excellent' | 'good' | 'moderate' | 'poor';
  hf: 'excellent' | 'good' | 'moderate' | 'poor';
  vhf: 'excellent' | 'good' | 'moderate' | 'poor';
} {
  let hf: 'excellent' | 'good' | 'moderate' | 'poor' = 'moderate';
  if (solarData.sfi > 150 && solarData.kIndex <= 2) {
    hf = 'excellent';
  } else if (solarData.sfi > 100 && solarData.kIndex <= 3) {
    hf = 'good';
  } else if (solarData.kIndex >= 5) {
    hf = 'poor';
  }

  let vhf: 'excellent' | 'good' | 'moderate' | 'poor' = 'moderate';
  if (solarData.sfi > 180) {
    vhf = 'good';
  } else if (solarData.kIndex >= 4) {
    vhf = 'poor';
  }

  const overall = hf === 'excellent' || hf === 'good' ? hf : 'moderate';

  return { overall, hf, vhf };
}

/**
 * Get trend indicator based on historical data
 */
export function getTrend(current: SolarData, previous?: SolarData): 'improving' | 'stable' | 'declining' {
  if (!previous) return 'stable';

  const sfiDiff = current.sfi - previous.sfi;
  const kDiff = current.kIndex - previous.kIndex;

  if (sfiDiff > 10 && kDiff <= 0) return 'improving';
  if (sfiDiff < -10 || kDiff > 1) return 'declining';
  return 'stable';
}
