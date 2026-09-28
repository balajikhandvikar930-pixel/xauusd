import { useEffect, useState } from 'react';
import { History, Loader2, ChevronRight, Trash2, ImageIcon } from 'lucide-react';
import { useRouter } from '@/lib/routerContext';
import { supabase } from '@/lib/supabaseClient';
import { AnalysisRecord, Signal } from '@/lib/types';
import { GlassCard } from '@/components/GlassCard';
import { SignalBadge } from '@/components/Badges';
import { PageHeader } from '@/components/AppLayout';
import { formatDate, engineStatusColor } from '@/lib/format';
import { formatEngineStatus } from '@/lib/constants';
import { StrategyEngineStatus } from '@/lib/types';

export function HistoryScreen() {
  const { navigate } = useRouter();
  const [records, setRecords] = useState<AnalysisRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    supabase
      .from('analyses')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setRecords((data as AnalysisRecord[]) ?? []);
        setLoading(false);
      });
  };

  useEffect(load, []);

  const handleDelete = async (id: string) => {
    await supabase.from('analyses').delete().eq('id', id);
    setRecords((prev) => prev.filter((r) => r.id !== id));
  };

  return (
    <div>
      <PageHeader title="Analysis History" subtitle="All your past XAUUSD chart analyses" />

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-slate-500" />
        </div>
      ) : records.length === 0 ? (
        <GlassCard className="flex flex-col items-center gap-3 py-16 text-center">
          <History className="h-10 w-10 text-slate-600" />
          <p className="text-sm text-slate-500">No analyses yet.</p>
          <button
            onClick={() => navigate({ name: 'analyze' })}
            className="text-sm text-amber-400 hover:underline"
          >
            Run your first analysis
          </button>
        </GlassCard>
      ) : (
        <div className="space-y-3">
          {records.map((r) => {
            const firstImage = r.images?.[0];
            const status = r.status as StrategyEngineStatus | null;
            return (
              <GlassCard key={r.id} className="group p-3">
                <div className="flex items-center justify-between gap-3">
                  <button
                    onClick={() => navigate({ name: 'result', analysisId: r.id })}
                    className="flex min-w-0 flex-1 items-center gap-3 text-left"
                  >
                    {/* Screenshot thumbnail */}
                    <div className="h-14 w-20 shrink-0 overflow-hidden rounded-lg border border-white/10 bg-black/40">
                      {firstImage ? (
                        <img src={firstImage.dataUrl} alt={firstImage.label} className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <ImageIcon className="h-5 w-5 text-slate-600" />
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-medium text-white">
                          {r.strategy === 'all' ? 'All 3 Strategies' : r.strategy}
                        </span>
                        {r.signal && <SignalBadge signal={r.signal as Signal} size="sm" />}
                      </div>
                      <div className="mt-0.5 flex items-center gap-2">
                        <p className="text-xs text-slate-500">{formatDate(r.created_at)}</p>
                        {status && (
                          <span className={`text-xs font-medium ${engineStatusColor(status)}`}>
                            {formatEngineStatus(status)}
                          </span>
                        )}
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-slate-600 shrink-0 group-hover:text-slate-400" />
                  </button>
                  <button
                    onClick={() => handleDelete(r.id)}
                    className="rounded-lg p-2 text-slate-600 transition hover:bg-red-500/10 hover:text-red-400"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </GlassCard>
            );
          })}
        </div>
      )}
    </div>
  );
}
