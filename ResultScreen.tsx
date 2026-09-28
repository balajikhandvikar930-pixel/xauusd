import { useEffect, useState } from 'react';
import { ArrowLeft, Loader2, AlertCircle, Trash2, FlaskConical } from 'lucide-react';
import { useRouter } from '@/lib/routerContext';
import { supabase } from '@/lib/supabaseClient';
import { AnalysisRecord } from '@/lib/types';
import { GlassCard } from '@/components/GlassCard';
import { StrategyResultCard, CombinedResultCard } from '@/components/StrategyResultCard';
import { PageHeader } from '@/components/AppLayout';
import { formatDate } from '@/lib/format';

export function ResultScreen({ analysisId }: { analysisId: string }) {
  const { navigate } = useRouter();
  const [record, setRecord] = useState<AnalysisRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    supabase
      .from('analyses')
      .select('*')
      .eq('id', analysisId)
      .maybeSingle()
      .then(({ data, error }) => {
        if (error || !data) {
          setError('Analysis not found.');
          setLoading(false);
          return;
        }
        setRecord(data as AnalysisRecord);
        setLoading(false);
      });
  }, [analysisId]);

  const handleDelete = async () => {
    if (!record) return;
    await supabase.from('analyses').delete().eq('id', record.id);
    navigate({ name: 'history' });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-slate-500" />
      </div>
    );
  }

  if (error || !record) {
    return (
      <div>
        <button onClick={() => navigate({ name: 'history' })} className="mb-4 flex items-center gap-1 text-sm text-slate-400 hover:text-white">
          <ArrowLeft className="h-4 w-4" /> Back to History
        </button>
        <GlassCard className="p-6 text-center">
          <AlertCircle className="mx-auto mb-3 h-8 w-8 text-red-400" />
          <p className="text-sm text-slate-400">{error ?? 'Analysis not found.'}</p>
        </GlassCard>
      </div>
    );
  }

  const result = record.result;
  const isMock = result?.isMock ?? false;

  return (
    <div>
      <PageHeader
        title="Analysis Result"
        subtitle={`${record.instrument} • ${record.strategy === 'all' ? 'All 3 Strategies' : record.strategy} • ${formatDate(record.created_at)}`}
        action={
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate({ name: 'analyze' })}
              className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-200 hover:bg-white/10"
            >
              <ArrowLeft className="h-4 w-4" /> New
            </button>
            <button
              onClick={handleDelete}
              className="flex items-center gap-1.5 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-300 hover:bg-red-500/20"
            >
              <Trash2 className="h-4 w-4" /> Delete
            </button>
          </div>
        }
      />

      {isMock && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-amber-500/20 bg-amber-500/10 px-3 py-2.5 text-sm text-amber-300">
          <FlaskConical className="h-4 w-4 shrink-0" />
          This result is mock data for UI development. The real AI vision API is not connected yet.
        </div>
      )}

      {!result ? (
        <GlassCard className="p-6 text-center">
          <p className="text-sm text-slate-400">No analysis result data available.</p>
        </GlassCard>
      ) : (
        <div className="space-y-5">
          {/* Uploaded images */}
          {record.images && record.images.length > 0 && (
            <GlassCard className="p-4">
              <h3 className="mb-3 text-sm font-semibold text-slate-200">Uploaded Screenshots</h3>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {record.images.map((img, i) => (
                  <div key={i} className="overflow-hidden rounded-lg border border-white/10">
                    <img src={img.dataUrl} alt={img.label} className="w-full max-h-48 object-contain bg-black/40" />
                    <p className="truncate bg-white/5 px-2 py-1 text-xs text-slate-400">{img.label}</p>
                  </div>
                ))}
              </div>
            </GlassCard>
          )}

          {/* Strategy results */}
          {result.strategies.map((s, i) => (
            <StrategyResultCard
              key={i}
              result={s}
              images={record.images?.map((img) => ({ label: img.label, dataUrl: img.dataUrl }))}
            />
          ))}

          {/* Combined */}
          {result.combined && <CombinedResultCard combined={result.combined} />}
        </div>
      )}
    </div>
  );
}
