// ============================================================
// Core domain types for the XAUUSD AI Trading Analysis app
// ============================================================

export type Signal = 'BUY' | 'SELL' | 'WAIT' | 'NO_VALID_SETUP' | 'NONE';

export type SetupStatus =
  | 'No setup'
  | 'Setup forming'
  | 'Liquidity swept'
  | 'Waiting for BOS'
  | 'BOS confirmed'
  | 'Waiting for OB/FVG'
  | 'Entry zone identified'
  | 'Confirmed BUY'
  | 'Confirmed SELL'
  | 'Insufficient data';

export type StrategyId = 'all' | 'strategy1' | 'strategy2' | 'strategy3';

// ============================================================
// Strategy engine status (separate from UI SetupStatus)
// ============================================================

export type StrategyEngineStatus =
  | 'NO_SETUP'
  | 'SETUP_FORMING'
  | 'WAITING_FOR_BOS'
  | 'BOS_CONFIRMED'
  | 'WAITING_FOR_OB_FVG'
  | 'ENTRY_ZONE_IDENTIFIED'
  | 'CONFIRMED'
  | 'INVALID'
  | 'INSUFFICIENT_DATA';

export type StrategyEngineSignal = 'BUY' | 'SELL' | 'WAIT' | 'NONE';

// ============================================================
// Chart annotations
// ============================================================

export type ChartAnnotation =
  | 'PDH'
  | 'PDL'
  | 'Asian High'
  | 'Asian Low'
  | 'London High'
  | 'London Low'
  | 'Liquidity sweep'
  | 'BOS'
  | 'Order Block'
  | 'FVG'
  | 'Entry'
  | 'SL'
  | 'TP';

export interface AnnotationPoint {
  type: ChartAnnotation;
  label: string;
  price?: number;
  note?: string;
  x?: number;
  y?: number;
}

// ============================================================
// Structured AI Vision output — ChartObservation
// The AI vision model returns chart FACTS, never BUY/SELL.
// ============================================================

export interface LevelDetection {
  detected: boolean;
  price: number | null;
}

export interface LiquiditySweepDetection {
  detected: boolean;
  level: 'PDH' | 'PDL' | 'Asian High' | 'Asian Low' | 'London High' | 'London Low' | null;
  direction: 'bullish' | 'bearish' | null;
  price: number | null;
  candleIndex: number | null;
}

export interface BOSDetection {
  detected: boolean;
  direction: 'bullish' | 'bearish' | null;
  price: number | null;
  candleIndex: number | null;
}

export interface OrderBlockDetection {
  detected: boolean;
  direction: 'bullish' | 'bearish' | null;
  high: number | null;
  low: number | null;
  candleIndex: number | null;
}

export interface FVGDetection {
  detected: boolean;
  direction: 'bullish' | 'bearish' | null;
  high: number | null;
  low: number | null;
}

export interface SessionLevels {
  asianHigh: number | null;
  asianLow: number | null;
  londonHigh: number | null;
  londonLow: number | null;
}

export interface ChartObservation {
  instrument: string;
  timeframe: string;
  chartValid?: boolean;
  chartQuality?: 'good' | 'fair' | 'poor' | null;
  currentPrice?: number | null;
  pdh: LevelDetection;
  pdl: LevelDetection;
  asianHigh?: LevelDetection;
  asianLow?: LevelDetection;
  londonHigh?: LevelDetection;
  londonLow?: LevelDetection;
  liquiditySweep: LiquiditySweepDetection;
  bos: BOSDetection;
  orderBlock: OrderBlockDetection;
  fvg: FVGDetection;
  sessions: SessionLevels;
  retracementIntoOB: boolean | null;
  observations?: string[];
}

export interface ChartObservationSet {
  [slot: string]: ChartObservation;
}

// ============================================================
// Strategy configuration
// ============================================================

