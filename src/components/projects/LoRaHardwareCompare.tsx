import { useState, useMemo } from 'react';
import { Filter, Check, X, ChevronDown, ChevronUp } from 'lucide-react';

interface LoRaDevice {
  id: string;
  name: string;
  brand: string;
  price: string;
  priceValue: number;
  hasGPS: boolean;
  hasDisplay: boolean;
  displayType?: string;
  hasBattery: boolean;
  batteryType?: string;
  chip: 'ESP32' | 'nRF52' | 'ESP32-S3';
  loraChip: 'SX1262' | 'SX1276' | 'SX1280' | 'LR1110';
  frequency: '868' | '433' | 'both';
  features: string[];
  useCase: string[];
}

const DEVICES: LoRaDevice[] = [
  {
    id: 't-beam-v1.2',
    name: 'T-Beam v1.2',
    brand: 'LILYGO',
    price: '~35€',
    priceValue: 35,
    hasGPS: true,
    hasDisplay: false,
    hasBattery: true,
    batteryType: '18650',
    chip: 'ESP32',
    loraChip: 'SX1262',
    frequency: '868',
    features: ['WiFi', 'Bluetooth', '18650 Halterung', 'GPS NEO-6M'],
    useCase: ['Allrounder', 'Repeater', 'Portabel'],
  },
  {
    id: 't-deck',
    name: 'T-Deck',
    brand: 'LILYGO',
    price: '~80€',
    priceValue: 80,
    hasGPS: true,
    hasDisplay: true,
    displayType: 'TFT 2.8"',
    hasBattery: true,
    batteryType: 'LiPo',
    chip: 'ESP32-S3',
    loraChip: 'SX1262',
    frequency: '868',
    features: ['Tastatur', 'Touchscreen', 'WiFi', 'Bluetooth', 'Standalone'],
    useCase: ['Handheld', 'Standalone', 'Portabel'],
  },
  {
    id: 't-echo',
    name: 'T-Echo',
    brand: 'LILYGO',
    price: '~60€',
    priceValue: 60,
    hasGPS: true,
    hasDisplay: true,
    displayType: 'E-Paper 1.54"',
    hasBattery: true,
    batteryType: 'LiPo',
    chip: 'nRF52',
    loraChip: 'SX1262',
    frequency: '868',
    features: ['Sehr sparsam', 'E-Paper', 'Kompakt', 'Outdoor-tauglich'],
    useCase: ['Portabel', 'Outdoor', 'Sparsam'],
  },
  {
    id: 'heltec-v3',
    name: 'LoRa V3',
    brand: 'Heltec',
    price: '~25€',
    priceValue: 25,
    hasGPS: false,
    hasDisplay: true,
    displayType: 'OLED 0.96"',
    hasBattery: false,
    chip: 'ESP32-S3',
    loraChip: 'SX1262',
    frequency: '868',
    features: ['Günstig', 'Kompakt', 'WiFi', 'Bluetooth', 'USB-C'],
    useCase: ['Einsteiger', 'Client', 'Basteln'],
  },
  {
    id: 'heltec-tracker',
    name: 'Wireless Tracker',
    brand: 'Heltec',
    price: '~30€',
    priceValue: 30,
    hasGPS: true,
    hasDisplay: true,
    displayType: 'OLED 0.96"',
    hasBattery: true,
    batteryType: 'LiPo',
    chip: 'ESP32-S3',
    loraChip: 'SX1262',
    frequency: '868',
    features: ['GPS', 'Kompakt', 'LiPo', 'WiFi'],
    useCase: ['Tracker', 'Portabel', 'Client'],
  },
  {
    id: 'rak-wisblock',
    name: 'WisBlock Meshtastic',
    brand: 'RAK',
    price: '~60€',
    priceValue: 60,
    hasGPS: true,
    hasDisplay: true,
    displayType: 'OLED',
    hasBattery: true,
    batteryType: 'LiPo',
    chip: 'nRF52',
    loraChip: 'SX1262',
    frequency: '868',
    features: ['Modular', 'Sparsam', 'Solar-Eingang', 'Outdoor'],
    useCase: ['Repeater', 'Outdoor', 'Solar'],
  },
  {
    id: 'rak-repeater',
    name: 'WisMesh Repeater',
    brand: 'RAK',
    price: '~100€',
    priceValue: 100,
    hasGPS: true,
    hasDisplay: false,
    hasBattery: true,
    batteryType: 'LiPo 6400mAh',
    chip: 'nRF52',
    loraChip: 'SX1262',
    frequency: '868',
    features: ['IP67', 'Solar-Panel', 'Fertiggerät', 'Outdoor'],
    useCase: ['Repeater', 'Outdoor', 'Dauerbetrieb'],
  },
  {
    id: 'station-g2',
    name: 'Station G2',
    brand: 'B&Q Consulting',
    price: '~100€',
    priceValue: 100,
    hasGPS: false,
    hasDisplay: false,
    hasBattery: false,
    chip: 'ESP32',
    loraChip: 'SX1262',
    frequency: '868',
    features: ['High Power 1W', 'Robustes Gehäuse', 'Base Station'],
    useCase: ['Repeater', 'HAM', 'High Power'],
  },
  {
    id: 'sensecap-t1000',
    name: 'SenseCAP T1000-E',
    brand: 'Seeed',
    price: '~40€',
    priceValue: 40,
    hasGPS: true,
    hasDisplay: false,
    hasBattery: true,
    batteryType: 'LiPo',
    chip: 'nRF52',
    loraChip: 'LR1110',
    frequency: '868',
    features: ['Card Tracker', 'IP65', 'Kompakt', 'Vorkonfiguriert'],
    useCase: ['Tracker', 'Asset Tracking', 'Portabel'],
  },
];

