import { useEffect, useState } from 'react';
import { Camera, TrendingUp, TrendingDown, ChevronRight, Activity, Loader2, Radio } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from '@/lib/routerContext';
import { AnalysisRecord, Signal, StrategyEngineStatus, LivePrice } from '@/lib/types';
import { INSTRUMENT } from '@/lib/constants';
import { GlassCard } from '@/components/GlassCard';
import { SignalBadge, EngineStatusBadge } from '@/components/Badges';
import { PageHeader } from '@/components/AppLayout';
import { formatDate } from '@/lib/format';
import { marketDataService } from '@/lib/marketDataService';

export function DashboardScreen() {
  const { navigate } = useRouter();
  const [recent, setRecent] = useState<AnalysisRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [livePrice, setLivePrice] = useState<LivePrice | null>(null);
  const [priceLoading, setPriceLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('analyses')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5)
      .then(({ data }) => {
        setRecent((data as AnalysisRecord[]) ?? []);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    marketDataService
      .fetch({ symbol: INSTRUMENT, timeframe: '5M', limit: 1 })
      .then((result) => {
        setLivePrice(result.livePrice);
        setPriceLoading(false);
      });
  }, []);

  const trackedStatuses = recent.filter((r) => r.status).slice(0, 4);
  const priceUp = (livePrice?.change ?? 0) >= 0;

  return (
    <div>
      <PageHeader
        title="Dashboard"
        subtitle="XAUUSD AI chart analysis overview"
        action={
          <button
            onClick={() => navigate({ name: 'analyze' })}
            className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-amber-400 to-amber-600 px-4 py-2.5 text-sm font-semibold text-black transition hover:from-amber-300 hover:to-amber-500"
          >
            <Camera className="h-4 w-4" />
            Analyze New Chart
          </button>
        }
      />

      {/* Instrument card with live price */}
      <GlassCard className="mb-6 overflow-hidden">
        <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400/20 to-amber-600/20 border border-amber-500/20">
              <TrendingUp className="h-6 w-6 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white">{INSTRUMENT}</h2>
                <span className="rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-[10px] text-emerald-400">Analysis Tool</span>
              </div>
              <p className="text-xs text-slate-500">Gold vs US Dollar — AI vision analysis</p>
            </div>
          </div>

          {/* Live price widget */}
          <div className="flex items-center gap-4">
            {priceLoading ? (
              <Loader2 className="h-5 w-5 animate-spin text-slate-500" />
            ) : livePrice ? (
              <button
                onClick={() => navigate({ name: 'market' })}
                className="text-right transition hover:opacity-80"
              >
                <div className="flex items-center justify-end gap-1.5">
                  {marketDataService.isLive() && <Radio className="h-3 w-3 animate-pulse text-emerald-400" />}
                  <span className={`text-2xl font-bold tabular-nums text-white`}>{livePrice.price.toFixed(2)}</span>
                </div>
                <div className={`flex items-center justify-end gap-0.5 text-xs font-medium ${priceUp ? 'text-emerald-400' : 'text-red-400'}`}>
                  {priceUp ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                  {priceUp ? '+' : ''}{livePrice.change?.toFixed(2)}
                </div>
              </button>
            ) : (
              <span className="text-xs text-slate-500">Price unavailable</span>
            )}
          </div>
          <button
            onClick={() => navigate({ name: 'analyze' })}
            className="flex items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 transition hover:bg-white/10 sm:hidden"
          >
            <Camera className="h-4 w-4" />
            Analyze
          </button>
        </div>
      </GlassCard>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent analyses */}
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-300">Recent Analyses</h3>
            <button onClick={() => navigate({ name: 'history' })} className="text-xs text-amber-400 hover:underline">
              View all
            </button>
          </div>
          {loading ? (
            <GlassCard className="flex items-center justify-center py-10">
              <Loader2 className="h-5 w-5 animate-spin text-slate-500" />
            </GlassCard>
          ) : recent.length === 0 ? (
            <GlassCard className="flex flex-col items-center gap-3 py-10 text-center">
              <Activity className="h-8 w-8 text-slate-600" />
              <p className="text-sm text-slate-500">No analyses yet.</p>
              <button
                onClick={() => navigate({ name: 'analyze' })}
                className="text-sm text-amber-400 hover:underline"
              >
                Run your first analysis
              </button>
            </GlassCard>
          ) : (
            <div className="space-y-2">
              {recent.map((r) => (
                <GlassCard key={r.id} className="p-3" onClick={() => navigate({ name: 'result', analysisId: r.id })}>
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-white truncate">{r.strategy === 'all' ? 'All 3 Strategies' : r.strategy}</span>
                        {r.signal && <SignalBadge signal={r.signal as Signal} size="sm" />}
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">{formatDate(r.created_at)}</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-slate-600 shrink-0" />
                  </div>
                </GlassCard>
              ))}
            </div>
          )}
        </div>

        {/* Recent setup status */}
        <div>
          <h3 className="mb-3 text-sm font-semibold text-slate-300">Recent Setup Status</h3>
          {trackedStatuses.length === 0 ? (
            <GlassCard className="flex flex-col items-center gap-2 py-10 text-center">
              <Activity className="h-8 w-8 text-slate-600" />
              <p className="text-sm text-slate-500">No setups tracked yet.</p>
            </GlassCard>
          ) : (
            <div className="space-y-2">
              {trackedStatuses.map((r) => (
                <GlassCard key={r.id} className="p-3" onClick={() => navigate({ name: 'result', analysisId: r.id })}>
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-white">{r.strategy === 'all' ? 'All 3' : r.strategy}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{formatDate(r.created_at)}</p>
                    </div>
                    <EngineStatusBadge status={r.status as StrategyEngineStatus} />
                  </div>
                </GlassCard>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
