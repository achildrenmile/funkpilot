import { Download, ShoppingCart } from 'lucide-react';
import { useCurrentLanguage } from '../../hooks/useLocalizedProject';

// Simple component type with already-localized strings
interface Component {
  name: string;
  quantity: number;
  notes?: string;
}

interface ComponentListProps {
  components: Component[];
  estimatedCost: string;
  projectName: string;
}

export function ComponentList({ components, estimatedCost, projectName }: ComponentListProps) {
  const lang = useCurrentLanguage();

  // UI text translations
  const texts = {
    title: { de: 'Stückliste', en: 'Bill of Materials', sl: 'Seznam delov' },
    component: { de: 'Komponente', en: 'Component', sl: 'Komponenta' },
    quantity: { de: 'Anzahl', en: 'Quantity', sl: 'Količina' },
    notes: { de: 'Hinweise', en: 'Notes', sl: 'Opombe' },
    createdWith: { de: 'Erstellt mit FunkPilot', en: 'Created with FunkPilot', sl: 'Ustvarjeno s FunkPilot' },
    estimatedCost: { de: 'Geschätzte Kosten', en: 'Estimated cost', sl: 'Ocenjeni stroški' },
    billOfMaterials: { de: 'Stückliste für', en: 'Bill of Materials for', sl: 'Seznam delov za' },
    sources: { de: 'Bezugsquellen: Reichelt, Conrad, Amazon, AliExpress', en: 'Sources: Reichelt, Conrad, Amazon, AliExpress', sl: 'Viri: Reichelt, Conrad, Amazon, AliExpress' },
  };

  const t = (key: keyof typeof texts) => texts[key][lang] || texts[key].de;

  const handleExportCSV = () => {
    const headers = [t('component'), t('quantity'), t('notes')];
    const rows = components.map(c => [
      c.name,
      c.quantity.toString(),
      c.notes || '',
    ]);

    const csvContent = [
      `# ${t('billOfMaterials')}: ${projectName}`,
      `# ${t('createdWith')} - https://funkpilot.oeradio.at`,
      `# ${t('estimatedCost')}: ${estimatedCost}`,
      '',
      headers.join(';'),
      ...rows.map(r => r.join(';')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `stueckliste_${projectName.toLowerCase().replace(/\s+/g, '_')}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExportText = () => {
    const maxNameLength = Math.max(...components.map(c => c.name.length));

    const lines = [
      `╔${'═'.repeat(maxNameLength + 20)}╗`,
      `║ ${t('title').toUpperCase()}: ${projectName.padEnd(maxNameLength + 6 - t('title').length)} ║`,
      `╠${'═'.repeat(maxNameLength + 20)}╣`,
      ...components.map(c => {
        const name = c.name.padEnd(maxNameLength);
        const qty = `${c.quantity}x`.padStart(4);
        return `║ ${name} ${qty}${c.notes ? ` (${c.notes})`.slice(0, 12) : ''}`.padEnd(maxNameLength + 20) + '║';
      }),
      `╠${'═'.repeat(maxNameLength + 20)}╣`,
      `║ ${t('estimatedCost')}: ${estimatedCost.padEnd(maxNameLength - t('estimatedCost').length + 1)} ║`,
      `╚${'═'.repeat(maxNameLength + 20)}╝`,
      '',
      `${t('createdWith')} - https://funkpilot.oeradio.at`,
      '73 de OE8YML',
    ].join('\n');

    const blob = new Blob([lines], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `stueckliste_${projectName.toLowerCase().replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-700/50 border-b border-slate-700">
        <h3 className="font-semibold text-slate-100 flex items-center gap-2">
          <ShoppingCart className="w-4 h-4 text-sky-400" />
          {t('title')}
        </h3>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="text-xs px-2 py-1 bg-slate-600 hover:bg-slate-500 rounded transition-colors flex items-center gap-1"
            title="Export as CSV"
          >
            <Download className="w-3 h-3" />
            CSV
          </button>
          <button
            onClick={handleExportText}
            className="text-xs px-2 py-1 bg-slate-600 hover:bg-slate-500 rounded transition-colors flex items-center gap-1"
            title="Export as Text"
          >
            <Download className="w-3 h-3" />
            TXT
          </button>
        </div>
      </div>

      {/* Component List */}
      <div className="p-4">
        <div className="space-y-2">
          {components.map((comp, idx) => (
            <div
              key={idx}
              className="flex items-start justify-between py-2 border-b border-slate-700/50 last:border-0"
            >
              <div className="flex-1">
                <span className="text-slate-200">{comp.name}</span>
                {comp.notes && (
                  <span className="text-slate-500 text-xs ml-2">({comp.notes})</span>
                )}
              </div>
              <span className="text-slate-400 font-mono text-sm ml-4 bg-slate-700/50 px-2 py-0.5 rounded">
                {comp.quantity}x
              </span>
            </div>
          ))}
        </div>

        {/* Cost */}
        <div className="mt-4 pt-4 border-t border-slate-600 flex items-center justify-between">
          <span className="text-slate-400">{t('estimatedCost')}:</span>
          <span className="text-green-400 font-semibold text-lg">{estimatedCost}</span>
        </div>

        {/* Shop hint */}
        <p className="mt-3 text-xs text-slate-500">
          {t('sources')}
        </p>
      </div>
    </div>
  );
}
