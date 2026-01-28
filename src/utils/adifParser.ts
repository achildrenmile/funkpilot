import type { QSO, LogStats } from '../types';

/**
 * Parse an ADIF field from the content
 */
function parseField(content: string, fieldName: string): string | null {
  const regex = new RegExp(`<${fieldName}:(\\d+)(?::[^>]*)?>([^<]*)`, 'i');
  const match = content.match(regex);
  if (match) {
    const length = parseInt(match[1], 10);
    return match[2].substring(0, length).trim();
  }
  return null;
}

/**
 * Parse ADIF date and time into a Date object
 */
function parseDateTime(dateStr: string | null, timeStr: string | null): Date | null {
  if (!dateStr) return null;

  const year = parseInt(dateStr.substring(0, 4), 10);
  const month = parseInt(dateStr.substring(4, 6), 10) - 1;
  const day = parseInt(dateStr.substring(6, 8), 10);

  let hour = 0, minute = 0, second = 0;
  if (timeStr) {
    hour = parseInt(timeStr.substring(0, 2), 10);
    minute = parseInt(timeStr.substring(2, 4), 10);
    if (timeStr.length >= 6) {
      second = parseInt(timeStr.substring(4, 6), 10);
    }
  }

  return new Date(Date.UTC(year, month, day, hour, minute, second));
}

/**
 * Parse ADIF content into QSO records
 */
export function parseADIF(content: string): QSO[] {
  const qsos: QSO[] = [];

  // Find the header end
  const headerEnd = content.toLowerCase().indexOf('<eoh>');
  const dataContent = headerEnd >= 0 ? content.substring(headerEnd + 5) : content;

  // Split by end-of-record marker
  const records = dataContent.split(/<eor>/i);

  for (const record of records) {
    if (!record.trim()) continue;

    const call = parseField(record, 'CALL');
    if (!call) continue;

    const band = parseField(record, 'BAND');
    const mode = parseField(record, 'MODE');
    const qsoDate = parseField(record, 'QSO_DATE');
    const timeOn = parseField(record, 'TIME_ON');
    const rstSent = parseField(record, 'RST_SENT');
    const rstRcvd = parseField(record, 'RST_RCVD');
    const freq = parseField(record, 'FREQ');
    const country = parseField(record, 'COUNTRY');
    const cqZone = parseField(record, 'CQZ');
    const ituZone = parseField(record, 'ITUZ');
    const gridsquare = parseField(record, 'GRIDSQUARE');
    const comment = parseField(record, 'COMMENT');
    const srx = parseField(record, 'SRX');
    const exchange = parseField(record, 'SRX_STRING') || srx;

    const datetime = parseDateTime(qsoDate, timeOn);

    qsos.push({
      call: call.toUpperCase(),
      band: band?.toLowerCase() || 'unknown',
      freq: freq ? parseFloat(freq) : undefined,
      mode: mode?.toUpperCase() || 'SSB',
      datetime: datetime || new Date(),
      rstSent: rstSent || '59',
      rstRcvd: rstRcvd || '59',
      exchange: exchange || undefined,
      country: country || undefined,
      cqZone: cqZone ? parseInt(cqZone, 10) : undefined,
      ituZone: ituZone ? parseInt(ituZone, 10) : undefined,
      gridsquare: gridsquare || undefined,
      comment: comment || undefined,
    });
  }

  // Sort by datetime
  qsos.sort((a, b) => a.datetime.getTime() - b.datetime.getTime());

  return qsos;
}

/**
 * Calculate statistics from parsed QSOs
 */
