import { describe, it, expect } from 'vitest';
import {
  callToPhonetic,
  numberToSpoken,
  processTemplate,
  PHONETIC_ALPHABET,
} from './phonetic';

describe('phonetic.ts', () => {
  describe('PHONETIC_ALPHABET', () => {
    it('should contain all 26 letters', () => {
      const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      for (const letter of letters) {
        expect(PHONETIC_ALPHABET[letter]).toBeDefined();
      }
    });

    it('should contain all 10 digits', () => {
      for (let i = 0; i <= 9; i++) {
        expect(PHONETIC_ALPHABET[i.toString()]).toBeDefined();
      }
    });

    it('should contain stroke for /', () => {
      expect(PHONETIC_ALPHABET['/']).toBe('Stroke');
    });
  });

  describe('callToPhonetic', () => {
    it('should convert OE8YML correctly', () => {
      expect(callToPhonetic('OE8YML')).toBe('Oscar Echo Eight Yankee Mike Lima');
    });

    it('should convert DL1ABC correctly', () => {
      expect(callToPhonetic('DL1ABC')).toBe('Delta Lima One Alpha Bravo Charlie');
    });

    it('should handle portable callsigns with /', () => {
      expect(callToPhonetic('OE8YML/P')).toBe('Oscar Echo Eight Yankee Mike Lima Stroke Papa');
    });

    it('should convert lowercase to uppercase', () => {
      expect(callToPhonetic('oe8yml')).toBe('Oscar Echo Eight Yankee Mike Lima');
    });

    it('should handle mixed case', () => {
      expect(callToPhonetic('Oe8Yml')).toBe('Oscar Echo Eight Yankee Mike Lima');
    });

    it('should handle empty string', () => {
      expect(callToPhonetic('')).toBe('');
    });

    it('should preserve unknown characters', () => {
      expect(callToPhonetic('OE-8')).toBe('Oscar Echo - Eight');
    });
  });

  describe('numberToSpoken', () => {
    it('should convert 599 correctly', () => {
      expect(numberToSpoken('599')).toBe('Five Nine Nine');
    });

    it('should convert 59 correctly', () => {
      expect(numberToSpoken('59')).toBe('Five Nine');
    });

    it('should convert zone 15 correctly', () => {
      expect(numberToSpoken('15')).toBe('One Five');
    });

    it('should convert serial 001 correctly', () => {
      expect(numberToSpoken('001')).toBe('Zero Zero One');
    });

    it('should handle empty string', () => {
      expect(numberToSpoken('')).toBe('');
    });
  });

  describe('processTemplate', () => {
    it('should replace {CALL} with callsign', () => {
      const result = processTemplate('CQ CQ {CALL}', { CALL: 'OE8YML' }, false);
      expect(result).toBe('CQ CQ OE8YML');
    });

    it('should replace {CALL_PHONETIC} with phonetic callsign', () => {
      const result = processTemplate('CQ {CALL_PHONETIC}', { CALL: 'OE8YML' }, true);
      expect(result).toBe('CQ Oscar Echo Eight Yankee Mike Lima');
    });

    it('should replace {RST} with spoken numbers', () => {
      const result = processTemplate('RST {RST}', { RST: '599' });
      expect(result).toBe('RST Five Nine Nine');
    });

    it('should replace {ZONE} with spoken zone', () => {
      const result = processTemplate('Zone {ZONE}', { ZONE: '15' });
      expect(result).toBe('Zone One Five');
    });

    it('should replace {SERIAL} with spoken serial', () => {
      const result = processTemplate('Number {SERIAL}', { SERIAL: '042' });
      expect(result).toBe('Number Zero Four Two');
    });

    it('should handle multiple variables', () => {
      const result = processTemplate(
        '{CALL} your report is {RST}',
        { CALL: 'DL1ABC', RST: '59' },
        false
      );
      expect(result).toBe('DL1ABC your report is Five Nine');
    });

    it('should handle contest exchange template', () => {
      const result = processTemplate(
        'CQ Contest {CALL_PHONETIC} CQ',
        { CALL: 'OE8YML' },
        true
      );
      expect(result).toBe('CQ Contest Oscar Echo Eight Yankee Mike Lima CQ');
    });

    it('should not replace {CALL_PHONETIC} when usePhonetic is false', () => {
      const result = processTemplate(
        '{CALL_PHONETIC}',
        { CALL: 'OE8YML' },
        false
      );
      expect(result).toBe('OE8YML');
    });
  });
});
