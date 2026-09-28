import {
  AnalysisResult,
  ChartObservationSet,
  StrategyId,
  UploadedImage,
} from './types';
import { runStrategy, runAllStrategies } from './engine/strategyEngine';
import { mockAnalyze } from './mock/mockAnalyze';
import { supabase } from './supabaseClient';
import { getStrategy } from './constants';

export interface AnalyzeRequest {
  instrument: string;
  strategyId: StrategyId;
  images: UploadedImage[];
}

export interface AnalyzeResponse {
  result: AnalysisResult;
  chartObservations: ChartObservationSet;
  durationMs: number;
  provider: string;
  isMock: boolean;
  warnings?: string[];
}

export interface AIVisionService {
  analyze(request: AnalyzeRequest): Promise<AnalyzeResponse>;
  isConfigured(): boolean;
  readonly isMock: boolean;
}

// ============================================================
// Screenshot validation — runs before calling the AI
// ============================================================

const MAX_IMAGE_SIZE = 20 * 1024 * 1024;

function validateImages(
  strategyId: StrategyId,
  images: UploadedImage[]
): { valid: boolean; error?: string } {
  const strategy = getStrategy(strategyId);

  // For "all", check all required fields across all strategies
  const requiredSlots = strategy
    ? strategy.uploadFields.map((f) => f.slot)
    : ['1h', '5m', '1m', 'asian', 'london', 'ny'];

  const providedSlots = new Set(images.map((img) => img.slot));

  for (const slot of requiredSlots) {
    if (!providedSlots.has(slot)) {
      return {
        valid: false,
        error: 'Additional screenshot required for this strategy.',
      };
    }
  }

  for (const img of images) {
    if (!img.dataUrl || !img.dataUrl.startsWith('data:image/')) {
      return {
        valid: false,
        error: `Screenshot "${img.label}" is not a valid image.`,
      };
    }

    const base64Data = img.dataUrl.split(',')[1];
    if (!base64Data) {
      return {
        valid: false,
        error: `Screenshot "${img.label}" appears to be corrupted.`,
      };
    }

    const sizeBytes = Math.ceil(base64Data.length * 0.75);
    if (sizeBytes > MAX_IMAGE_SIZE) {
      return {
        valid: false,
        error: `Screenshot "${img.label}" is too large. Maximum size is 20MB.`,
      };
    }
  }

  return { valid: true };
}

// ============================================================
// Real AI Vision Service
// Calls the Supabase edge function (server-side API key).
// The AI returns ChartObservations (facts only).
// The deterministic strategy engine evaluates them.
// ============================================================

class RealAIVisionService implements AIVisionService {
  isMock = false as const;

  isConfigured(): boolean {
    return true;
  }

  async analyze(request: AnalyzeRequest): Promise<AnalyzeResponse> {
    const start = performance.now();

    // Validate screenshots before calling the AI
    const validation = validateImages(request.strategyId, request.images);
    if (!validation.valid) {
      throw new Error(validation.error!);
    }

    const { data: sessionData } = await supabase.auth.getSession();
    const accessToken = sessionData?.session?.access_token;

    if (!accessToken) {
      throw new Error('Not authenticated. Please sign in to run an analysis.');
    }

    let response: Response;
    try {
      response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze-chart`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
            apikey: import.meta.env.VITE_SUPABASE_ANON_KEY as string,
          },
          body: JSON.stringify({
            images: request.images.map((img) => ({
              slot: img.slot,
              label: img.label,
              dataUrl: img.dataUrl,
            })),
            instrument: request.instrument,
          }),
        }
      );
    } catch {
      throw new Error(
        'Could not reach the analysis service. Please check your connection and try again.'
      );
    }

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      throw new Error(
        errorBody?.error ?? 'Chart analysis could not be completed. Please try again.'
      );
    }

    const data = await response.json();
    const observations = data.chartObservations as ChartObservationSet;
    const warnings = data.warnings as string[] | undefined;

    if (!observations) {
      throw new Error('AI vision service returned no chart observations.');
    }

    // Run the deterministic strategy engine on the observations
    let result: AnalysisResult;
    if (request.strategyId === 'all') {
      const { strategies, combined } = runAllStrategies(observations);
      result = {
        strategies,
        combined,
        chartObservations: observations,
        isMock: false,
      };
    } else {
      const engineResult = runStrategy(
        request.strategyId as Exclude<StrategyId, 'all'>,
        observations
      );
      result = {
        strategies: [engineResult],
        chartObservations: observations,
        isMock: false,
      };
    }

    return {
      result,
      chartObservations: observations,
      durationMs: performance.now() - start,
      provider: 'openai-vision',
      isMock: false,
      warnings,
    };
  }
}

// ============================================================
// Mock AI Vision Service (for UI development)
// ============================================================

class MockAIVisionService implements AIVisionService {
  isMock = true as const;

  isConfigured(): boolean {
    return false;
  }

  async analyze(request: AnalyzeRequest): Promise<AnalyzeResponse> {
    // Validate screenshots even in mock mode
    const validation = validateImages(request.strategyId, request.images);
    if (!validation.valid) {
      throw new Error(validation.error!);
    }

    await new Promise((r) => setTimeout(r, 1200 + Math.random() * 600));
    const mock = mockAnalyze(request.strategyId, request.images);
    return {
      result: mock.result,
      chartObservations: mock.chartObservations,
      durationMs: mock.durationMs,
      provider: mock.provider,
      isMock: true,
    };
  }
}

// Production mode: AI Vision requests go through the server-side Supabase Edge Function.
const USE_MOCK = false;

export const aiVisionService: AIVisionService = USE_MOCK
  ? new MockAIVisionService()
  : new RealAIVisionService();
