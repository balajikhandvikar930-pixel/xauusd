import { StrategyEngineResult, CombinedAnalysis } from '@/lib/types';
import { GlassCard } from './GlassCard';
import { SignalBadge, EngineStatusBadge } from './Badges';
import { AnnotationList, TradeLevelDisplay } from './AnnotationList';
import { CheckCircle2, XCircle, AlertTriangle, Info, Layers } from 'lucide-react';

interface StrategyResultCardProps {
  result: StrategyEngineResult;
  images?: { label: string; dataUrl: string }[];
}

export function StrategyResultCard({ result, images }: StrategyResultCardProps) {
  return (
    <GlassCard className="overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-white truncate">{result.strategyName}</h3>
          <p className="text-xs text-slate-500">Version {result.strategyVersion}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <EngineStatusBadge status={result.status} />
          <SignalBadge signal={result.signal} />
        </div>
      </div>

      <div className="space-y-4 p-4">
        {/* Summary */}
        <p className="text-sm text-slate-300 leading-relaxed">{result.summary}</p>

        {/* Uploaded images */}
        {images && images.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {images.map((img, i) => (
              <div key={i} className="relative overflow-hidden rounded-lg border border-white/10">
                <img src={img.dataUrl} alt={img.label} className="h-24 w-32 object-cover bg-black/40" />
                <span className="absolute bottom-0 inset-x-0 bg-black/70 px-2 py-0.5 text-[10px] text-slate-300 truncate">{img.label}</span>
              </div>
            ))}
          </div>
        )}

        {/* Detected conditions */}
        {result.conditions.length > 0 && (
          <div className="rounded-lg bg-white/5 px-3 py-3">
            <p className="mb-2 text-xs font-semibold text-slate-400">Detected Conditions</p>
            <div className="grid gap-1.5 sm:grid-cols-2">
              {result.conditions.map((c) => (
                <div key={c.id} className="flex items-center gap-2">
                  {c.satisfied ? (
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                  ) : (
                    <XCircle className="h-3.5 w-3.5 text-slate-600 shrink-0" />
                  )}
                  <span className={`text-xs ${c.satisfied ? 'text-slate-300' : 'text-slate-500'}`}>
                    {c.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Missing conditions */}
        {result.missingConditions.length > 0 && (
          <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 px-3 py-3">
            <div className="mb-2 flex items-center gap-1.5">
              <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
              <p className="text-xs font-semibold text-amber-400">Missing Conditions</p>
            </div>
            <ul className="space-y-1">
              {result.missingConditions.map((mc, i) => (
                <li key={i} className="flex items-start gap-1.5 text-xs text-amber-300/80">
                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-amber-500" />
                  {mc}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Detected elements */}
        {result.detectedElements.length > 0 && (
          <div className="rounded-lg bg-white/5 px-3 py-3">
            <p className="mb-2 text-xs font-semibold text-slate-400">Detected Chart Elements</p>
            <div className="flex flex-wrap gap-1.5">
              {result.detectedElements.map((el, i) => (
                <span key={i} className="inline-flex items-center gap-1 rounded-md bg-white/5 border border-white/10 px-2 py-1 text-xs text-slate-300">
                  <span className="font-medium text-slate-200">{el.type}</span>
                  {el.price !== null && el.price !== undefined && (
                    <span className="text-slate-500">{el.price}</span>
                  )}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Trade levels */}
        <TradeLevelDisplay
          entry={result.tradeLevels.entry ?? undefined}
          stopLoss={result.tradeLevels.stopLoss ?? undefined}
          takeProfit={result.tradeLevels.takeProfit}
          riskReward={result.tradeLevels.riskReward ?? undefined}
        />

        {/* Annotations */}
        <AnnotationList annotations={result.annotations} />

        {/* Reasons */}
        {result.reasons.length > 0 && (
          <div className="rounded-lg bg-white/5 px-3 py-3">
            <p className="mb-2 text-xs font-semibold text-slate-400">Reasons</p>
            <ul className="space-y-1">
              {result.reasons.map((r, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-slate-400">
                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-slate-600" />
                  {r}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Invalidation */}
        {result.invalidation && (
          <div className="rounded-lg border border-red-500/20 bg-red-500/5 px-3 py-3">
            <div className="mb-1.5 flex items-center gap-1.5">
              <Info className="h-3.5 w-3.5 text-red-400" />
              <p className="text-xs font-semibold text-red-400">Invalidation</p>
            </div>
            <p className="text-xs text-red-300/80">{result.invalidation}</p>
          </div>
        )}
      </div>
    </GlassCard>
  );
}

export function CombinedResultCard({ combined }: { combined: CombinedAnalysis }) {
  const hasConflicts = combined.conflicts.length > 0;
  const hasAgreements = combined.agreements.length > 0;

  return (
    <GlassCard className="overflow-hidden border-amber-500/20">
      <div className="flex items-center justify-between border-b border-amber-500/20 bg-amber-500/5 px-4 py-3">
        <div className="flex items-center gap-2">
          <Layers className="h-4 w-4 text-amber-400" />
          <h3 className="text-sm font-semibold text-white">Combined Analysis</h3>
          <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-medium text-amber-300">Confluence</span>
        </div>
        <span className={`text-xs font-medium ${hasConflicts ? 'text-red-400' : hasAgreements ? 'text-emerald-400' : 'text-amber-400'}`}>
          {combined.overallStatus.replace(/_/g, ' ')}
        </span>
      </div>

      <div className="space-y-4 p-4">
        <p className="text-sm text-slate-200 leading-relaxed">{combined.explanation}</p>

        {/* Agreements */}
        {hasAgreements && (
          <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 px-3 py-3">
            <div className="mb-2 flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
              <p className="text-xs font-semibold text-emerald-400">Agreements</p>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {combined.agreements.map((a, i) => (
                <span key={i} className="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 text-xs text-emerald-300">
                  {a.strategyId}: {a.signal}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Conflicts */}
        {hasConflicts && (
          <div className="rounded-lg border border-red-500/20 bg-red-500/5 px-3 py-3">
            <div className="mb-2 flex items-center gap-1.5">
              <AlertTriangle className="h-3.5 w-3.5 text-red-400" />
              <p className="text-xs font-semibold text-red-400">Conflicts</p>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {combined.conflicts.map((c, i) => (
                <span key={i} className="inline-flex items-center gap-1 rounded-md bg-red-500/10 border border-red-500/20 px-2 py-1 text-xs text-red-300">
                  {c.strategyId}: {c.signal}
                </span>
              ))}
            </div>
            <p className="mt-2 text-xs text-red-300/70">
              Strategies produced opposing signals. Review each strategy individually — do not auto-select one.
            </p>
          </div>
        )}

        <p className="text-xs text-slate-500 italic">
          Combined analysis shows confluence and conflicts only. It does NOT rank strategies or create a probability of profit.
        </p>
      </div>
    </GlassCard>
  );
}
