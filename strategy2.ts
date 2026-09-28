import { StrategyConfig } from '../types';

export const STRATEGY2_CONFIG: StrategyConfig = {
  id: 'strategy2',
  name: 'PDH/PDL Break + 1M Order Block Retracement',
  version: '1.0',
  requiredTimeframes: ['1M'],
  requiredInputs: ['1m'],
  conditions: [
    {
      id: 'pdh_detected',
      label: 'PDH identified',
      description: 'Previous Day High must be identified.',
      required: true,
    },
    {
      id: 'pdl_detected',
      label: 'PDL identified',
      description: 'Previous Day Low must be identified.',
      required: true,
    },
    {
      id: 'level_break',
      label: 'PDH or PDL broken',
      description: 'Price must break PDH (SELL bias) or PDL (BUY bias).',
      required: true,
    },
    {
      id: 'order_block',
      label: 'Last opposing candle OB identified',
      description:
        'For PDL break / BUY: the last bullish candle before the break move is the Order Block. ' +
        'For PDH break / SELL: the last bearish candle before the break move is the Order Block.',
      required: true,
    },
    {
      id: 'retracement_into_ob',
      label: 'Price retraced into Order Block',
      description: 'Price must retrace into the identified Order Block before entry.',
      required: true,
    },
  ],
  entryRules: [
    {
      id: 'ob_retracement_entry',
      label: 'OB retracement entry (no additional confirmation)',
      type: 'OB_RETRACEMENT',
      enabled: true,
    },
  ],
  stopLossRules: [
    {
      id: 'sl_strategy2',
      label: 'Stop Loss',
      type: 'NOT_DEFINED',
      offsetPoints: null,
      enabled: false,
    },
  ],
  takeProfitRules: [
    {
      id: 'tp_strategy2',
      label: 'Take Profit',
      type: 'NOT_DEFINED',
      riskRewardRatio: null,
      enabled: false,
    },
  ],
  incompleteSetupBehavior: 'WAIT',
};
