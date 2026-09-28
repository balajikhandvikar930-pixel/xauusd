import { StrategyId, ChartAnnotation, Signal, SetupStatus, StrategyEngineStatus, StrategyEngineSignal } from './types';
import { getStrategyConfig } from './strategies';

export const INSTRUMENT = 'XAUUSD';

export interface StrategyMeta {
  id: StrategyId;
  name: string;
  shortName: string;
  description: string;
  timeframe: string;
  version: string;
  uploadFields: { slot: string; label: string }[];
}

function buildMeta(id: Exclude<StrategyId, 'all'>): StrategyMeta {
  const config = getStrategyConfig(id);
  const slots: Record<string, { slot: string; label: string }[]> = {
    strategy1: [
      { slot: '1h', label: '1H TradingView screenshot' },
      { slot: '5m', label: '5M TradingView screenshot' },
    ],
    strategy2: [
      { slot: '1m', label: '1M TradingView screenshot' },
    ],
    strategy3: [
      { slot: 'asian', label: 'Asian session screenshot' },
      { slot: 'london', label: 'London session screenshot' },
      { slot: 'ny', label: 'New York session screenshot' },
    ],
  };
  return {
    id,
    name: config.name,
    shortName: id === 'strategy1' ? 'Strategy 1' : id === 'strategy2' ? 'Strategy 2' : 'Strategy 3',
    description: config.name,
    timeframe: config.requiredTimeframes.join(' + '),
    version: config.version,
    uploadFields: slots[id],
  };
}

export const STRATEGIES: StrategyMeta[] = [
  buildMeta('strategy1'),
  buildMeta('strategy2'),
  buildMeta('strategy3'),
];

export const ALL_STRATEGIES = 'all' as const;

export const ANNOTATION_TYPES: ChartAnnotation[] = [
  'PDH',
  'PDL',
  'Asian High',
  'Asian Low',
  'London High',
  'London Low',
  'Liquidity sweep',
  'BOS',
  'Order Block',
  'FVG',
  'Entry',
  'SL',
  'TP',
];

export const SIGNALS: Signal[] = ['BUY', 'SELL', 'WAIT', 'NO_VALID_SETUP'];

export const SETUP_STATUSES: SetupStatus[] = [
  'No setup',
  'Setup forming',
  'Liquidity swept',
  'Waiting for BOS',
  'BOS confirmed',
  'Waiting for OB/FVG',
  'Entry zone identified',
  'Confirmed BUY',
  'Confirmed SELL',
  'Insufficient data',
];

export const ENGINE_STATUSES: StrategyEngineStatus[] = [
  'NO_SETUP',
  'SETUP_FORMING',
  'WAITING_FOR_BOS',
  'BOS_CONFIRMED',
  'WAITING_FOR_OB_FVG',
  'ENTRY_ZONE_IDENTIFIED',
  'CONFIRMED',
  'INVALID',
  'INSUFFICIENT_DATA',
];

export function getStrategy(id: StrategyId): StrategyMeta | undefined {
  if (id === 'all') return undefined;
  return STRATEGIES.find((s) => s.id === id);
}

// Convert engine status to UI SetupStatus
export function engineStatusToSetupStatus(status: StrategyEngineStatus): SetupStatus {
  switch (status) {
    case 'NO_SETUP':
      return 'No setup';
    case 'SETUP_FORMING':
      return 'Setup forming';
    case 'WAITING_FOR_BOS':
      return 'Waiting for BOS';
    case 'BOS_CONFIRMED':
      return 'BOS confirmed';
    case 'WAITING_FOR_OB_FVG':
      return 'Waiting for OB/FVG';
    case 'ENTRY_ZONE_IDENTIFIED':
      return 'Entry zone identified';
    case 'CONFIRMED':
      return 'Confirmed BUY';
    case 'INVALID':
      return 'No setup';
    case 'INSUFFICIENT_DATA':
      return 'Insufficient data';
  }
}

// Convert engine signal to UI Signal
export function engineSignalToSignal(signal: StrategyEngineSignal): Signal {
  switch (signal) {
    case 'BUY':
      return 'BUY';
    case 'SELL':
      return 'SELL';
    case 'WAIT':
      return 'WAIT';
    case 'NONE':
      return 'NO_VALID_SETUP';
  }
}

// Pretty-label an engine status
export function formatEngineStatus(status: StrategyEngineStatus): string {
  return status
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
}
