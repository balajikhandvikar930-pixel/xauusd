import { ChartObservation, ChartObservationSet } from '../types';

// ============================================================
// Mock chart observations for UI development.
// These simulate what the real AI vision API would return.
// Clearly separated from the real AI service.
// ============================================================

function emptyObservation(timeframe: string): ChartObservation {
  return {
    instrument: 'XAUUSD',
    timeframe,
    pdh: { detected: false, price: null },
    pdl: { detected: false, price: null },
    liquiditySweep: {
      detected: false,
      level: null,
      direction: null,
      price: null,
      candleIndex: null,
    },
    bos: {
      detected: false,
      direction: null,
      price: null,
      candleIndex: null,
    },
    orderBlock: {
      detected: false,
      direction: null,
      high: null,
      low: null,
      candleIndex: null,
    },
    fvg: {
      detected: false,
      direction: null,
      high: null,
      low: null,
    },
    sessions: {
      asianHigh: null,
      asianLow: null,
      londonHigh: null,
      londonLow: null,
    },
    retracementIntoOB: null,
  };
}

// --- Scenario A: PDL swept + 5M BOS + bullish OB + FVG (Strategy 1: BUY) ---
const MOCK_OBS_STRATEGY1: ChartObservationSet = {
  '1h': {
    ...emptyObservation('1H'),
    pdh: { detected: true, price: 2658.4 },
    pdl: { detected: true, price: 2638.1 },
  },
  '5m': {
    ...emptyObservation('5M'),
    pdh: { detected: true, price: 2658.4 },
    pdl: { detected: true, price: 2638.1 },
    liquiditySweep: {
      detected: true,
      level: 'PDL',
      direction: 'bullish',
      price: 2637.5,
      candleIndex: 42,
    },
    bos: {
      detected: true,
      direction: 'bullish',
      price: 2645.0,
      candleIndex: 58,
    },
    orderBlock: {
      detected: true,
      direction: 'bullish',
      high: 2642.3,
      low: 2640.8,
      candleIndex: 45,
    },
    fvg: {
      detected: true,
      direction: 'bullish',
      high: 2643.8,
      low: 2642.5,
    },
    retracementIntoOB: true,
  },
};

// --- Scenario B: PDH broken + bearish OB + retracement (Strategy 2: SELL) ---
const MOCK_OBS_STRATEGY2: ChartObservationSet = {
  '1m': {
    ...emptyObservation('1M'),
    pdh: { detected: true, price: 2655.2 },
    pdl: { detected: true, price: 2640.5 },
    liquiditySweep: {
      detected: true,
      level: 'PDH',
      direction: 'bearish',
      price: 2655.8,
      candleIndex: 120,
    },
    orderBlock: {
      detected: true,
      direction: 'bearish',
      high: 2653.1,
      low: 2652.0,
      candleIndex: 118,
    },
    retracementIntoOB: true,
  },
};

// --- Scenario C: Asian Low swept, BOS confirmed, but no OB/FVG (Strategy 3: WAIT) ---
const MOCK_OBS_STRATEGY3: ChartObservationSet = {
  asian: {
    ...emptyObservation('Session'),
    sessions: {
      asianHigh: 2649.0,
      asianLow: 2644.5,
      londonHigh: null,
      londonLow: null,
    },
  },
  london: {
    ...emptyObservation('Session'),
    sessions: {
      asianHigh: 2649.0,
      asianLow: 2644.5,
      londonHigh: 2651.2,
      londonLow: 2646.8,
    },
    liquiditySweep: {
      detected: true,
      level: 'Asian Low',
      direction: 'bullish',
      price: 2644.2,
      candleIndex: 30,
    },
    bos: {
      detected: true,
      direction: 'bullish',
      price: 2649.5,
      candleIndex: 45,
    },
  },
  ny: {
    ...emptyObservation('Session'),
    sessions: {
      asianHigh: 2649.0,
      asianLow: 2644.5,
      londonHigh: 2651.2,
      londonLow: 2646.8,
    },
  },
};

// --- Combined "All 3" observations ---
const MOCK_OBS_ALL: ChartObservationSet = {
  ...MOCK_OBS_STRATEGY1,
  ...MOCK_OBS_STRATEGY2,
  ...MOCK_OBS_STRATEGY3,
};

export const MOCK_OBSERVATIONS: Record<string, ChartObservationSet> = {
  strategy1: MOCK_OBS_STRATEGY1,
  strategy2: MOCK_OBS_STRATEGY2,
  strategy3: MOCK_OBS_STRATEGY3,
  all: MOCK_OBS_ALL,
};

export { emptyObservation };
