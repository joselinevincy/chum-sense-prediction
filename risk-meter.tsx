'use client';

import { RiskLevel } from '@/lib/types';
import { RISK_COLORS, RISK_LABELS } from '@/lib/constants';

interface RiskMeterProps {
  riskLevel: RiskLevel;
  confidenceScore: number;
}

export function RiskMeter({ riskLevel, confidenceScore }: RiskMeterProps) {
  const color = RISK_COLORS[riskLevel];
  const label = RISK_LABELS[riskLevel];

  // Calculate rotation for the gauge needle
  // Low: 0-60 degrees, Medium: 60-120 degrees, High: 120-180 degrees
  const rotationMap = {
    low: 30,
    medium: 90,
    high: 150,
  };
  const rotation = rotationMap[riskLevel];

  return (
    <div className="flex flex-col items-center gap-8">
      {/* Gauge Container */}
      <div className="relative w-80 h-40">
        {/* Gauge Background Arc */}
        <div className="absolute inset-0 flex items-end justify-center">
          <svg
            width="320"
            height="160"
            viewBox="0 0 320 160"
            className="absolute bottom-0"
          >
            {/* Low Risk Arc (Green) */}
            <path
              d="M 40 160 A 120 120 0 0 1 120 40"
              fill="none"
              stroke="#10b981"
              strokeWidth="12"
              opacity="0.25"
            />
            {/* Medium Risk Arc (Yellow) */}
            <path
              d="M 120 40 A 120 120 0 0 1 200 40"
              fill="none"
              stroke="#f59e0b"
              strokeWidth="12"
              opacity="0.25"
            />
            {/* High Risk Arc (Red) */}
            <path
              d="M 200 40 A 120 120 0 0 1 280 160"
              fill="none"
              stroke="#dc2626"
              strokeWidth="12"
              opacity="0.25"
            />
          </svg>
        </div>

        {/* Center Circle */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-background border-4 border-border"></div>
        </div>

        {/* Needle */}
        <div className="absolute inset-0 flex items-end justify-center pointer-events-none">
          <div
            className="origin-bottom transition-transform duration-500"
            style={{
              transform: `rotate(${rotation}deg)`,
              width: '4px',
              height: '80px',
              backgroundColor: color,
              borderRadius: '2px',
              marginBottom: '20px',
            }}
          />
        </div>

        {/* Labels */}
        <div className="absolute inset-0 flex items-end justify-between px-4 pb-1">
          <span className="text-xs font-medium text-muted-foreground">Low</span>
          <span className="text-xs font-medium text-muted-foreground">High</span>
        </div>
      </div>

      {/* Risk Level Badge */}
      <div className="flex flex-col items-center gap-4">
        <div className="text-center">
          <div
            className="px-6 py-3 rounded-full font-bold text-white text-center text-lg shadow-lg"
            style={{ backgroundColor: color }}
          >
            {label}
          </div>
          <div className="text-sm text-muted-foreground mt-3">
            Confidence Score: <span className="font-semibold text-foreground">{confidenceScore}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
