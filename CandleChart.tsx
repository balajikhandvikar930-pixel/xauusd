import { useMemo } from 'react';
import { Candle } from '@/lib/types';

interface CandleChartProps {
  candles: Candle[];
  height?: number;
  showVolume?: boolean;
}

export function CandleChart({ candles, height = 320, showVolume = false }: CandleChartProps) {
  const chartHeight = showVolume ? height * 0.75 : height;
  const volumeHeight = showVolume ? height * 0.25 : 0;
  const padding = { top: 10, right: 60, bottom: 10, left: 10 };

  const { paths, priceRange, volumeRange } = useMemo(() => {
    if (candles.length === 0) {
      return { paths: null, priceRange: null, volumeRange: null };
    }

    const prices = candles.flatMap((c) => [c.high, c.low]);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const pricePadding = (maxPrice - minPrice) * 0.05;
    const pMin = minPrice - pricePadding;
    const pMax = maxPrice + pricePadding;

    const volumes = candles.map((c) => c.volume ?? 0);
    const maxVol = Math.max(...volumes, 1);

    const innerWidth = 1000;
    const innerHeight = chartHeight - padding.top - padding.bottom;
    const candleWidth = innerWidth / candles.length;
    const bodyWidth = Math.max(candleWidth * 0.6, 1);

    const priceToY = (price: number) =>
      padding.top + innerHeight - ((price - pMin) / (pMax - pMin)) * innerHeight;

    const elements = candles.map((c, i) => {
      const cx = i * candleWidth + candleWidth / 2;
      const isBull = c.close >= c.open;
      const color = isBull ? '#34d399' : '#f87171';
      const yHigh = priceToY(c.high);
      const yLow = priceToY(c.low);
      const yOpen = priceToY(c.open);
      const yClose = priceToY(c.close);
      const bodyTop = Math.min(yOpen, yClose);
      const bodyHeight = Math.max(Math.abs(yClose - yOpen), 1);

      const volBarHeight = c.volume
        ? (c.volume / maxVol) * (volumeHeight - 10)
        : 0;
      const volY = height - volBarHeight;

      return {
        cx,
        yHigh,
        yLow,
        bodyTop,
        bodyHeight,
        bodyWidth,
        color,
        isBull,
        volBarHeight,
        volY,
        close: c.close,
      };
    });

    // Grid lines (5 horizontal)
    const gridLines = [];
    for (let i = 0; i <= 4; i++) {
      const price = pMin + ((pMax - pMin) * i) / 4;
      const y = priceToY(price);
      gridLines.push({ y, price });
    }

    return {
      paths: { elements, gridLines, innerWidth },
      priceRange: { min: pMin, max: pMax },
      volumeRange: { max: maxVol },
    };
  }, [candles, chartHeight, volumeHeight, height, padding.top, padding.bottom]);

  if (!paths || !priceRange) {
    return (
      <div
        className="flex items-center justify-center rounded-lg bg-black/30 text-sm text-slate-600"
        style={{ height }}
      >
        No candle data
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg bg-black/30 border border-white/5">
      <svg
        viewBox={`0 0 ${paths.innerWidth} ${height}`}
        className="w-full"
        style={{ height }}
        preserveAspectRatio="none"
      >
        {/* Grid lines + price labels */}
        {paths.gridLines.map((g, i) => (
          <g key={i}>
            <line
              x1={0}
              x2={paths.innerWidth - padding.right}
              y1={g.y}
              y2={g.y}
              stroke="rgba(255,255,255,0.05)"
              strokeWidth={0.5}
            />
            <text
              x={paths.innerWidth - padding.right + 6}
              y={g.y + 3}
              fill="rgba(255,255,255,0.3)"
              fontSize={10}
              fontFamily="monospace"
            >
              {g.price.toFixed(1)}
            </text>
          </g>
        ))}

        {/* Candles */}
        {paths.elements.map((e, i) => (
          <g key={i}>
            {/* Wick */}
            <line
              x1={e.cx}
              x2={e.cx}
              y1={e.yHigh}
              y2={e.yLow}
              stroke={e.color}
              strokeWidth={1}
            />
            {/* Body */}
            <rect
              x={e.cx - e.bodyWidth / 2}
              y={e.bodyTop}
              width={e.bodyWidth}
              height={e.bodyHeight}
              fill={e.color}
              opacity={e.isBull ? 0.9 : 1}
            />
            {/* Volume bar */}
            {showVolume && e.volBarHeight > 0 && (
              <rect
                x={e.cx - e.bodyWidth / 2}
                y={e.volY}
                width={e.bodyWidth}
                height={e.volBarHeight}
                fill={e.color}
                opacity={0.2}
              />
            )}
          </g>
        ))}
      </svg>
    </div>
  );
}
