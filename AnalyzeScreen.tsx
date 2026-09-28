import { useState } from 'react';
import { Loader2, AlertCircle, Sparkles, ChevronRight } from 'lucide-react';
import { useRouter } from '@/lib/routerContext';
import { supabase } from '@/lib/supabaseClient';
import { StrategyId, UploadedImage, AnalysisRecord } from '@/lib/types';
import { INSTRUMENT, STRATEGIES, ALL_STRATEGIES, getStrategy } from '@/lib/constants';
import { aiVisionService } from '@/lib/aiVisionService';
import { GlassCard } from '@/components/GlassCard';
import { ImageUploadField } from '@/components/ImageUploadField';
import { PageHeader } from '@/components/AppLayout';

export function AnalyzeScreen() {
  const { navigate } = useRouter();
  const [strategyId, setStrategyId] = useState<StrategyId>(ALL_STRATEGIES);
  const [images, setImages] = useState<Record<string, UploadedImage | null>>({});
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const activeStrategies = strategyId === 'all' ? STRATEGIES : [getStrategy(strategyId)!];
  const allFields = activeStrategies.flatMap((s) => s.uploadFields);
  const requiredSlots = new Set(allFields.map((f) => f.slot));
  const filledCount = allFields.filter((f) => images[f.slot]).length;
  const allFilled = filledCount === allFields.length;

  const setImage = (slot: string, img: UploadedImage | null) => {
    setImages((prev) => ({ ...prev, [slot]: img }));
  };

  const handleAnalyze = async () => {
    setError(null);
    if (!allFilled) {
      setError('Please upload all required screenshots before analyzing.');
      return;
    }
    setAnalyzing(true);

    try {
      const uploadedImages = allFields.map((f) => images[f.slot]!);
      const response = await aiVisionService.analyze({
        instrument: INSTRUMENT,
        strategyId,
        images: uploadedImages,
      });

      const primaryStrategy = response.result.strategies[0];
      const { data, error: insertError } = await supabase
        .from('analyses')
        .insert({
          instrument: INSTRUMENT,
          strategy: strategyId,
          signal: primaryStrategy?.signal ?? null,
          status: primaryStrategy?.status ?? null,
          images: uploadedImages,
          result: response.result,
          chart_observations: response.chartObservations,
        })
        .select()
        .single();

      if (insertError || !data) {
        setError('Analysis completed but could not be saved. Please try again.');
        setAnalyzing(false);
        return;
      }

      navigate({ name: 'result', analysisId: (data as AnalysisRecord).id });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed. Please try again.');
      setAnalyzing(false);
    }
  };

  return (
    <div>
      <PageHeader title="Analyze Chart" subtitle={`${INSTRUMENT} — upload TradingView screenshots for AI vision analysis`} />

      {/* Instrument + strategy selection */}
      <GlassCard className="mb-6 p-4">
        <div className="mb-4">
          <label className="mb-2 block text-sm font-medium text-slate-300">Instrument</label>
          <div className="flex items-center gap-2 rounded-lg border border-amber-500/20 bg-amber-500/5 px-3 py-2.5">
            <span className="text-sm font-semibold text-amber-300">{INSTRUMENT}</span>
            <span className="text-xs text-slate-500">Gold / US Dollar</span>
          </div>
        </div>

        <label className="mb-2 block text-sm font-medium text-slate-300">Strategy</label>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          <StrategyOption
            id={ALL_STRATEGIES}
            label="Analyze All 3"
            description="Run all strategies"
            selected={strategyId === 'all'}
            onSelect={() => { setStrategyId('all'); setImages({}); }}
          />
          {STRATEGIES.map((s) => (
            <StrategyOption
              key={s.id}
              id={s.id}
              label={s.shortName}
              description={s.timeframe}
              selected={strategyId === s.id}
              onSelect={() => { setStrategyId(s.id); setImages({}); }}
            />
          ))}
        </div>
      </GlassCard>

      {/* Upload fields per strategy */}
      {activeStrategies.map((s) => (
        <GlassCard key={s.id} className="mb-6 p-4">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-white">{s.name}</h3>
              <p className="mt-0.5 text-xs text-slate-500">{s.description}</p>
            </div>
            <span className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] text-slate-400">{s.timeframe}</span>
          </div>
          <div className={`grid gap-4 ${s.uploadFields.length > 1 ? 'sm:grid-cols-2' : ''}`}>
            {s.uploadFields.map((field) => (
              <ImageUploadField
                key={field.slot}
                slot={field.slot}
                label={field.label}
                image={images[field.slot] ?? null}
                onChange={(img) => setImage(field.slot, img)}
              />
            ))}
          </div>
        </GlassCard>
      ))}

      {error && (
        <div className="mb-4 flex items-start gap-2 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2.5 text-sm text-red-300">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Analyze button */}
      <div className="sticky bottom-20 lg:bottom-4 z-10">
        <GlassCard className="flex items-center justify-between gap-4 p-4">
          <div className="text-sm">
            <span className="text-slate-400">Progress: </span>
            <span className="font-medium text-white">{filledCount}/{allFields.length} screenshots</span>
            {aiVisionService.isMock && (
              <span className="ml-2 rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] text-amber-400">Mock mode</span>
            )}
          </div>
          <button
            onClick={handleAnalyze}
            disabled={!allFilled || analyzing}
            className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-amber-400 to-amber-600 px-5 py-2.5 text-sm font-semibold text-black transition hover:from-amber-300 hover:to-amber-500 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {analyzing ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Analyzing…</>
            ) : (
              <><Sparkles className="h-4 w-4" /> Analyze Chart</>
            )}
          </button>
        </GlassCard>
      </div>
    </div>
  );
}

function StrategyOption({
  label,
  description,
  selected,
  onSelect,
}: {
  id: string;
  label: string;
  description: string;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      onClick={onSelect}
      className={`rounded-lg border px-3 py-2.5 text-left transition ${selected ? 'border-amber-400/50 bg-amber-400/10' : 'border-white/10 bg-white/5 hover:border-white/20'}`}
    >
      <div className="flex items-center justify-between">
        <span className={`text-sm font-medium ${selected ? 'text-amber-300' : 'text-slate-200'}`}>{label}</span>
        {selected && <ChevronRight className="h-3 w-3 text-amber-400" />}
      </div>
      <p className="mt-0.5 text-[11px] text-slate-500">{description}</p>
    </button>
  );
}
