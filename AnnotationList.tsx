import { AnnotationPoint, ChartAnnotation } from '@/lib/types';
import { GlassCard } from './GlassCard';

interface AnnotationListProps {
  annotations: AnnotationPoint[];
}

const annotationStyles: Record<ChartAnnotation, { color: string; dot: string }> = {
  'PDH': { color: 'text-sky-300', dot: 'bg-sky-400' },
  'PDL': { color: 'text-sky-300', dot: 'bg-sky-400' },
  'Asian High': { color: 'text-violet-300', dot: 'bg-violet-400' },
  'Asian Low': { color: 'text-violet-300', dot: 'bg-violet-400' },
  'London High': { color: 'text-cyan-300', dot: 'bg-cyan-400' },
  'London Low': { color: 'text-cyan-300', dot: 'bg-cyan-400' },
  'Liquidity sweep': { color: 'text-amber-300', dot: 'bg-amber-400' },
  'BOS': { color: 'text-fuchsia-300', dot: 'bg-fuchsia-400' },
  'Order Block': { color: 'text-emerald-300', dot: 'bg-emerald-400' },
  'FVG': { color: 'text-teal-300', dot: 'bg-teal-400' },
  'Entry': { color: 'text-emerald-400', dot: 'bg-emerald-500' },
  'SL': { color: 'text-red-400', dot: 'bg-red-500' },
  'TP': { color: 'text-green-400', dot: 'bg-green-500' },
};

export function AnnotationList({ annotations }: AnnotationListProps) {
  if (annotations.length === 0) {
    return (
      <GlassCard className="p-4">
        <p className="text-sm text-slate-500">No chart annotations for this analysis.</p>
      </GlassCard>
    );
  }

  return (
    <GlassCard className="p-4">
      <h4 className="mb-3 text-sm font-semibold text-slate-200">Chart Annotations</h4>
      <div className="grid gap-2 sm:grid-cols-2">
        {annotations.map((a, i) => {
          const style = annotationStyles[a.type];
          return (
            <div key={i} className="flex items-start gap-2 rounded-lg bg-white/5 px-3 py-2">
              <span className={`mt-1 h-2 w-2 shrink-0 rounded-full ${style.dot}`} />
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-semibold ${style.color}`}>{a.type}</span>
                  {a.price !== undefined && (
                    <span className="text-xs text-slate-400">{a.price}</span>
                  )}
                </div>
                {a.label && <p className="truncate text-xs text-slate-500">{a.label}</p>}
                {a.note && <p className="text-xs text-slate-500">{a.note}</p>}
              </div>
            </div>
          );
        })}
      </div>
    </GlassCard>
  );
}

interface TradeLevelDisplayProps {
  entry?: number;
  stopLoss?: number;
  takeProfit?: number[];
  riskReward?: number;
}

export function TradeLevelDisplay({ entry, stopLoss, takeProfit, riskReward }: TradeLevelDisplayProps) {
  if (entry === undefined && stopLoss === undefined && !takeProfit?.length && riskReward === undefined) return null;

  return (
    <GlassCard className="p-4">
      <h4 className="mb-3 text-sm font-semibold text-slate-200">Trade Levels</h4>
      <div className="grid gap-3 sm:grid-cols-3">
        {entry !== undefined && (
          <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-3 py-2">
            <p className="text-xs text-emerald-400 font-medium">Entry</p>
            <p className="text-lg font-semibold text-white">{entry}</p>
          </div>
        )}
        {stopLoss !== undefined && (
          <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-3 py-2">
            <p className="text-xs text-red-400 font-medium">Stop Loss</p>
            <p className="text-lg font-semibold text-white">{stopLoss}</p>
          </div>
        )}
        {takeProfit && takeProfit.length > 0 && (
          <div className="rounded-lg bg-green-500/10 border border-green-500/20 px-3 py-2">
            <p className="text-xs text-green-400 font-medium">Take Profit</p>
            <p className="text-lg font-semibold text-white">{takeProfit.join(' / ')}</p>
          </div>
        )}
        {riskReward !== undefined && (
          <div className="rounded-lg bg-sky-500/10 border border-sky-500/20 px-3 py-2">
            <p className="text-xs text-sky-400 font-medium">Risk:Reward</p>
            <p className="text-lg font-semibold text-white">1:{riskReward}</p>
          </div>
        )}
      </div>
    </GlassCard>
  );
}