export function calculateStats(qsos: QSO[]): LogStats {
  const uniqueCalls = new Set<string>();
  const qsosByBand: Record<string, number> = {};
  const qsosByMode: Record<string, number> = {};
  const qsosByHour: Record<number, number> = {};
  const countries = new Set<string>();
  const cqZones = new Set<number>();
  const ituZones = new Set<number>();
  const seenQsos = new Set<string>();
  let dupes = 0;

  for (const qso of qsos) {
    // Track unique callsigns
    uniqueCalls.add(qso.call);

    // Track by band
    qsosByBand[qso.band] = (qsosByBand[qso.band] || 0) + 1;

    // Track by mode
    qsosByMode[qso.mode] = (qsosByMode[qso.mode] || 0) + 1;

    // Track by hour of day (UTC)
    const hour = qso.datetime.getUTCHours();
    qsosByHour[hour] = (qsosByHour[hour] || 0) + 1;

    // Track countries
    if (qso.country) {
      countries.add(qso.country);
    }

    // Track zones
    if (qso.cqZone) cqZones.add(qso.cqZone);
    if (qso.ituZone) ituZones.add(qso.ituZone);

    // Check for dupes (same call + band + mode)
    const qsoKey = `${qso.call}-${qso.band}-${qso.mode}`;
    if (seenQsos.has(qsoKey)) {
      dupes++;
    } else {
      seenQsos.add(qsoKey);
    }
  }

  // Calculate rate per hour over the contest period
  const ratePerHour: number[] = [];
  if (qsos.length > 0) {
    const startTime = qsos[0].datetime;
    const endTime = qsos[qsos.length - 1].datetime;
    const totalHours = Math.ceil((endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60));

    for (let h = 0; h < totalHours; h++) {
      const hourStart = new Date(startTime.getTime() + h * 60 * 60 * 1000);
      const hourEnd = new Date(hourStart.getTime() + 60 * 60 * 1000);

      const qsosInHour = qsos.filter(
        q => q.datetime >= hourStart && q.datetime < hourEnd
      ).length;

      ratePerHour.push(qsosInHour);
    }
  }

  // Calculate operating time (gaps > 30 min don't count)
  let operatingTime = 0;
  for (let i = 1; i < qsos.length; i++) {
    const gap = (qsos[i].datetime.getTime() - qsos[i - 1].datetime.getTime()) / (1000 * 60);
    if (gap <= 30) {
      operatingTime += gap;
    }
  }

  return {
    totalQsos: qsos.length,
    uniqueCallsigns: uniqueCalls.size,
    qsosByBand,
    qsosByMode,
    qsosByHour,
    countries: Array.from(countries).sort(),
    cqZones: Array.from(cqZones).sort((a, b) => a - b),
    ituZones: Array.from(ituZones).sort((a, b) => a - b),
    ratePerHour,
    dupes,
    operatingTime: Math.round(operatingTime),
    startTime: qsos.length > 0 ? qsos[0].datetime : null,
    endTime: qsos.length > 0 ? qsos[qsos.length - 1].datetime : null,
  };
}

/**
 * Generate ADIF export from QSOs
 */
export function generateADIF(qsos: QSO[], header?: Record<string, string>): string {
  let adif = '';

  // Add header
  adif += `Generated by FunkPilot\n`;
  adif += `<ADIF_VER:5>3.1.4\n`;
  adif += `<PROGRAMID:9>FunkPilot\n`;
  adif += `<PROGRAMVERSION:5>1.0.0\n`;

  if (header) {
    for (const [key, value] of Object.entries(header)) {
      adif += `<${key.toUpperCase()}:${value.length}>${value}\n`;
    }
  }

  adif += `<EOH>\n\n`;

  // Add QSO records
  for (const qso of qsos) {
    const dateStr = qso.datetime.toISOString().slice(0, 10).replace(/-/g, '');
    const timeStr = qso.datetime.toISOString().slice(11, 19).replace(/:/g, '');

    adif += `<CALL:${qso.call.length}>${qso.call}`;
    adif += `<BAND:${qso.band.length}>${qso.band}`;
    adif += `<MODE:${qso.mode.length}>${qso.mode}`;
    adif += `<QSO_DATE:8>${dateStr}`;
    adif += `<TIME_ON:6>${timeStr}`;
    adif += `<RST_SENT:${qso.rstSent.length}>${qso.rstSent}`;
    adif += `<RST_RCVD:${qso.rstRcvd.length}>${qso.rstRcvd}`;

    if (qso.freq) {
      const freqStr = qso.freq.toFixed(6);
      adif += `<FREQ:${freqStr.length}>${freqStr}`;
    }
    if (qso.country) {
      adif += `<COUNTRY:${qso.country.length}>${qso.country}`;
    }
    if (qso.cqZone) {
      const zoneStr = qso.cqZone.toString();
      adif += `<CQZ:${zoneStr.length}>${zoneStr}`;
    }
    if (qso.gridsquare) {
      adif += `<GRIDSQUARE:${qso.gridsquare.length}>${qso.gridsquare}`;
    }
    if (qso.exchange) {
      adif += `<SRX_STRING:${qso.exchange.length}>${qso.exchange}`;
    }

    adif += `<EOR>\n`;
  }

  return adif;
}
