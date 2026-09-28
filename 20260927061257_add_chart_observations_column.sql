/*
# Add chart_observations and status columns to analyses

1. Modified Tables
- `analyses`
  - Add `chart_observations` jsonb — stores the structured AI vision output per screenshot slot
  - Add `status` text — stores the strategy engine status (e.g. CONFIRMED, WAITING_FOR_BOS, INSUFFICIENT_DATA)

2. Notes
- These columns support Phase 2's deterministic strategy engine pipeline.
- `chart_observations` holds the raw chart facts (PDH, PDL, sweeps, BOS, OB, FVG, sessions) returned by the AI vision API.
- `status` stores the engine's evaluation status separate from the UI-level signal/setup_status.
- Both columns are nullable so existing Phase 1 records remain valid.
- The `result` jsonb column now stores the full StrategyEngineResult[] + CombinedAnalysis output.
*/

ALTER TABLE analyses
  ADD COLUMN IF NOT EXISTS chart_observations jsonb DEFAULT null,
  ADD COLUMN IF NOT EXISTS status text DEFAULT null;