export interface StrategyConfig {
  id: Exclude<StrategyId, 'all'>;
  name: string;
  version: string;
  requiredTimeframes: string[];
  requiredInputs: string[];
  conditions: StrategyCondition[];
  entryRules: EntryRule[];
  stopLossRules: StopLossRule[];
  takeProfitRules: TakeProfitRule[];
  incompleteSetupBehavior: 'WAIT' | 'NO_SETUP';
}

export interface StrategyCondition {
  id: string;
  label: string;
  description: string;
  required: boolean;
}

export interface EntryRule {
  id: string;
  label: string;
  type: 'OB_RETRACEMENT' | 'OB_FVG_CONFLUENCE' | 'SESSION_SWEEP_BOS_OB';
  enabled: boolean;
}

export interface StopLossRule {
  id: string;
  label: string;
  type: 'SWEEP_EXTREME' | 'OB_OPPOSITE' | 'NOT_DEFINED';
  offsetPoints: number | null;
  enabled: boolean;
}

export interface TakeProfitRule {
  id: string;
  label: string;
  type: 'RISK_REWARD' | 'NOT_DEFINED';
  riskRewardRatio: number | null;
  enabled: boolean;
}

// ============================================================
// Strategy engine result — output of the deterministic engine
// ============================================================

export interface ConditionCheck {
  id: string;
  label: string;
  satisfied: boolean;
}

export interface DetectedElement {
  type: ChartAnnotation;
  label: string;
  price?: number | null;
  note?: string;
}

export interface TradeLevels {
  entry?: number | null;
  stopLoss?: number | null;
  takeProfit?: number[];
  riskReward?: number | null;
}

export interface StrategyEngineResult {
  strategyId: Exclude<StrategyId, 'all'>;
  strategyName: string;
  strategyVersion: string;
  status: StrategyEngineStatus;
  signal: StrategyEngineSignal;
  conditions: ConditionCheck[];
  conditionCompleteness: number;
  detectedElements: DetectedElement[];
  entry: number | null;
  stopLoss: number | null;
  takeProfit: number[];
  riskReward: number | null;
  reasons: string[];
  invalidation: string | null;
  missingConditions: string[];
  annotations: AnnotationPoint[];
  tradeLevels: TradeLevels;
  summary: string;
}

// ============================================================
// Combined analysis
// ============================================================

export interface StrategyAgreement {
  strategyId: Exclude<StrategyId, 'all'>;
  signal: StrategyEngineSignal;
}

export interface CombinedAnalysis {
  strategyResults: StrategyEngineResult[];
  agreements: StrategyAgreement[];
  conflicts: StrategyAgreement[];
  overallStatus: string;
  explanation: string;
}

// ============================================================
// Full analysis result (stored in DB)
// ============================================================

export interface AnalysisResult {
  strategies: StrategyEngineResult[];
  combined?: CombinedAnalysis;
  chartObservations?: ChartObservationSet;
  isMock: boolean;
}

// ============================================================
// Uploaded image + DB record
// ============================================================

export interface UploadedImage {
  slot: string;
  label: string;
  dataUrl: string;
  fileName: string;
}

export interface AnalysisRecord {
  id: string;
  user_id: string;
  instrument: string;
  strategy: StrategyId;
  signal: Signal | null;
  setup_status: SetupStatus | null;
  status: string | null;
  images: UploadedImage[];
  result: AnalysisResult | null;
  chart_observations: ChartObservationSet | null;
  created_at: string;
}

// ============================================================
// Live market data types (Phase 4)
// ============================================================

export type Timeframe = '1M' | '5M' | '1H';

export interface Candle {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number | null;
}

export interface LivePrice {
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

export interface MarketDataResponse {
  symbol: string;
  timeframe: Timeframe;
  candles: Candle[];
  livePrice: LivePrice | null;
}

export type MarketDataStatus = 'LIVE' | 'MOCK' | 'UNAVAILABLE';

export interface MarketDataResult {
  candles: Candle[];
  livePrice: LivePrice | null;
  status: MarketDataStatus;
  error?: string;
}
