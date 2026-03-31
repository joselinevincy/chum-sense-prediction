'use client';

import { useEffect } from 'react';
import { PredictionResult } from '@/lib/types';
import { Card } from '@/components/ui/card';
import { RiskMeter } from './risk-meter';
import { CheckCircle2, AlertCircle, TrendingUp } from 'lucide-react';

interface PredictionResultProps {
  result: PredictionResult;
  customerName?: string;
}

export function PredictionResultComponent({ result, customerName }: PredictionResultProps) {
  useEffect(() => {
    // Save prediction to localStorage for reporting
    const stored = localStorage.getItem('churn_predictions_history');
    const history = stored ? JSON.parse(stored) : [];
    
    history.push({
      id: `pred_${Date.now()}`,
      name: customerName || 'Unknown',
      result,
      timestamp: Date.now(),
    });
    
    // Keep only last 100 predictions
    if (history.length > 100) {
      history.shift();
    }
    
    localStorage.setItem('churn_predictions_history', JSON.stringify(history));
  }, [result, customerName]);
  const getRiskIcon = () => {
    switch (result.riskLevel) {
      case 'high':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'medium':
        return <TrendingUp className="w-5 h-5 text-yellow-500" />;
      case 'low':
        return <CheckCircle2 className="w-5 h-5 text-green-500" />;
    }
  };

  return (
    <div className="w-full max-w-3xl space-y-6 animate-in fade-in-50 duration-300">
      {/* Risk Meter */}
      <Card className="p-10 flex justify-center bg-card shadow-lg border-border">
        <RiskMeter
          riskLevel={result.riskLevel}
          confidenceScore={result.confidenceScore}
        />
      </Card>

      {/* Reasoning Section */}
      <Card className="p-8 space-y-3 shadow-md border-border">
        <div className="flex items-center gap-3 mb-4">
          {getRiskIcon()}
          <h3 className="text-xl font-semibold text-foreground">Prediction Analysis</h3>
        </div>
        <p className="text-foreground leading-relaxed text-lg">{result.reasoning}</p>
      </Card>

      {/* Risk Factors Section */}
      <Card className="p-8 space-y-4 shadow-md border-border">
        <h3 className="text-xl font-semibold text-foreground mb-6">Contributing Factors</h3>
        <div className="space-y-3">
          {result.factors.map((factor, index) => (
            <div key={index} className="flex items-start gap-3 pb-3 border-b border-border last:border-b-0 last:pb-0">
              <div className="mt-1">
                {factor.impact === 'positive' && (
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                )}
                {factor.impact === 'negative' && (
                  <AlertCircle className="w-4 h-4 text-red-500" />
                )}
                {factor.impact === 'neutral' && (
                  <div className="w-4 h-4 rounded-full bg-gray-400" />
                )}
              </div>
              <div className="flex-1">
                <div className="font-medium text-foreground">{factor.name}</div>
                <div className="text-sm text-muted-foreground">
                  {typeof factor.value === 'number'
                    ? factor.value.toFixed(2)
                    : factor.value}
                </div>
              </div>
              <div className="text-xs font-medium px-2 py-1 rounded bg-muted">
                {factor.impact === 'positive' ? 'Positive' : factor.impact === 'negative' ? 'Risk Factor' : 'Neutral'}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Recommendations Section */}
      <Card className="p-8 space-y-4 bg-accent/5 border-accent/20 shadow-md">
        <h3 className="text-xl font-semibold text-foreground mb-6">Recommended Actions</h3>
        <ul className="space-y-3">
          {result.recommendations.map((recommendation, index) => (
            <li key={index} className="flex items-start gap-4">
              <div className="mt-1 h-8 w-8 rounded-full bg-accent text-accent-foreground flex items-center justify-center flex-shrink-0 font-semibold text-sm">
                {index + 1}
              </div>
              <span className="text-foreground text-base leading-relaxed pt-1">{recommendation}</span>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
