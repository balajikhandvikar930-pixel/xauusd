import { StrategyConfig } from '../types';

export const STRATEGY1_CONFIG: StrategyConfig = {
  id: 'strategy1',
  name: 'PDH/PDL Liquidity Sweep + 5M BOS + OB/FVG',
  version: '1.0',
  requiredTimeframes: ['1H', '5M'],
  requiredInputs: ['1h', '5m'],
  conditions: [
    {
      id: 'pdh_detected',
      label: 'PDH identified',
      description: 'Previous Day High must be identified on the 1H chart.',
      required: true,
    },
    {
      id: 'pdl_detected',
      label: 'PDL identified',
      description: 'Previous Day Low must be identified on the 1H chart.',
      required: true,
    },
    {
      id: 'liquidity_sweep',
      label: 'Liquidity sweep (PDH or PDL)',
      description: 'Price must sweep or break either PDH or PDL.',
      required: true,
    },
    {
      id: 'bos_5m',
      label: '5M BOS confirmed',
      description: 'A Break of Structure must be confirmed on the 5M chart after the sweep.',
      required: true,
    },
    {
      id: 'order_block',
      label: 'Order Block detected',
      description: 'A valid Order Block must be identified after the BOS.',
      required: true,
    },
    {
      id: 'entry_retracement',
      label: 'Price retraced into entry zone',
      description: 'Price must retrace into the Order Block (or OB+FVG confluence) zone.',
      required: false,
    },
  ],
  entryRules: [
    {
      id: 'ob_retracement',
      label: 'Order Block retracement entry',
      type: 'OB_RETRACEMENT',
      enabled: true,
    },
    {
      id: 'ob_fvg_confluence',
      label: 'Order Block + FVG confluence entry',
      type: 'OB_FVG_CONFLUENCE',
      enabled: true,
    },
  ],
  stopLossRules: [
    {
      id: 'sl_strategy1',
      label: 'Stop Loss',
      type: 'NOT_DEFINED',
      offsetPoints: null,
      enabled: false,
    },
  ],
  takeProfitRules: [
    {
      id: 'tp_strategy1',
      label: 'Take Profit',
      type: 'RISK_REWARD',
      riskRewardRatio: null,
      enabled: false,
    },
  ],
  incompleteSetupBehavior: 'WAIT',
};
