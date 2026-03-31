'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PredictionResult } from '@/lib/types';
import { downloadPDF, generatePDFContent, calculateSummary } from '@/lib/pdf-export';
import { Download, Trash2, BarChart3 } from 'lucide-react';

interface StoredPrediction {
  id: string;
  name: string;
  result: PredictionResult;
  timestamp: number;
}

export function ReportingDashboard() {
  const [predictions, setPredictions] = useState<StoredPrediction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load from localStorage
    const stored = localStorage.getItem('churn_predictions_history');
    if (stored) {
      try {
        setPredictions(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to load predictions:', e);
      }
    }
    setIsLoading(false);
  }, []);

  const handleExportPDF = () => {
    if (predictions.length === 0) return;

    const predictionData = predictions.map(p => ({
      name: p.name,
      result: p.result,
    }));

    const summary = calculateSummary(predictionData.map(p => p.result));
    const htmlContent = generatePDFContent('Churn Prediction Report', predictionData, summary);
    downloadPDF('churn_report.html', htmlContent);
  };

  const handleExportCSV = () => {
    if (predictions.length === 0) return;

    const csv = [
      ['Customer Name', 'Risk Level', 'Confidence Score', 'Date'].join(','),
      ...predictions.map(p =>
        [
          p.name,
          p.result.riskLevel,
          p.result.confidenceScore,
          new Date(p.timestamp).toLocaleDateString(),
        ].join(',')
      ),
    ].join('\n');

    const element = document.createElement('a');
    element.setAttribute('href', `data:text/csv;charset=utf-8,${encodeURIComponent(csv)}`);
    element.setAttribute('download', 'predictions_report.csv');
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleClearHistory = () => {
    if (confirm('Are you sure you want to clear all prediction history?')) {
      setPredictions([]);
      localStorage.removeItem('churn_predictions_history');
    }
  };

  if (isLoading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  if (predictions.length === 0) {
    return (
      <Card className="p-12 text-center border-border">
        <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
        <h3 className="text-xl font-semibold text-foreground mb-2">No Prediction History</h3>
        <p className="text-muted-foreground mb-6">
          Make predictions in the dashboard to see your history and generate reports.
        </p>
        <a href="/dashboard">
          <Button className="bg-primary hover:bg-primary text-primary-foreground">
            Start Predicting
          </Button>
        </a>
      </Card>
    );
  }

  const summary = calculateSummary(predictions.map(p => p.result));

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid md:grid-cols-5 gap-4">
        <Card className="p-4 border-border">
          <p className="text-sm text-muted-foreground mb-1">Total</p>
          <p className="text-3xl font-bold text-primary">{summary.totalPredictions}</p>
        </Card>
        <Card className="p-4 border-border">
          <p className="text-sm text-muted-foreground mb-1">High Risk</p>
          <p className="text-3xl font-bold text-red-600">{summary.highRiskCount}</p>
        </Card>
        <Card className="p-4 border-border">
          <p className="text-sm text-muted-foreground mb-1">Medium Risk</p>
          <p className="text-3xl font-bold text-yellow-600">{summary.mediumRiskCount}</p>
        </Card>
        <Card className="p-4 border-border">
          <p className="text-sm text-muted-foreground mb-1">Low Risk</p>
          <p className="text-3xl font-bold text-green-600">{summary.lowRiskCount}</p>
        </Card>
        <Card className="p-4 border-border">
          <p className="text-sm text-muted-foreground mb-1">Avg Confidence</p>
          <p className="text-3xl font-bold text-primary">{summary.averageConfidenceScore.toFixed(1)}%</p>
        </Card>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button onClick={handleExportPDF} className="flex-1 bg-primary hover:bg-primary text-primary-foreground">
          <Download className="h-4 w-4 mr-2" />
          Export as Report
        </Button>
        <Button onClick={handleExportCSV} variant="outline" className="flex-1">
          <Download className="h-4 w-4 mr-2" />
          Export as CSV
        </Button>
        <Button onClick={handleClearHistory} variant="outline" className="flex-1 text-destructive hover:text-destructive">
          <Trash2 className="h-4 w-4 mr-2" />
          Clear History
        </Button>
      </div>

      {/* Predictions Table */}
      <Card className="overflow-hidden border-border">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-muted border-b border-border">
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                  Risk Level
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                  Confidence
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                  Date
                </th>
              </tr>
            </thead>
            <tbody>
              {predictions.map((pred) => (
                <tr key={pred.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                  <td className="px-6 py-4 text-sm text-foreground">{pred.name}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      pred.result.riskLevel === 'HIGH'
                        ? 'bg-red-100 text-red-800'
                        : pred.result.riskLevel === 'MEDIUM'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {pred.result.riskLevel}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-foreground">{pred.result.confidenceScore}%</td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    {new Date(pred.timestamp).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
