import { useState, useMemo } from 'react';
import { Calculator, Radio, Mountain, Building, TreePine, Waves } from 'lucide-react';

interface CalculatorState {
  txPower: number;       // dBm
  txAntennaGain: number; // dBi
  rxAntennaGain: number; // dBi
  frequency: number;     // MHz
  spreadingFactor: number;
  environment: 'los' | 'suburban' | 'urban' | 'forest';
  txHeight: number;      // m
  rxHeight: number;      // m
}

const SPREADING_FACTORS = [
  { sf: 7, sensitivity: -124, name: 'SF7 (schnell, kurz)' },
  { sf: 8, sensitivity: -127, name: 'SF8' },
  { sf: 9, sensitivity: -130, name: 'SF9' },
  { sf: 10, sensitivity: -133, name: 'SF10 (Standard)' },
  { sf: 11, sensitivity: -136, name: 'SF11' },
  { sf: 12, sensitivity: -140, name: 'SF12 (langsam, weit)' },
];

const ENVIRONMENTS = [
  { id: 'los', name: 'Freie Sicht (Berg-Berg)', icon: Mountain, factor: 1.0, color: 'text-green-400' },
  { id: 'suburban', name: 'Vorstadt / Land', icon: TreePine, factor: 0.5, color: 'text-yellow-400' },
  { id: 'urban', name: 'Stadt', icon: Building, factor: 0.25, color: 'text-orange-400' },
  { id: 'forest', name: 'Wald / Hindernisse', icon: Waves, factor: 0.15, color: 'text-red-400' },
];

