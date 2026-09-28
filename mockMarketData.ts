import { Candle, LivePrice, Timeframe } from '../types';

// ============================================================
// Mock market data generator for UI development.
// Generates realistic-looking XAUUSD candle data.
// Retained only for isolated UI/testing scenarios; production marketDataService never selects it.
// ============================================================

const BASE_PRICE = 2650;

function timeframeMs(tf: Timeframe): number {
  switch (tf) {
    case '1M': return 60_000;
    case '5M': return 300_000;
    case '1H': return 3_600_000;
  }
}

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

export function mockCandles(timeframe: Timeframe, count: number = 100): Candle[] {
  const interval = timeframeMs(timeframe);
  const now = Date.now();
  const startTime = now - interval * count;
  const rand = seededRandom(Math.floor(now / interval));

  const candles: Candle[] = [];
  let prevClose = BASE_PRICE;

  for (let i = 0; i < count; i++) {
    const ts = startTime + i * interval;
    const volatility = BASE_PRICE * 0.0008;
    const drift = (rand() - 0.48) * volatility * 2;

    const open = prevClose;
    const close = open + drift;
    const high = Math.max(open, close) + rand() * volatility;
    const low = Math.min(open, close) - rand() * volatility;
    const volume = Math.floor(rand() * 5000) + 500;

    candles.push({
      timestamp: ts,
      open: Math.round(open * 100) / 100,
      high: Math.round(high * 100) / 100,
      low: Math.round(low * 100) / 100,
      close: Math.round(close * 100) / 100,
      volume,
    });

    prevClose = close;
  }

  return candles;
}

export function mockLivePrice(symbol: string): LivePrice {
  const price = BASE_PRICE + (Math.random() - 0.5) * 4;
  const change = (Math.random() - 0.45) * 8;
  return {
    symbol,
    price: Math.round(price * 100) / 100,
    bid: Math.round((price - 0.15) * 100) / 100,
    ask: Math.round((price + 0.15) * 100) / 100,
    change: Math.round(change * 100) / 100,
    changePercent: Math.round((change / BASE_PRICE) * 10000) / 100,
    high24h: Math.round((BASE_PRICE + 6) * 100) / 100,
    low24h: Math.round((BASE_PRICE - 5) * 100) / 100,
    timestamp: Date.now(),
  };
}
