import { MarketDataResponse, MarketDataResult, Timeframe } from './types';
import { supabase } from './supabaseClient';

export interface MarketDataRequest {
  symbol: string;
  timeframe: Timeframe;
  limit?: number;
}

export interface MarketDataService {
  fetch(request: MarketDataRequest): Promise<MarketDataResult>;
  isLive(): boolean;
}

// Live-only market data service.
// The provider API key remains inside the Supabase Edge Function.
class RealMarketDataService implements MarketDataService {
  isLive(): boolean {
    return true;
  }

  async fetch(request: MarketDataRequest): Promise<MarketDataResult> {
    const { data: sessionData } = await supabase.auth.getSession();
    const accessToken = sessionData?.session?.access_token;

    if (!accessToken) {
      throw new Error('Not authenticated. Please sign in to load live market data.');
    }

    let response: Response;
    try {
      response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/market-data`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
            apikey: import.meta.env.VITE_SUPABASE_ANON_KEY as string,
          },
          body: JSON.stringify({
            symbol: request.symbol,
            timeframe: request.timeframe,
            limit: request.limit ?? 100,
          }),
        }
      );
    } catch {
      throw new Error('Could not reach the live market-data service.');
    }

    const errorBody = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(
        errorBody?.error ?? `Live market-data request failed (${response.status}).`
      );
    }

    const data = errorBody as MarketDataResponse;

    if (!data.candles || data.candles.length === 0 || !data.livePrice) {
      throw new Error('Live market-data provider returned incomplete XAUUSD data.');
    }

    return {
      candles: data.candles,
      livePrice: data.livePrice,
      status: 'LIVE',
    };
  }
}

// Intentionally no mock fallback in production. A trading application must never
// silently display fabricated prices when live data is unavailable.
export const marketDataService: MarketDataService = new RealMarketDataService();
