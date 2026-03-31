'use client';

import Header from '@/components/header';
import { MLTrainingDashboard } from '@/components/ml-training-dashboard';

export default function ModelTrainingPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="flex-1">
        <div className="px-4 py-12 sm:py-16">
          <div className="mx-auto max-w-6xl">
            {/* Header */}
            <div className="mb-12">
              <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">
                ML Model Training
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl">
                Train custom machine learning models on your prediction history. Watch the system learn and improve accuracy as you make more predictions.
              </p>
            </div>

            {/* Training Dashboard */}
            <MLTrainingDashboard />

            {/* Info Section */}
            <div className="mt-12 grid md:grid-cols-2 gap-6">
              <div className="p-6 bg-card border border-border rounded-xl">
                <h3 className="text-lg font-semibold text-foreground mb-3">How It Works</h3>
                <ul className="space-y-3 text-sm text-muted-foreground">
                  <li className="flex gap-3">
                    <span className="font-bold text-primary">1.</span>
                    <span>Make predictions in the dashboard</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="font-bold text-primary">2.</span>
                    <span>Predictions are automatically saved to your history</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="font-bold text-primary">3.</span>
                    <span>Once you have 5+ predictions, train a model</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="font-bold text-primary">4.</span>
                    <span>Review model performance metrics</span>
                  </li>
                </ul>
              </div>

              <div className="p-6 bg-card border border-border rounded-xl">
                <h3 className="text-lg font-semibold text-foreground mb-3">Model Metrics</h3>
                <ul className="space-y-3 text-sm text-muted-foreground">
                  <li className="flex gap-3">
                    <span className="font-bold text-primary">Accuracy</span>
                    <span>Overall correctness of predictions</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="font-bold text-primary">Precision</span>
                    <span>Correctness of positive predictions</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="font-bold text-primary">Recall</span>
                    <span>Coverage of actual positive cases</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="font-bold text-primary">F1 Score</span>
                    <span>Balanced measure of precision and recall</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
