import { LineChart, Clock, Layers, Camera, CheckSquare, Square, Shield, GitBranch } from 'lucide-react';
import { useRouter, Route } from '@/lib/routerContext';
import { STRATEGIES, getStrategy } from '@/lib/constants';
import { getStrategyConfig } from '@/lib/strategies';
import { StrategyId } from '@/lib/types';
import { GlassCard } from '@/components/GlassCard';
import { PageHeader } from '@/components/AppLayout';

export function StrategyScreen({ strategyId }: { strategyId: string }) {
  const { navigate } = useRouter();
  const current = getStrategy(strategyId as StrategyId) ?? STRATEGIES[0];
  const config = getStrategyConfig(current.id as Exclude<typeof current.id, 'all'>);

  return (
    <div>
      <PageHeader title="Strategy Details" subtitle="XAUUSD trading strategy reference" />

      {/* Strategy tabs */}
      <div className="mb-6 flex gap-2 overflow-x-auto pb-1">
        {STRATEGIES.map((s) => (
          <button
            key={s.id}
            onClick={() => navigate({ name: 'strategy', strategyId: s.id } as Route)}
            className={`shrink-0 rounded-lg border px-3 py-2 text-sm transition ${s.id === current.id ? 'border-amber-400/50 bg-amber-400/10 text-amber-300' : 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'}`}
          >
            {s.shortName}
          </button>
        ))}
      </div>

      <GlassCard className="mb-6 p-5">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400/20 to-amber-600/20 border border-amber-500/20">
            <LineChart className="h-6 w-6 text-amber-400" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <h2 className="text-lg font-bold text-white">{current.name}</h2>
              <span className="flex items-center gap-1 shrink-0 rounded-full bg-white/5 px-2 py-0.5 text-[10px] text-slate-400">
                <GitBranch className="h-3 w-3" />
                v{current.version}
              </span>
            </div>
            <p className="mt-1 text-sm text-slate-400 leading-relaxed">{current.description}</p>
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <div className="rounded-lg bg-white/5 px-3 py-3">
            <Clock className="mb-1.5 h-4 w-4 text-sky-400" />
            <p className="text-xs text-slate-500">Timeframe</p>
            <p className="text-sm font-medium text-white">{current.timeframe}</p>
          </div>
          <div className="rounded-lg bg-white/5 px-3 py-3">
            <Layers className="mb-1.5 h-4 w-4 text-violet-400" />
            <p className="text-xs text-slate-500">Screenshots</p>
            <p className="text-sm font-medium text-white">{current.uploadFields.length} required</p>
          </div>
          <div className="rounded-lg bg-white/5 px-3 py-3">
            <Camera className="mb-1.5 h-4 w-4 text-emerald-400" />
            <p className="text-xs text-slate-500">Instrument</p>
            <p className="text-sm font-medium text-white">XAUUSD</p>
          </div>
        </div>
      </GlassCard>

      {/* Required screenshots */}
      <h3 className="mb-3 text-sm font-semibold text-slate-300">Required Screenshots</h3>
      <div className="mb-6 space-y-2">
        {current.uploadFields.map((f, i) => (
          <GlassCard key={f.slot} className="flex items-center gap-3 p-3">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-500/10 text-xs font-semibold text-amber-400">
              {i + 1}
            </span>
            <span className="text-sm text-slate-200">{f.label}</span>
          </GlassCard>
        ))}
      </div>

      {/* Strategy conditions */}
      <h3 className="mb-3 text-sm font-semibold text-slate-300">Strategy Conditions</h3>
      <GlassCard className="mb-6 p-4">
        <div className="space-y-3">
          {config.conditions.map((c, i) => (
            <div key={c.id} className="flex items-start gap-3 rounded-lg bg-white/5 px-3 py-3">
              {c.required ? (
                <CheckSquare className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
              ) : (
                <Square className="mt-0.5 h-4 w-4 shrink-0 text-slate-600" />
              )}
              <div className="min-w-0">
                <p className="text-sm font-medium text-slate-200">
                  <span className="text-slate-500">{i + 1}.</span> {c.label}
                  {!c.required && <span className="ml-2 text-xs text-slate-500">(optional)</span>}
                </p>
                <p className="mt-0.5 text-xs text-slate-500 leading-relaxed">{c.description}</p>
              </div>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Entry / SL / TP rules */}
      <h3 className="mb-3 text-sm font-semibold text-slate-300">Entry & Risk Management</h3>
      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        <GlassCard className="p-4">
          <p className="mb-2 text-xs font-semibold text-slate-400">Entry Rules</p>
          <div className="space-y-1.5">
            {config.entryRules.map((r) => (
              <div key={r.id} className="flex items-center gap-2">
                <span className={`h-1.5 w-1.5 rounded-full ${r.enabled ? 'bg-emerald-400' : 'bg-slate-600'}`} />
                <span className={`text-xs ${r.enabled ? 'text-slate-300' : 'text-slate-500'}`}>{r.label}</span>
              </div>
            ))}
          </div>
        </GlassCard>
        <GlassCard className="p-4">
          <p className="mb-2 text-xs font-semibold text-slate-400">Stop Loss</p>
          <div className="space-y-1.5">
            {config.stopLossRules.map((r) => (
              <div key={r.id} className="flex items-center gap-2">
                <span className={`h-1.5 w-1.5 rounded-full ${r.enabled ? 'bg-red-400' : 'bg-slate-600'}`} />
                <span className={`text-xs ${r.enabled ? 'text-slate-300' : 'text-slate-500'}`}>
                  {r.type === 'NOT_DEFINED' ? 'NOT DEFINED — configurable' : r.label}
                </span>
              </div>
            ))}
          </div>
        </GlassCard>
        <GlassCard className="p-4">
          <p className="mb-2 text-xs font-semibold text-slate-400">Take Profit</p>
          <div className="space-y-1.5">
            {config.takeProfitRules.map((r) => (
              <div key={r.id} className="flex items-center gap-2">
                <span className={`h-1.5 w-1.5 rounded-full ${r.enabled ? 'bg-green-400' : 'bg-slate-600'}`} />
                <span className={`text-xs ${r.enabled ? 'text-slate-300' : 'text-slate-500'}`}>
                  {r.type === 'NOT_DEFINED' ? 'NOT DEFINED — configurable' : r.label}
                </span>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* Disclaimer */}
      <GlassCard className="mb-6 border-slate-500/20 p-4">
        <div className="flex items-start gap-2">
          <Shield className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" />
          <p className="text-xs text-slate-500 leading-relaxed">
            Analysis is based on the selected strategy rules and the uploaded chart data.
            This tool does not place trades, connect to a broker, or guarantee profits.
            Strategy version {current.version} is saved with every analysis for historical accuracy.
          </p>
        </div>
      </GlassCard>

      <div className="mt-6">
        <button
          onClick={() => navigate({ name: 'analyze' })}
          className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-amber-400 to-amber-600 px-4 py-2.5 text-sm font-semibold text-black transition hover:from-amber-300 hover:to-amber-500"
        >
          <Camera className="h-4 w-4" />
          Analyze with this strategy
        </button>
      </div>
    </div>
  );
}
