import { describe, it, expect } from 'vitest';
import {
  locatorToLatLng,
  getSolarPosition,
  isGreyline,
  formatLocator,
} from './locator';

describe('locator.ts', () => {
  describe('locatorToLatLng', () => {
    it('should convert JN77 (Austria) correctly', () => {
      const result = locatorToLatLng('JN77');
      expect(result).not.toBeNull();
      expect(result!.lat).toBeCloseTo(47.5, 0);
      expect(result!.lng).toBeCloseTo(15, 0);
    });

    it('should convert JN77TO (Kärnten) correctly', () => {
      const result = locatorToLatLng('JN77TO');
      expect(result).not.toBeNull();
      // Kärnten is around lat 46.7, lng 13.8
      expect(result!.lat).toBeGreaterThan(46);
      expect(result!.lat).toBeLessThan(48);
      expect(result!.lng).toBeGreaterThan(13);
      expect(result!.lng).toBeLessThan(16);
    });

    it('should convert JO62 (Berlin) correctly', () => {
      const result = locatorToLatLng('JO62');
      expect(result).not.toBeNull();
      expect(result!.lat).toBeCloseTo(52.5, 0);
      expect(result!.lng).toBeCloseTo(13, 0);
    });

    it('should convert FN31 (New York) correctly', () => {
      const result = locatorToLatLng('FN31');
      expect(result).not.toBeNull();
      expect(result!.lat).toBeCloseTo(41.5, 0);
      expect(result!.lng).toBeCloseTo(-73, 0);
    });

    it('should handle lowercase input', () => {
      const result = locatorToLatLng('jn77to');
      expect(result).not.toBeNull();
    });

    it('should return null for empty string', () => {
      expect(locatorToLatLng('')).toBeNull();
    });

    it('should return null for too short input', () => {
      expect(locatorToLatLng('JN7')).toBeNull();
    });

    it('should return null for invalid field characters', () => {
      expect(locatorToLatLng('ZZ77')).toBeNull();
    });

    it('should return null for invalid square characters', () => {
      expect(locatorToLatLng('JNAB')).toBeNull();
    });

    it('should handle 4-character locator', () => {
      const result = locatorToLatLng('JN77');
      expect(result).not.toBeNull();
    });

    it('should handle 6-character locator', () => {
      const result = locatorToLatLng('JN77TO');
      expect(result).not.toBeNull();
    });
  });

  describe('getSolarPosition', () => {
    it('should return day for noon in summer', () => {
      // July 15th, 12:00 UTC, Vienna (48.2, 16.4)
      const date = new Date('2025-07-15T12:00:00Z');
      const result = getSolarPosition(48.2, 16.4, date);
      expect(result.isDay).toBe(true);
      expect(result.solarElevation).toBeGreaterThan(50);
    });

    it('should return night for midnight', () => {
      // July 15th, 00:00 UTC, Vienna
      const date = new Date('2025-07-15T00:00:00Z');
      const result = getSolarPosition(48.2, 16.4, date);
      expect(result.isNight).toBe(true);
    });

    it('should return twilight near sunrise/sunset', () => {
      // Test at a time that should be twilight (around 5 AM local in summer)
      const date = new Date('2025-07-15T03:30:00Z'); // ~5:30 local time
      const result = getSolarPosition(48.2, 16.4, date);
      expect(result.isTwilight).toBe(true);
    });

    it('should calculate local solar time correctly', () => {
      // At 12:00 UTC, local solar time at 15° East should be ~13:00
      const date = new Date('2025-06-21T12:00:00Z');
      const result = getSolarPosition(48.2, 15, date);
      expect(result.localSolarTime).toBeCloseTo(13, 0);
    });
  });

  describe('isGreyline', () => {
    it('should return true near sunrise', () => {
      // Early morning, sun near horizon
      const date = new Date('2025-03-21T05:00:00Z'); // Equinox
      const result = isGreyline(48.2, 16.4, date);
      // At equinox, sunrise in Vienna is around 6:00 local (5:00 UTC)
      expect(result).toBe(true);
    });

    it('should return false at noon', () => {
      const date = new Date('2025-06-21T11:00:00Z');
      const result = isGreyline(48.2, 16.4, date);
      expect(result).toBe(false);
    });

    it('should return false at midnight', () => {
      const date = new Date('2025-06-21T23:00:00Z');
      const result = isGreyline(48.2, 16.4, date);
      expect(result).toBe(false);
    });
  });

  describe('formatLocator', () => {
    it('should uppercase and format 4-char locator', () => {
      expect(formatLocator('jn77')).toBe('JN77');
    });

    it('should uppercase and format 6-char locator', () => {
      expect(formatLocator('jn77to')).toBe('JN77TO');
    });

    it('should truncate longer locators to 6 chars', () => {
      expect(formatLocator('JN77TOABC')).toBe('JN77TO');
    });

    it('should handle empty string', () => {
      expect(formatLocator('')).toBe('');
    });

    it('should remove invalid characters', () => {
      expect(formatLocator('JN-77')).toBe('JN77');
    });

    it('should handle short input', () => {
      expect(formatLocator('JN')).toBe('JN');
    });
  });
});