const USE_CASES = ['Alle', 'Einsteiger', 'Portabel', 'Repeater', 'Outdoor', 'Tracker', 'HAM', 'Solar', 'Handheld'];
const BRANDS = ['Alle', 'LILYGO', 'Heltec', 'RAK', 'B&Q Consulting', 'Seeed'];

export function LoRaHardwareCompare() {
  const [filters, setFilters] = useState({
    useCase: 'Alle',
    brand: 'Alle',
    hasGPS: false,
    hasDisplay: false,
    hasBattery: false,
    maxPrice: 150,
  });
  const [showFilters, setShowFilters] = useState(true);
  const [sortBy, setSortBy] = useState<'price' | 'name'>('price');

  const filteredDevices = useMemo(() => {
    return DEVICES.filter(device => {
      if (filters.useCase !== 'Alle' && !device.useCase.includes(filters.useCase)) return false;
      if (filters.brand !== 'Alle' && device.brand !== filters.brand) return false;
      if (filters.hasGPS && !device.hasGPS) return false;
      if (filters.hasDisplay && !device.hasDisplay) return false;
      if (filters.hasBattery && !device.hasBattery) return false;
      if (device.priceValue > filters.maxPrice) return false;
      return true;
    }).sort((a, b) => {
      if (sortBy === 'price') return a.priceValue - b.priceValue;
      return a.name.localeCompare(b.name);
    });
  }, [filters, sortBy]);

  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-700/50 border-b border-slate-700">
        <h3 className="font-semibold text-slate-100 flex items-center gap-2">
          <Filter className="w-4 h-4 text-sky-400" />
          LoRa Hardware Vergleich
        </h3>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="text-sm text-slate-400 hover:text-slate-200 flex items-center gap-1"
        >
          Filter {showFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="p-4 bg-slate-800/50 border-b border-slate-700 space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Use Case */}
            <div>
              <label className="block text-xs text-slate-400 mb-1">Einsatzzweck</label>
              <select
                value={filters.useCase}
                onChange={(e) => setFilters({ ...filters, useCase: e.target.value })}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-sm text-slate-100"
              >
                {USE_CASES.map(uc => (
                  <option key={uc} value={uc}>{uc}</option>
                ))}
              </select>
            </div>

            {/* Brand */}
            <div>
              <label className="block text-xs text-slate-400 mb-1">Hersteller</label>
              <select
                value={filters.brand}
                onChange={(e) => setFilters({ ...filters, brand: e.target.value })}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-sm text-slate-100"
              >
                {BRANDS.map(b => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>

            {/* Max Price */}
            <div>
              <label className="block text-xs text-slate-400 mb-1">Max. Preis: {filters.maxPrice}€</label>
              <input
                type="range"
                min="20"
                max="150"
                step="10"
                value={filters.maxPrice}
                onChange={(e) => setFilters({ ...filters, maxPrice: parseInt(e.target.value) })}
                className="w-full"
              />
            </div>

            {/* Sort */}
            <div>
              <label className="block text-xs text-slate-400 mb-1">Sortieren</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'price' | 'name')}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-sm text-slate-100"
              >
                <option value="price">Preis aufsteigend</option>
                <option value="name">Name A-Z</option>
              </select>
            </div>
          </div>

          {/* Checkboxes */}
          <div className="flex flex-wrap gap-4">
            <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.hasGPS}
                onChange={(e) => setFilters({ ...filters, hasGPS: e.target.checked })}
                className="rounded bg-slate-700 border-slate-600"
              />
              GPS erforderlich
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.hasDisplay}
                onChange={(e) => setFilters({ ...filters, hasDisplay: e.target.checked })}
                className="rounded bg-slate-700 border-slate-600"
              />
              Display erforderlich
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.hasBattery}
                onChange={(e) => setFilters({ ...filters, hasBattery: e.target.checked })}
                className="rounded bg-slate-700 border-slate-600"
              />
              Akku integriert
            </label>
          </div>
        </div>
      )}

      {/* Results */}
      <div className="p-4">
        <p className="text-sm text-slate-400 mb-4">{filteredDevices.length} Geräte gefunden</p>

        <div className="space-y-4">
          {filteredDevices.map(device => (
            <div
              key={device.id}
              className="bg-slate-700/50 rounded-lg p-4 border border-slate-600 hover:border-slate-500 transition-colors"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs text-slate-400">{device.brand}</span>
                    <span className="text-lg font-semibold text-slate-100">{device.name}</span>
                    <span className="text-lg font-bold text-green-400">{device.price}</span>
                  </div>

                  {/* Features Grid */}
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mt-3 text-xs">
                    <div className="flex items-center gap-1">
                      {device.hasGPS ? <Check className="w-3 h-3 text-green-400" /> : <X className="w-3 h-3 text-slate-500" />}
                      <span className={device.hasGPS ? 'text-slate-200' : 'text-slate-500'}>GPS</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {device.hasDisplay ? <Check className="w-3 h-3 text-green-400" /> : <X className="w-3 h-3 text-slate-500" />}
                      <span className={device.hasDisplay ? 'text-slate-200' : 'text-slate-500'}>
                        {device.displayType || 'Display'}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      {device.hasBattery ? <Check className="w-3 h-3 text-green-400" /> : <X className="w-3 h-3 text-slate-500" />}
                      <span className={device.hasBattery ? 'text-slate-200' : 'text-slate-500'}>
                        {device.batteryType || 'Akku'}
                      </span>
                    </div>
                    <div className="text-slate-300">{device.chip}</div>
                    <div className="text-slate-300">{device.loraChip}</div>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1 mt-3">
                    {device.features.slice(0, 4).map(f => (
                      <span key={f} className="text-xs px-2 py-0.5 bg-slate-600 rounded-full text-slate-300">
                        {f}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Use Cases */}
                <div className="flex flex-wrap gap-1 sm:w-32">
                  {device.useCase.map(uc => (
                    <span key={uc} className="text-xs px-2 py-0.5 bg-sky-900/50 text-sky-300 rounded-full">
                      {uc}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}

          {filteredDevices.length === 0 && (
            <div className="text-center py-8 text-slate-400">
              Keine Geräte gefunden. Versuche andere Filter.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
