import { StrategyConfig } from '../types';

export const STRATEGY3_CONFIG: StrategyConfig = {
  id: 'strategy3',
  name: 'Session Liquidity Sweep',
  version: '1.0',
  requiredTimeframes: ['Session (Asian / London / NY)'],
  requiredInputs: ['asian', 'london', 'ny'],
  conditions: [
    {
      id: 'asian_range',
      label: 'Asian High/Low identified',
      description: 'Asian session High and Low must be identified.',
      required: true,
    },
    {
      id: 'london_range',
      label: 'London High/Low identified',
      description: 'London session High and Low must be identified.',
      required: true,
    },
    {
      id: 'asian_sweep',
      label: 'Asian High or Low swept (Asian→London)',
      description:
        'Asian High swept → SELL setup. Asian Low swept → BUY setup.',
      required: false,
    },
    {
      id: 'london_sweep',
      label: 'London High or Low swept (London→NY)',
      description:
        'London High swept → SELL setup. London Low swept → BUY setup.',
      required: false,
    },
    {
      id: 'bos_after_sweep',
      label: 'BOS after sweep',
      description: 'A BOS must be confirmed after the liquidity sweep.',
      required: false,
    },
    {
      id: 'ob_fvg_after_bos',
      label: 'OB/FVG confirmation after BOS',
      description: 'An Order Block or FVG must form after the BOS.',
      required: false,
    },
  ],
  entryRules: [
    {
      id: 'session_sweep_bos_ob',
      label: 'Session sweep + BOS + OB/FVG entry',
      type: 'SESSION_SWEEP_BOS_OB',
      enabled: false,
    },
  ],
  stopLossRules: [
    {
      id: 'sl_strategy3',
      label: 'Stop Loss',
      type: 'NOT_DEFINED',
      offsetPoints: null,
      enabled: false,
    },
  ],
  takeProfitRules: [
    {
      id: 'tp_strategy3',
      label: 'Take Profit',
      type: 'NOT_DEFINED',
      riskRewardRatio: null,
      enabled: false,
    },
  ],
  incompleteSetupBehavior: 'WAIT',
};
