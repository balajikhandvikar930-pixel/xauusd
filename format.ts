import { Signal, SetupStatus, StrategyEngineStatus, StrategyEngineSignal } from './types';
import { formatEngineStatus } from './constants';

export function signalColor(signal: Signal): string {
  switch (signal) {
    case 'BUY':
      return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
    case 'SELL':
      return 'text-red-400 bg-red-500/10 border-red-500/30';
    case 'WAIT':
      return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
    case 'NO_VALID_SETUP':
    case 'NONE':
      return 'text-slate-400 bg-slate-500/10 border-slate-500/30';
  }
}

export function signalDotColor(signal: Signal): string {
  switch (signal) {
    case 'BUY':
      return 'bg-emerald-400';
    case 'SELL':
      return 'bg-red-400';
    case 'WAIT':
      return 'bg-amber-400';
    case 'NO_VALID_SETUP':
    case 'NONE':
      return 'bg-slate-500';
  }
}

export function statusColor(status: SetupStatus): string {
  if (status === 'Confirmed BUY') return 'text-emerald-400';
  if (status === 'Confirmed SELL') return 'text-red-400';
  if (status === 'Entry zone identified' || status === 'BOS confirmed') return 'text-sky-400';
  if (status === 'No setup' || status === 'Insufficient data') return 'text-slate-400';
  return 'text-amber-400';
}

export function engineStatusColor(status: StrategyEngineStatus): string {
  switch (status) {
    case 'CONFIRMED':
      return 'text-emerald-400';
    case 'ENTRY_ZONE_IDENTIFIED':
    case 'BOS_CONFIRMED':
      return 'text-sky-400';
    case 'WAITING_FOR_BOS':
    case 'WAITING_FOR_OB_FVG':
    case 'SETUP_FORMING':
      return 'text-amber-400';
    case 'NO_SETUP':
    case 'INVALID':
    case 'INSUFFICIENT_DATA':
      return 'text-slate-400';
  }
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function signalLabel(r: { signal?: Signal | null }): string {
  return r.signal ?? '—';
}

export { formatEngineStatus };
