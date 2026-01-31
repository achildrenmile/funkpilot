import { describe, it, expect } from 'vitest';
import { parseADIF, calculateStats, generateADIF } from './adifParser';
import type { QSO } from '../types';

describe('adifParser.ts', () => {
  describe('parseADIF', () => {
    it('should parse a simple QSO record', () => {
      const adif = `
        <CALL:6>DL1ABC<BAND:3>20m<MODE:3>SSB<QSO_DATE:8>20250115<TIME_ON:6>120000<RST_SENT:2>59<RST_RCVD:2>59<EOR>
      `;
      const qsos = parseADIF(adif);
      expect(qsos).toHaveLength(1);
      expect(qsos[0].call).toBe('DL1ABC');
      expect(qsos[0].band).toBe('20m');
      expect(qsos[0].mode).toBe('SSB');
      expect(qsos[0].rstSent).toBe('59');
      expect(qsos[0].rstRcvd).toBe('59');
    });

    it('should skip header when present', () => {
      const adif = `
        ADIF Export from FunkPilot
        <ADIF_VER:5>3.1.4
        <PROGRAMID:9>FunkPilot
        <EOH>
        <CALL:6>OE8YML<BAND:3>40m<MODE:2>CW<QSO_DATE:8>20250120<TIME_ON:4>1430<EOR>
      `;
      const qsos = parseADIF(adif);
      expect(qsos).toHaveLength(1);
      expect(qsos[0].call).toBe('OE8YML');
    });

    it('should parse multiple QSO records', () => {
      const adif = `
        <EOH>
        <CALL:6>DL1ABC<BAND:3>20m<MODE:3>SSB<QSO_DATE:8>20250115<TIME_ON:4>1200<EOR>
        <CALL:5>G3XYZ<BAND:3>40m<MODE:2>CW<QSO_DATE:8>20250115<TIME_ON:4>1230<EOR>
        <CALL:6>W1TEST<BAND:3>15m<MODE:3>FT8<QSO_DATE:8>20250115<TIME_ON:4>1300<EOR>
      `;
      const qsos = parseADIF(adif);
      expect(qsos).toHaveLength(3);
      expect(qsos[0].call).toBe('DL1ABC');
      expect(qsos[1].call).toBe('G3XYZ');
      expect(qsos[2].call).toBe('W1TEST');
    });

    it('should parse frequency field', () => {
      const adif = `<CALL:6>DL1ABC<BAND:3>20m<FREQ:8>14.25000<MODE:3>SSB<QSO_DATE:8>20250115<TIME_ON:4>1200<EOR>`;
      const qsos = parseADIF(adif);
      expect(qsos[0].freq).toBeCloseTo(14.25, 2);
    });

    it('should parse country field', () => {
      const adif = `<CALL:6>DL1ABC<BAND:3>20m<MODE:3>SSB<COUNTRY:7>Germany<QSO_DATE:8>20250115<TIME_ON:4>1200<EOR>`;
      const qsos = parseADIF(adif);
      expect(qsos[0].country).toBe('Germany');
    });

    it('should parse CQ zone field', () => {
      const adif = `<CALL:6>DL1ABC<BAND:3>20m<MODE:3>SSB<CQZ:2>14<QSO_DATE:8>20250115<TIME_ON:4>1200<EOR>`;
      const qsos = parseADIF(adif);
      expect(qsos[0].cqZone).toBe(14);
    });

    it('should parse gridsquare field', () => {
      const adif = `<CALL:6>DL1ABC<BAND:3>20m<MODE:3>SSB<GRIDSQUARE:6>JO62QM<QSO_DATE:8>20250115<TIME_ON:4>1200<EOR>`;
      const qsos = parseADIF(adif);
      expect(qsos[0].gridsquare).toBe('JO62QM');
    });

    it('should parse exchange fields', () => {
      const adif = `<CALL:6>DL1ABC<BAND:3>20m<MODE:3>SSB<SRX_STRING:4>0015<QSO_DATE:8>20250115<TIME_ON:4>1200<EOR>`;
      const qsos = parseADIF(adif);
      expect(qsos[0].exchange).toBe('0015');
    });

    it('should skip records without callsign', () => {
      const adif = `
        <BAND:3>20m<MODE:3>SSB<QSO_DATE:8>20250115<TIME_ON:4>1200<EOR>
        <CALL:6>DL1ABC<BAND:3>20m<MODE:3>SSB<QSO_DATE:8>20250115<TIME_ON:4>1230<EOR>
      `;
      const qsos = parseADIF(adif);
      expect(qsos).toHaveLength(1);
    });

    it('should handle case-insensitive field names', () => {
      const adif = `<call:6>DL1ABC<BAND:3>20m<Mode:3>SSB<qso_date:8>20250115<time_on:4>1200<eor>`;
      const qsos = parseADIF(adif);
      expect(qsos).toHaveLength(1);
      expect(qsos[0].call).toBe('DL1ABC');
    });

    it('should sort QSOs by datetime', () => {
      const adif = `
        <CALL:1>B<BAND:3>20m<MODE:3>SSB<QSO_DATE:8>20250115<TIME_ON:4>1400<EOR>
        <CALL:1>A<BAND:3>20m<MODE:3>SSB<QSO_DATE:8>20250115<TIME_ON:4>1200<EOR>
        <CALL:1>C<BAND:3>20m<MODE:3>SSB<QSO_DATE:8>20250115<TIME_ON:4>1600<EOR>
      `;
      const qsos = parseADIF(adif);
      expect(qsos[0].call).toBe('A');
      expect(qsos[1].call).toBe('B');
      expect(qsos[2].call).toBe('C');
    });

    it('should default mode to SSB if missing', () => {
      const adif = `<CALL:6>DL1ABC<BAND:3>20m<QSO_DATE:8>20250115<TIME_ON:4>1200<EOR>`;
      const qsos = parseADIF(adif);
      expect(qsos[0].mode).toBe('SSB');
    });

    it('should default RST to 59 if missing', () => {
      const adif = `<CALL:6>DL1ABC<BAND:3>20m<MODE:3>SSB<QSO_DATE:8>20250115<TIME_ON:4>1200<EOR>`;
      const qsos = parseADIF(adif);
      expect(qsos[0].rstSent).toBe('59');
      expect(qsos[0].rstRcvd).toBe('59');
    });
  });

  describe('calculateStats', () => {
    const sampleQSOs: QSO[] = [
      { call: 'DL1ABC', band: '20m', mode: 'SSB', datetime: new Date('2025-01-15T12:00:00Z'), rstSent: '59', rstRcvd: '59', country: 'Germany', cqZone: 14 },
      { call: 'G3XYZ', band: '40m', mode: 'CW', datetime: new Date('2025-01-15T12:30:00Z'), rstSent: '599', rstRcvd: '599', country: 'England', cqZone: 14 },
      { call: 'W1TEST', band: '20m', mode: 'SSB', datetime: new Date('2025-01-15T13:00:00Z'), rstSent: '59', rstRcvd: '59', country: 'United States', cqZone: 5 },
      { call: 'DL1ABC', band: '40m', mode: 'SSB', datetime: new Date('2025-01-15T13:30:00Z'), rstSent: '59', rstRcvd: '59', country: 'Germany', cqZone: 14 },
      { call: 'DL1ABC', band: '20m', mode: 'SSB', datetime: new Date('2025-01-15T14:00:00Z'), rstSent: '59', rstRcvd: '59', country: 'Germany', cqZone: 14 }, // Dupe
    ];

    it('should count total QSOs', () => {
      const stats = calculateStats(sampleQSOs);
      expect(stats.totalQsos).toBe(5);
    });

    it('should count unique callsigns', () => {
      const stats = calculateStats(sampleQSOs);
      expect(stats.uniqueCallsigns).toBe(3); // DL1ABC, G3XYZ, W1TEST
    });

    it('should count QSOs by band', () => {
      const stats = calculateStats(sampleQSOs);
      expect(stats.qsosByBand['20m']).toBe(3);
      expect(stats.qsosByBand['40m']).toBe(2);
    });

    it('should count QSOs by mode', () => {
      const stats = calculateStats(sampleQSOs);
      expect(stats.qsosByMode['SSB']).toBe(4);
      expect(stats.qsosByMode['CW']).toBe(1);
    });

    it('should track countries', () => {
      const stats = calculateStats(sampleQSOs);
      expect(stats.countries).toContain('Germany');
      expect(stats.countries).toContain('England');
      expect(stats.countries).toContain('United States');
      expect(stats.countries).toHaveLength(3);
    });

    it('should track CQ zones', () => {
      const stats = calculateStats(sampleQSOs);
      expect(stats.cqZones).toContain(14);
      expect(stats.cqZones).toContain(5);
      expect(stats.cqZones).toHaveLength(2);
    });

    it('should detect duplicates', () => {
      const stats = calculateStats(sampleQSOs);
      expect(stats.dupes).toBe(1); // DL1ABC on 20m SSB appears twice
    });

    it('should calculate operating time', () => {
      const stats = calculateStats(sampleQSOs);
      // 2 hours from first to last QSO, all within 30 min gaps
      expect(stats.operatingTime).toBeGreaterThan(0);
    });

    it('should track start and end times', () => {
      const stats = calculateStats(sampleQSOs);
      expect(stats.startTime).toEqual(new Date('2025-01-15T12:00:00Z'));
      expect(stats.endTime).toEqual(new Date('2025-01-15T14:00:00Z'));
    });

    it('should handle empty QSO list', () => {
      const stats = calculateStats([]);
      expect(stats.totalQsos).toBe(0);
      expect(stats.uniqueCallsigns).toBe(0);
      expect(stats.startTime).toBeNull();
      expect(stats.endTime).toBeNull();
    });

    it('should calculate rate per hour', () => {
      const stats = calculateStats(sampleQSOs);
      // QSOs from 12:00 to 14:00 = 2 hours (ceiling)
      expect(stats.ratePerHour.length).toBeGreaterThan(0);
      // Rate per hour should contain reasonable values
      expect(stats.ratePerHour.every(rate => rate >= 0)).toBe(true);
    });
  });

  describe('generateADIF', () => {
    const qso: QSO = {
      call: 'DL1ABC',
      band: '20m',
      mode: 'SSB',
      datetime: new Date('2025-01-15T12:30:45Z'),
      rstSent: '59',
      rstRcvd: '59',
      freq: 14.255,
      country: 'Germany',
      cqZone: 14,
      gridsquare: 'JO62QM',
      exchange: '0015',
    };

    it('should generate valid ADIF header', () => {
      const adif = generateADIF([qso]);
      expect(adif).toContain('<ADIF_VER:5>3.1.4');
      expect(adif).toContain('<PROGRAMID:9>FunkPilot');
      expect(adif).toContain('<EOH>');
    });

    it('should generate callsign field', () => {
      const adif = generateADIF([qso]);
      expect(adif).toContain('<CALL:6>DL1ABC');
    });

    it('should generate band field', () => {
      const adif = generateADIF([qso]);
      expect(adif).toContain('<BAND:3>20m');
    });

    it('should generate mode field', () => {
      const adif = generateADIF([qso]);
      expect(adif).toContain('<MODE:3>SSB');
    });

    it('should generate date field', () => {
      const adif = generateADIF([qso]);
      expect(adif).toContain('<QSO_DATE:8>20250115');
    });

    it('should generate time field', () => {
      const adif = generateADIF([qso]);
      expect(adif).toContain('<TIME_ON:6>123045');
    });

    it('should generate frequency field', () => {
      const adif = generateADIF([qso]);
      expect(adif).toContain('<FREQ:');
      expect(adif).toContain('14.255');
    });

    it('should generate country field', () => {
      const adif = generateADIF([qso]);
      expect(adif).toContain('<COUNTRY:7>Germany');
    });

    it('should generate CQ zone field', () => {
      const adif = generateADIF([qso]);
      expect(adif).toContain('<CQZ:2>14');
    });

    it('should generate gridsquare field', () => {
      const adif = generateADIF([qso]);
      expect(adif).toContain('<GRIDSQUARE:6>JO62QM');
    });

    it('should generate exchange field', () => {
      const adif = generateADIF([qso]);
      expect(adif).toContain('<SRX_STRING:4>0015');
    });

    it('should end record with EOR', () => {
      const adif = generateADIF([qso]);
      expect(adif).toContain('<EOR>');
    });

    it('should roundtrip: parse generated ADIF', () => {
      const adif = generateADIF([qso]);
      const parsed = parseADIF(adif);
      expect(parsed).toHaveLength(1);
      expect(parsed[0].call).toBe(qso.call);
      expect(parsed[0].band).toBe(qso.band);
      expect(parsed[0].mode).toBe(qso.mode);
    });
  });
});
