import { Signal, SetupStatus, StrategyEngineStatus, StrategyEngineSignal } from '@/lib/types';
import { signalColor, statusColor, engineStatusColor, formatEngineStatus } from '@/lib/format';

export function SignalBadge({ signal, size = 'md' }: { signal: Signal | StrategyEngineSignal; size?: 'sm' | 'md' | 'lg' }) {
  const sizes = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-1.5',
  };
  const display = signal === 'NONE' ? 'NONE' : signal;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border font-semibold ${signalColor(signal as Signal)} ${sizes[size]}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${signal === 'BUY' ? 'bg-emerald-400' : signal === 'SELL' ? 'bg-red-400' : signal === 'WAIT' ? 'bg-amber-400' : 'bg-slate-500'}`} />
      {display}
    </span>
  );
}

export function StatusBadge({ status }: { status: SetupStatus }) {
  return (
    <span className={`text-xs font-medium ${statusColor(status)}`}>
      {status}
    </span>
  );
}

export function EngineStatusBadge({ status }: { status: StrategyEngineStatus }) {
  return (
    <span className={`text-xs font-medium ${engineStatusColor(status)}`}>
      {formatEngineStatus(status)}
    </span>
  );
}
