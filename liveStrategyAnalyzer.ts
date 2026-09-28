import { Candle, StrategyEngineResult, StrategyEngineSignal, StrategyEngineStatus } from './types';

interface LiveStrategyInput {
  candles1h: Candle[];
  candles5m: Candle[];
  currentPrice: number;
}

function utcDate(timestamp: number): string {
  return new Date(timestamp).toISOString().slice(0, 10);
}

function previousUtcDay(candles: Candle[]): string | null {
  if (candles.length === 0) return null;
  const latestDay = utcDate(candles[candles.length - 1].timestamp);
  const date = new Date(`${latestDay}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() - 1);
  return date.toISOString().slice(0, 10);
}

function round(value: number): number {
  return Math.round(value * 100) / 100;
}

function isBullish(c: Candle): boolean {
  return c.close > c.open;
}

function isBearish(c: Candle): boolean {
  return c.close < c.open;
}

function isInRange(price: number, low: number, high: number): boolean {
  return price >= low && price <= high;
}

function makeResult(
  status: StrategyEngineStatus,
  signal: StrategyEngineSignal,
  conditions: StrategyEngineResult['conditions'],
  detectedElements: StrategyEngineResult['detectedElements'],
  reasons: string[],
  missingConditions: string[],
  annotations: StrategyEngineResult['annotations'],
  entry: number | null,
): StrategyEngineResult {
  const satisfied = conditions.filter((c) => c.satisfied).length;
  const completeness = conditions.length ? Math.round((satisfied / conditions.length) * 100) : 0;

  return {
    strategyId: 'strategy1',
    strategyName: 'Live XAUUSD — PDH/PDL Liquidity Sweep + 5M Structure + OB/FVG',
    strategyVersion: 'live-1.0',
    status,
    signal,
    conditions,
    conditionCompleteness: completeness,
    detectedElements,
    entry,
    stopLoss: null,
    takeProfit: [],
    riskReward: null,
    reasons,
    invalidation: signal === 'BUY'
      ? 'Setup invalidates if price closes below the bullish Order Block or swept PDL.'
      : signal === 'SELL'
        ? 'Setup invalidates if price closes above the bearish Order Block or swept PDH.'
        : null,
    missingConditions,
    annotations,
    tradeLevels: {
      entry,
      stopLoss: null,
      takeProfit: [],
      riskReward: null,
    },
    summary: signal === 'BUY'
      ? 'Live data confirms the defined bullish PDH/PDL liquidity-sweep sequence.'
      : signal === 'SELL'
        ? 'Live data confirms the defined bearish PDH/PDL liquidity-sweep sequence.'
        : 'No complete Strategy 1 setup is confirmed by the current live XAUUSD candles.',
  };
}

export function analyzeLiveStrategy1({ candles1h, candles5m, currentPrice }: LiveStrategyInput): StrategyEngineResult {
  const now = Date.now();
  const completed1h = candles1h.filter((c) => c.timestamp + 60 * 60 * 1000 <= now + 60_000);
  const completed5m = candles5m.filter((c) => c.timestamp + 5 * 60 * 1000 <= now + 30_000);

  const previousDay = previousUtcDay(completed1h);
  const previousDayCandles = previousDay
    ? completed1h.filter((c) => utcDate(c.timestamp) === previousDay)
    : [];

  const pdh = previousDayCandles.length ? Math.max(...previousDayCandles.map((c) => c.high)) : null;
  const pdl = previousDayCandles.length ? Math.min(...previousDayCandles.map((c) => c.low)) : null;

  const baseConditions = [
    { id: 'pdh_detected', label: 'PDH identified from previous UTC day', satisfied: pdh !== null },
    { id: 'pdl_detected', label: 'PDL identified from previous UTC day', satisfied: pdl !== null },
  ];

  if (completed5m.length < 20 || pdh === null || pdl === null) {
    const missing = baseConditions.filter((c) => !c.satisfied).map((c) => c.label);
    if (completed5m.length < 20) missing.push('At least 20 completed 5M candles');
    return makeResult(
      'INSUFFICIENT_DATA',
      'WAIT',
      [...baseConditions, { id: 'liquidity_sweep', label: 'PDH/PDL liquidity sweep', satisfied: false }, { id: 'structure_shift', label: '5M structure shift', satisfied: false }, { id: 'order_block', label: 'Order Block', satisfied: false }, { id: 'fvg', label: '5M FVG/imbalance', satisfied: false }, { id: 'retracement', label: 'Current price in entry zone', satisfied: false }],
      [],
      ['Live data is present but there is not enough completed history to evaluate Strategy 1 safely.'],
      missing,
      [],
      null,
    );
  }

  let sweepIndex = -1;
  let sweepDirection: 'bullish' | 'bearish' | null = null;
  let sweepPrice: number | null = null;

  for (let i = 0; i < completed5m.length; i++) {
    const c = completed5m[i];
    const bearishSweep = c.high >= pdh && c.close < pdh;
    const bullishSweep = c.low <= pdl && c.close > pdl;
    if (bearishSweep || bullishSweep) {
      sweepIndex = i;
      sweepDirection = bearishSweep ? 'bearish' : 'bullish';
      sweepPrice = bearishSweep ? c.high : c.low;
    }
  }

  const sweepCandle = sweepIndex >= 0 ? completed5m[sweepIndex] : null;
  const sweepDetected = sweepIndex >= 0 && sweepDirection !== null;

  let bosIndex = -1;
  let bosPrice: number | null = null;
  let bosDirection: 'bullish' | 'bearish' | null = null;

  if (sweepDetected) {
    for (let i = sweepIndex + 1; i < completed5m.length; i++) {
      const lookbackStart = Math.max(sweepIndex, i - 8);
      const before = completed5m.slice(lookbackStart, i);
      if (before.length < 3) continue;
      const recentHigh = Math.max(...before.map((c) => c.high));
      const recentLow = Math.min(...before.map((c) => c.low));
      const c = completed5m[i];
      if (sweepDirection === 'bearish' && c.close < recentLow) {
        bosIndex = i;
        bosPrice = c.close;
        bosDirection = 'bearish';
        break;
      }
      if (sweepDirection === 'bullish' && c.close > recentHigh) {
        bosIndex = i;
        bosPrice = c.close;
        bosDirection = 'bullish';
        break;
      }
    }
  }

  let obIndex = -1;
  let obLow: number | null = null;
  let obHigh: number | null = null;

  if (bosIndex > 0 && bosDirection) {
    for (let i = bosIndex - 1; i > Math.max(sweepIndex, bosIndex - 10); i--) {
      const c = completed5m[i];
      const opposing = bosDirection === 'bullish' ? isBearish(c) : isBullish(c);
      if (opposing) {
        obIndex = i;
        obLow = c.low;
        obHigh = c.high;
        break;
      }
    }
  }

  let fvgLow: number | null = null;
  let fvgHigh: number | null = null;
  let fvgDetected = false;

  const fvgStart = Math.max(2, bosIndex);
  for (let i = fvgStart; i < completed5m.length; i++) {
    const a = completed5m[i - 2];
    const c = completed5m[i];
    if (bosDirection === 'bullish' && c.low > a.high) {
      fvgLow = a.high;
      fvgHigh = c.low;
      fvgDetected = true;
      break;
    }
    if (bosDirection === 'bearish' && c.high < a.low) {
      fvgLow = c.high;
      fvgHigh = a.low;
      fvgDetected = true;
      break;
    }
  }

  const retracement = obLow !== null && obHigh !== null && isInRange(currentPrice, obLow, obHigh);
  const candleBody = sweepCandle ? Math.abs(sweepCandle.close - sweepCandle.open) : 0;
  const upperWick = sweepCandle ? sweepCandle.high - Math.max(sweepCandle.open, sweepCandle.close) : 0;
  const lowerWick = sweepCandle ? Math.min(sweepCandle.open, sweepCandle.close) - sweepCandle.low : 0;
  const rejectionConfirmed = sweepDirection === 'bearish'
    ? upperWick >= candleBody && sweepCandle!.close < sweepCandle!.open
    : sweepDirection === 'bullish'
      ? lowerWick >= candleBody && sweepCandle!.close > sweepCandle!.open
      : false;

  const directionAligned = sweepDirection !== null && bosDirection === sweepDirection;
  const conditions = [
    ...baseConditions,
    { id: 'liquidity_sweep', label: 'PDH/PDL liquidity sweep', satisfied: sweepDetected },
    { id: 'candle_behavior', label: 'Sweep candle rejection behavior', satisfied: rejectionConfirmed },
    { id: 'structure_shift', label: '5M structure shift aligned with sweep', satisfied: bosIndex >= 0 && directionAligned },
    { id: 'order_block', label: '5M Order Block', satisfied: obIndex >= 0 },
    { id: 'fvg', label: '5M FVG / imbalance', satisfied: fvgDetected },
    { id: 'retracement', label: 'Current price inside Order Block entry zone', satisfied: retracement },
  ];

  const missingConditions = conditions.filter((c) => !c.satisfied).map((c) => c.label);
  const detectedElements: StrategyEngineResult['detectedElements'] = [
    { type: 'PDH', label: 'Previous Day High', price: pdh },
    { type: 'PDL', label: 'Previous Day Low', price: pdl },
  ];
  const annotations: StrategyEngineResult['annotations'] = [
    { type: 'PDH', label: 'Previous Day High', price: pdh },
    { type: 'PDL', label: 'Previous Day Low', price: pdl },
  ];

  if (sweepDetected && sweepPrice !== null) {
    const label = sweepDirection === 'bearish' ? 'PDH swept' : 'PDL swept';
    detectedElements.push({ type: 'Liquidity sweep', label, price: sweepPrice });
    annotations.push({ type: 'Liquidity sweep', label, price: sweepPrice });
  }
  if (bosIndex >= 0 && bosPrice !== null) {
    detectedElements.push({ type: 'BOS', label: `5M ${bosDirection} structure shift`, price: bosPrice });
    annotations.push({ type: 'BOS', label: `5M ${bosDirection} BOS`, price: bosPrice });
  }
  if (obLow !== null && obHigh !== null) {
    detectedElements.push({ type: 'Order Block', label: `${bosDirection} Order Block`, price: obHigh, note: `${obLow}–${obHigh}` });
    annotations.push({ type: 'Order Block', label: `${bosDirection} Order Block`, price: obHigh, note: `${obLow}–${obHigh}` });
  }
  if (fvgDetected && fvgLow !== null && fvgHigh !== null) {
    detectedElements.push({ type: 'FVG', label: `${bosDirection} FVG`, price: fvgHigh, note: `${fvgLow}–${fvgHigh}` });
    annotations.push({ type: 'FVG', label: `${bosDirection} FVG`, price: fvgHigh, note: `${fvgLow}–${fvgHigh}` });
  }

  const reasons: string[] = [
    `Live XAUUSD price: ${round(currentPrice)}.`,
    `PDH: ${round(pdh)} | PDL: ${round(pdl)} (previous UTC day).`,
  ];
  if (sweepDetected) reasons.push(`${sweepDirection === 'bearish' ? 'PDH' : 'PDL'} liquidity sweep detected on completed 5M candles.`);
  if (rejectionConfirmed) reasons.push('Sweep candle shows rejection behavior in the expected direction.');
  if (bosIndex >= 0) reasons.push(`5M structure shift confirmed ${bosDirection === 'bullish' ? 'bullishly' : 'bearishly'}.`);
  if (obIndex >= 0) reasons.push('A valid opposing candle Order Block was identified before the structure shift.');
  if (fvgDetected) reasons.push('A 5M imbalance/FVG was detected after the structure shift.');
  if (retracement) reasons.push('Current live price is inside the Order Block entry zone.');

  const allRequired = sweepDetected && rejectionConfirmed && directionAligned && obIndex >= 0 && fvgDetected && retracement;
  const signal: StrategyEngineSignal = allRequired
    ? sweepDirection === 'bullish' ? 'BUY' : 'SELL'
    : 'WAIT';
  const status: StrategyEngineStatus = allRequired
    ? 'CONFIRMED'
    : !sweepDetected
      ? 'NO_SETUP'
      : bosIndex < 0 || !directionAligned
        ? 'WAITING_FOR_BOS'
        : obIndex < 0 || !fvgDetected
          ? 'WAITING_FOR_OB_FVG'
          : 'ENTRY_ZONE_IDENTIFIED';

  return makeResult(
    status,
    signal,
    conditions,
    detectedElements,
    reasons,
    missingConditions,
    annotations,
    obLow !== null && obHigh !== null && signal !== 'SELL' ? obHigh : obLow,
  );
}
