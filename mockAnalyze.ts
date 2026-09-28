import {
  ChartObservation,
  ChartObservationSet,
  StrategyId,
  UploadedImage,
  AnalysisResult,
} from '../types';
import { runStrategy, runAllStrategies } from '../engine/strategyEngine';
import { MOCK_OBSERVATIONS } from './mockObservations';

// ============================================================
// Mock AI Vision Service
// Returns ChartObservation sets (chart facts only, never BUY/SELL)
// The deterministic strategy engine evaluates the observations.
// ============================================================

export interface MockAnalyzeResponse {
  chartObservations: ChartObservationSet;
  result: AnalysisResult;
  durationMs: number;
  provider: string;
  isMock: boolean;
}

export function mockAnalyze(
  strategyId: StrategyId,
  _images: UploadedImage[]
): MockAnalyzeResponse {
  const start = performance.now();

  const observations = MOCK_OBSERVATIONS[strategyId] ?? {};

  let result: AnalysisResult;

  if (strategyId === 'all') {
    const { strategies, combined } = runAllStrategies(observations);
    result = {
      strategies,
      combined,
      chartObservations: observations,
      isMock: true,
    };
  } else {
    const engineResult = runStrategy(
      strategyId as Exclude<StrategyId, 'all'>,
      observations
    );
    result = {
      strategies: [engineResult],
      chartObservations: observations,
      isMock: true,
    };
  }

  return {
    chartObservations: observations,
    result,
    durationMs: performance.now() - start,
    provider: 'mock-vision',
    isMock: true,
  };
}
