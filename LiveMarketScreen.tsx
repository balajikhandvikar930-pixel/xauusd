import { useEffect, useState, useCallback, useRef } from 'react';
import { Activity, RefreshCw, TrendingUp, TrendingDown, AlertCircle, Radio } from 'lucide-react';
import { useRouter } from '@/lib/routerContext';
import { INSTRUMENT } from '@/lib/constants';
import { marketDataService } from '@/lib/marketDataService';
import { Candle, LivePrice, MarketDataResult, Timeframe } from '@/lib/types';
import { analyzeLiveStrategy1 } from '@/lib/liveStrategyAnalyzer';
import { StrategyResultCard } from '@/components/StrategyResultCard';
import { GlassCard } from '@/components/GlassCard';
import { PageHeader } from '@/components/AppLayout';
import { CandleChart } from '@/components/CandleChart';

const TIMEFRAMES: Timeframe[] = ['1M', '5M', '1H'];
const REFRESH_MS = 15_000;

export function LiveMarketScreen() {
  const { navigate } = useRouter();
  const [timeframe, setTimeframe] = useState<Timeframe>('5M');
  const [data, setData] = useState<MarketDataResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<number>(0);
  const [analysis, setAnalysis] = useState<import('@/lib/types').StrategyEngineResult | null>(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchData = useCallback(async (tf: Timeframe) => {
    setError(null);
    setAnalysis(null);
    setAnalysisLoading(true);
    try {
      const [result, higherTimeframe] = await Promise.all([
        marketDataService.fetch({
          symbol: INSTRUMENT,
          timeframe: tf,
          limit: 120,
        }),
        tf === '1H'
          ? Promise.resolve(null)
          : marketDataService.fetch({
              symbol: INSTRUMENT,
              timeframe: '1H',
              limit: 120,
            }),
      ]);

      setData(result);
      setLastUpdate(Date.now());

      if (tf === '5M' && higherTimeframe?.livePrice && result.livePrice) {
        setAnalysis(
          analyzeLiveStrategy1({
            candles1h: higherTimeframe.candles,
            candles5m: result.candles,
            currentPrice: result.livePrice.price,
          })
        );
      }
    } catch (err) {
      setData(null);
      setAnalysis(null);
      setError(err instanceof Error ? err.message : 'Could not fetch live market data.');
    } finally {
      setLoading(false);
      setAnalysisLoading(false);
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchData(timeframe);

    // Auto-refresh
    intervalRef.current = setInterval(() => fetchData(timeframe), REFRESH_MS);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [timeframe, fetchData]);

  const livePrice = data?.livePrice ?? null;
  const candles = data?.candles ?? [];
  const isMock = data?.status === 'MOCK';
  const isLive = data?.status === 'LIVE';

  const priceChange = livePrice?.change;
  const isUp = (priceChange ?? 0) >= 0;

  return (
    <div>
      <PageHeader
        title="Live Market"
        subtitle={`${INSTRUMENT} — real-time price and candlestick data`}
        action={
          <button
            onClick={() => {
              setLoading(true);
              fetchData(timeframe);
            }}
            className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-200 hover:bg-white/10"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        }
      />

      {/* Status banner */}
      <div className="mb-4 flex items-center gap-2">
        {isLive && (
          <span className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 text-xs font-medium text-emerald-400">
            <Radio className="h-3 w-3 animate-pulse" />
            Live data
          </span>
        )}
        {isMock && (
          <span className="flex items-center gap-1.5 rounded-full bg-red-500/10 border border-red-500/20 px-3 py-1 text-xs font-medium text-red-400">
            <AlertCircle className="h-3 w-3" />
            Mock data is disabled for live trading
          </span>
        )}
        {lastUpdate > 0 && (
          <span className="text-xs text-slate-500">
            Updated {new Date(lastUpdate).toLocaleTimeString()}
          </span>
        )}
      </div>

      {/* Price ticker */}
      {livePrice && (
        <GlassCard className="mb-6 overflow-hidden">
          <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400/20 to-amber-600/20 border border-amber-500/20">
                <Activity className="h-6 w-6 text-amber-400" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-white">{INSTRUMENT}</h2>
                  <span className={`flex items-center gap-0.5 text-sm font-semibold ${isUp ? 'text-emerald-400' : 'text-red-400'}`}>
                    {isUp ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                    {isUp ? '+' : ''}{priceChange?.toFixed(2)}
                    {livePrice.changePercent != null && (
                      <span className="ml-1 text-xs">({isUp ? '+' : ''}{livePrice.changePercent.toFixed(2)}%)</span>
                    )}
                  </span>
                </div>
                <p className="text-2xl font-bold text-white tabular-nums">
                  {livePrice.price.toFixed(2)}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <PriceStat label="Bid" value={livePrice.bid} />
              <PriceStat label="Ask" value={livePrice.ask} />
              <PriceStat label="24h High" value={livePrice.high24h} />
              <PriceStat label="24h Low" value={livePrice.low24h} />
            </div>
          </div>
        </GlassCard>
      )}

      {/* Timeframe selector */}
      <div className="mb-4 flex items-center gap-2">
        {TIMEFRAMES.map((tf) => (
          <button
            key={tf}
            onClick={() => setTimeframe(tf)}
            className={`rounded-lg border px-4 py-2 text-sm font-medium transition ${
              tf === timeframe
                ? 'border-amber-400/50 bg-amber-400/10 text-amber-300'
                : 'border-white/10 bg-white/5 text-slate-400 hover:bg-white/10'
            }`}
          >
            {tf}
          </button>
        ))}
      </div>

      {/* Candle chart */}
      <GlassCard className="mb-6 p-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-200">
            {INSTRUMENT} · {timeframe} · {candles.length} candles
          </h3>
        </div>
        {loading && candles.length === 0 ? (
          <div className="flex items-center justify-center py-20">
            <RefreshCw className="h-6 w-6 animate-spin text-slate-500" />
          </div>
        ) : (
          <CandleChart candles={candles} height={360} showVolume />
        )}
      </GlassCard>

      {/* Live Strategy 1 analysis */}
      {timeframe === '5M' && (analysisLoading || analysis) && (
        <div className="mb-6">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-white">Live Strategy 1 Analysis</h3>
              <p className="text-xs text-slate-500">1H PDH/PDL → 5M sweep → structure shift → OB → FVG</p>
            </div>
            {analysisLoading && <RefreshCw className="h-4 w-4 animate-spin text-amber-400" />}
          </div>
          {analysis && <StrategyResultCard result={analysis} />}
        </div>
      )}

      {/* Analysis CTA */}
      <GlassCard className="p-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-white">Analyze this market data</p>
            <p className="text-xs text-slate-500">Upload TradingView screenshots to run strategy analysis</p>
          </div>
          <button
            onClick={() => navigate({ name: 'analyze' })}
            className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-amber-400 to-amber-600 px-4 py-2 text-sm font-semibold text-black transition hover:from-amber-300 hover:to-amber-500"
          >
            Analyze Chart
          </button>
        </div>
      </GlassCard>

      {error && (
        <div className="mt-4 flex items-start gap-2 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2.5 text-sm text-red-300">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}

function PriceStat({ label, value }: { label: string; value: number | null }) {
  return (
    <div className="rounded-lg bg-white/5 px-3 py-2">
      <p className="text-[10px] text-slate-500">{label}</p>
      <p className="text-sm font-medium text-white tabular-nums">
        {value != null ? value.toFixed(2) : '—'}
      </p>
    </div>
  );
}