export function LoRaRangeCalculator() {
  const [state, setState] = useState<CalculatorState>({
    txPower: 14,
    txAntennaGain: 2,
    rxAntennaGain: 2,
    frequency: 868,
    spreadingFactor: 10,
    environment: 'suburban',
    txHeight: 10,
    rxHeight: 1.5,
  });

  const calculation = useMemo(() => {
    // Get sensitivity for SF
    const sfData = SPREADING_FACTORS.find(s => s.sf === state.spreadingFactor) || SPREADING_FACTORS[3];
    const sensitivity = sfData.sensitivity;

    // Link budget
    const linkBudget = state.txPower + state.txAntennaGain + state.rxAntennaGain - sensitivity;

    // Free space path loss formula: FSPL = 20*log10(d) + 20*log10(f) + 32.44
    // Solving for d: d = 10^((FSPL - 20*log10(f) - 32.44) / 20)
    const frequencyTerm = 20 * Math.log10(state.frequency);
    const maxPathLoss = linkBudget;
    const theoreticalDistanceKm = Math.pow(10, (maxPathLoss - frequencyTerm - 32.44) / 20);

    // Apply environment factor
    const envData = ENVIRONMENTS.find(e => e.id === state.environment) || ENVIRONMENTS[1];
    const practicalDistanceKm = theoreticalDistanceKm * envData.factor;

    // Height bonus (simplified)
    const heightFactor = Math.sqrt((state.txHeight + state.rxHeight) / 11.5);
    const adjustedDistanceKm = practicalDistanceKm * heightFactor;

    // Fresnel zone radius at midpoint
    const fresnelRadius = 17.3 * Math.sqrt(adjustedDistanceKm / (state.frequency / 1000));

    return {
      linkBudget,
      sensitivity,
      theoreticalKm: theoreticalDistanceKm,
      practicalKm: adjustedDistanceKm,
      fresnelRadius,
    };
  }, [state]);

  const updateState = (updates: Partial<CalculatorState>) => {
    setState(prev => ({ ...prev, ...updates }));
  };

  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-700/50 border-b border-slate-700">
        <h3 className="font-semibold text-slate-100 flex items-center gap-2">
          <Calculator className="w-4 h-4 text-amber-400" />
          LoRa Reichweiten-Rechner
        </h3>
      </div>

      <div className="p-4 space-y-6">
        {/* Result Display */}
        <div className="bg-gradient-to-r from-sky-900/50 to-purple-900/50 rounded-xl p-6 text-center border border-sky-700/50">
          <div className="text-sm text-slate-400 mb-1">Geschätzte Reichweite</div>
          <div className="text-5xl font-bold text-white mb-2">
            {calculation.practicalKm.toFixed(1)} km
          </div>
          <div className="text-sm text-slate-400">
            Link Budget: {calculation.linkBudget.toFixed(0)} dB |
            Empfindlichkeit: {calculation.sensitivity} dBm
          </div>
          <div className="text-xs text-slate-500 mt-2">
            Fresnel-Zone Radius (Mitte): {calculation.fresnelRadius.toFixed(1)} m
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Left Column: Sender */}
          <div className="space-y-4">
            <h4 className="font-medium text-slate-200 flex items-center gap-2">
              <Radio className="w-4 h-4 text-green-400" />
              Sender
            </h4>

            {/* TX Power */}
            <div>
              <label className="flex justify-between text-sm text-slate-400 mb-1">
                <span>Sendeleistung</span>
                <span className="text-slate-200">{state.txPower} dBm ({Math.round(Math.pow(10, state.txPower/10))} mW)</span>
              </label>
              <input
                type="range"
                min="0"
                max="30"
                value={state.txPower}
                onChange={(e) => updateState({ txPower: parseInt(e.target.value) })}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-slate-500">
                <span>0 dBm (1mW)</span>
                <span>30 dBm (1W)</span>
              </div>
            </div>

            {/* TX Antenna */}
            <div>
              <label className="flex justify-between text-sm text-slate-400 mb-1">
                <span>Sender-Antenne</span>
                <span className="text-slate-200">{state.txAntennaGain} dBi</span>
              </label>
              <input
                type="range"
                min="0"
                max="12"
                value={state.txAntennaGain}
                onChange={(e) => updateState({ txAntennaGain: parseInt(e.target.value) })}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-slate-500">
                <span>0 dBi (Stock)</span>
                <span>12 dBi (Yagi)</span>
              </div>
            </div>

            {/* TX Height */}
            <div>
              <label className="flex justify-between text-sm text-slate-400 mb-1">
                <span>Sender-Höhe</span>
                <span className="text-slate-200">{state.txHeight} m</span>
              </label>
              <input
                type="range"
                min="1"
                max="100"
                value={state.txHeight}
                onChange={(e) => updateState({ txHeight: parseInt(e.target.value) })}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-slate-500">
                <span>1m (Boden)</span>
                <span>100m (Turm)</span>
              </div>
            </div>
          </div>

          {/* Right Column: Empfänger */}
          <div className="space-y-4">
            <h4 className="font-medium text-slate-200 flex items-center gap-2">
              <Radio className="w-4 h-4 text-blue-400" />
              Empfänger
            </h4>

            {/* Spreading Factor */}
            <div>
              <label className="block text-sm text-slate-400 mb-1">Spreading Factor</label>
              <select
                value={state.spreadingFactor}
                onChange={(e) => updateState({ spreadingFactor: parseInt(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-sm text-slate-100"
              >
                {SPREADING_FACTORS.map(sf => (
                  <option key={sf.sf} value={sf.sf}>{sf.name}</option>
                ))}
              </select>
            </div>

            {/* RX Antenna */}
            <div>
              <label className="flex justify-between text-sm text-slate-400 mb-1">
                <span>Empfänger-Antenne</span>
                <span className="text-slate-200">{state.rxAntennaGain} dBi</span>
              </label>
              <input
                type="range"
                min="0"
                max="12"
                value={state.rxAntennaGain}
                onChange={(e) => updateState({ rxAntennaGain: parseInt(e.target.value) })}
                className="w-full"
              />
            </div>

            {/* RX Height */}
            <div>
              <label className="flex justify-between text-sm text-slate-400 mb-1">
                <span>Empfänger-Höhe</span>
                <span className="text-slate-200">{state.rxHeight} m</span>
              </label>
              <input
                type="range"
                min="1"
                max="50"
                step="0.5"
                value={state.rxHeight}
                onChange={(e) => updateState({ rxHeight: parseFloat(e.target.value) })}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-slate-500">
                <span>1m (Hand)</span>
                <span>50m (Dach)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Environment Selection */}
        <div>
          <label className="block text-sm text-slate-400 mb-2">Umgebung / Terrain</label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {ENVIRONMENTS.map(env => {
              const Icon = env.icon;
              const isSelected = state.environment === env.id;
              return (
                <button
                  key={env.id}
                  onClick={() => updateState({ environment: env.id as CalculatorState['environment'] })}
                  className={`p-3 rounded-lg border transition-colors text-left ${
                    isSelected
                      ? 'bg-slate-700 border-sky-500'
                      : 'bg-slate-800 border-slate-600 hover:border-slate-500'
                  }`}
                >
                  <Icon className={`w-5 h-5 mb-1 ${env.color}`} />
                  <div className="text-sm text-slate-200">{env.name}</div>
                  <div className="text-xs text-slate-500">×{env.factor}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tips */}
        <div className="bg-slate-700/50 rounded-lg p-4 text-sm text-slate-400">
          <p className="font-medium text-slate-300 mb-2">Tipps für mehr Reichweite:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Höhe ist der wichtigste Faktor - je höher, desto besser</li>
            <li>Höherer SF = mehr Reichweite, aber langsamer</li>
            <li>Bessere Antenne bringt mehr als höhere Sendeleistung</li>
            <li>Fresnel-Zone sollte frei von Hindernissen sein</li>
          </ul>
        </div>

        {/* Disclaimer */}
        <p className="text-xs text-slate-500 text-center">
          Dies ist eine theoretische Schätzung. Tatsächliche Reichweite hängt von vielen Faktoren ab
          (Wetter, Hindernisse, Interferenz, etc.)
        </p>
      </div>
    </div>
  );
}
