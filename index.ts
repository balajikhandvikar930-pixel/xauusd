// ============================================================
// Edge Function: market-data
//
// Live XAUUSD market data proxy.
//
// Default provider: Twelve Data
//   - /price for the latest XAU/USD price
//   - /time_series for 1m/5m/1h OHLC candles
//
// The Twelve Data API key stays server-side in Supabase secrets.
// Required secret:
//   MARKET_DATA_API_KEY
// Optional secret:
//   MARKET_DATA_API_URL (defaults to https://api.twelvedata.com)
// ============================================================

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface MarketDataRequest {
  symbol: string;
  timeframe: string;
  limit?: number;
}

interface Candle {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number | null;
}

interface LivePrice {
  symbol: string;
  price: number;
  bid: number | null;
  ask: number | null;
  change: number | null;
  changePercent: number | null;
  high24h: number | null;
  low24h: number | null;
  timestamp: number;
}

const TWELVE_DATA_DEFAULT_URL = 'https://api.twelvedata.com';
const TWELVE_DATA_SYMBOL = 'XAU/USD';

function mapInterval(timeframe: string): string {
  const map: Record<string, string> = {
    '1M': '1min',
    '5M': '5min',
    '1H': '1h',
  };
  return map[timeframe] ?? timeframe;
}

function providerUrl(baseUrl: string, path: string, params: Record<string, string>): string {
  const url = new URL(`${baseUrl.replace(/\/$/, '')}/${path.replace(/^\//, '')}`);
  Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, value));
  return url.toString();
}

async function fetchTwelveData(
  path: string,
  params: Record<string, string>,
  apiUrl: string,
  apiKey: string,
): Promise<Record<string, unknown>> {
  const url = providerUrl(apiUrl, path, { ...params, apikey: apiKey });
  const response = await fetch(url, { headers: { Accept: 'application/json' } });
  const data = await response.json().catch(() => ({}));

  if (!response.ok || data?.status === 'error' || data?.code) {
    const message = typeof data?.message === 'string'
      ? data.message
      : `Twelve Data returned HTTP ${response.status}.`;
    throw new Error(message);
  }

  return data as Record<string, unknown>;
}

function parseTimestamp(value: unknown): number {
  if (typeof value === 'number') {
    return value < 1_000_000_000_000 ? value * 1000 : value;
  }

  const parsed = Date.parse(String(value));
  if (Number.isNaN(parsed)) throw new Error(`Invalid candle timestamp: ${String(value)}`);
  return parsed;
}

function parseCandles(data: Record<string, unknown>): Candle[] {
  const values = Array.isArray(data.values) ? data.values : [];

  return values
    .map((item) => {
      const c = item as Record<string, unknown>;
      return {
        timestamp: parseTimestamp(c.datetime ?? c.timestamp),
        open: Number(c.open),
        high: Number(c.high),
        low: Number(c.low),
        close: Number(c.close),
        volume: c.volume != null ? Number(c.volume) : null,
      } satisfies Candle;
    })
    .filter(
      (c) =>
        Number.isFinite(c.open) &&
        Number.isFinite(c.high) &&
        Number.isFinite(c.low) &&
        Number.isFinite(c.close) &&
        c.high >= c.low,
    )
    .sort((a, b) => a.timestamp - b.timestamp);
}

async function fetchCandles(
  symbol: string,
  timeframe: string,
  limit: number,
  apiUrl: string,
  apiKey: string,
): Promise<Candle[]> {
  const requestedSymbol = symbol.toUpperCase() === 'XAUUSD' ? TWELVE_DATA_SYMBOL : symbol;
  const data = await fetchTwelveData(
    'time_series',
    {
      symbol: requestedSymbol,
      interval: mapInterval(timeframe),
      outputsize: String(Math.min(Math.max(limit, 20), 5000)),
      order: 'asc',
      timezone: 'UTC',
    },
    apiUrl,
    apiKey,
  );

  return parseCandles(data);
}

async function fetchLivePrice(
  symbol: string,
  apiUrl: string,
  apiKey: string,
): Promise<LivePrice> {
  const requestedSymbol = symbol.toUpperCase() === 'XAUUSD' ? TWELVE_DATA_SYMBOL : symbol;
  const [priceData, quoteData] = await Promise.all([
    fetchTwelveData('price', { symbol: requestedSymbol }, apiUrl, apiKey),
    fetchTwelveData('quote', { symbol: requestedSymbol }, apiUrl, apiKey).catch(() => null),
  ]);

  const price = Number(priceData.price);
  if (!Number.isFinite(price)) {
    throw new Error('Twelve Data did not return a valid XAU/USD price.');
  }

  const quote = quoteData ?? {};
  const previousClose = Number(quote.previous_close ?? quote.close);
  const change = Number(quote.change);
  const changePercent = Number(quote.percent_change);

  return {
    symbol: 'XAUUSD',
    price,
    bid: null,
    ask: null,
    change: Number.isFinite(change) ? change : Number.isFinite(previousClose) ? price - previousClose : null,
    changePercent: Number.isFinite(changePercent)
      ? changePercent
      : Number.isFinite(previousClose) && previousClose !== 0
        ? ((price - previousClose) / previousClose) * 100
        : null,
    high24h: Number.isFinite(Number(quote.high)) ? Number(quote.high) : null,
    low24h: Number.isFinite(Number(quote.low)) ? Number(quote.low) : null,
    timestamp: Date.now(),
  };
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'POST is required.' }), {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { symbol, timeframe, limit = 100 } = (await req.json()) as MarketDataRequest;

    if (!symbol || !timeframe) {
      return new Response(JSON.stringify({ error: 'symbol and timeframe are required.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const apiKey = Deno.env.get('MARKET_DATA_API_KEY');
    const apiUrl = Deno.env.get('MARKET_DATA_API_URL') || TWELVE_DATA_DEFAULT_URL;

    if (!apiKey) {
      return new Response(
        JSON.stringify({
          error: 'Live XAUUSD data is not configured. Add MARKET_DATA_API_KEY as a Supabase Edge Function secret.',
        }),
        { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const [candles, livePrice] = await Promise.all([
      fetchCandles(symbol, timeframe, limit, apiUrl, apiKey),
      fetchLivePrice(symbol, apiUrl, apiKey),
    ]);

    if (candles.length === 0) {
      throw new Error('Twelve Data returned no XAU/USD candles.');
    }

    return new Response(
      JSON.stringify({
        symbol: 'XAUUSD',
        timeframe,
        candles,
        livePrice,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch (err) {
    console.error('market-data error:', err);
    return new Response(
      JSON.stringify({
        error: err instanceof Error ? err.message : 'Could not fetch live XAUUSD market data.',
      }),
      { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
});
