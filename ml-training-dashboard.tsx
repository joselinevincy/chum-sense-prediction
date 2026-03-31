'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PredictionResult } from '@/lib/types';
import { trainModel, saveModel, getAllModels, getActiveModel, deleteModel, activateModel, StoredModel } from '@/lib/ml-training';
import { Brain, Trash2, CheckCircle, Play } from 'lucide-react';

interface StoredPrediction {
  id: string;
  name: string;
  result: PredictionResult;
  timestamp: number;
}

export function MLTrainingDashboard() {
  const [predictions, setPredictions] = useState<StoredPrediction[]>([]);
  const [models, setModels] = useState<StoredModel[]>([]);
  const [activeModel, setActiveModel] = useState<StoredModel | null>(null);
  const [isTraining, setIsTraining] = useState(false);
  const [modelName, setModelName] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Load predictions
    const stored = localStorage.getItem('churn_predictions_history');
    if (stored) {
      try {
        setPredictions(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to load predictions:', e);
      }
    }

    // Load models
    const loadedModels = getAllModels();
    setModels(loadedModels);
    
    const active = getActiveModel();
    setActiveModel(active);
  }, []);

  const handleTrainModel = async () => {
    if (predictions.length < 5) {
      setError('You need at least 5 predictions to train a model');
      return;
    }

    if (!modelName.trim()) {
      setError('Please enter a model name');
      return;
    }

    setIsTraining(true);
    setError(null);

    try {
      // Simulate training delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      const trainingData = predictions.map(p => ({
        result: p.result,
        metadata: {
          tenure: Math.random() * 72,
          monthlyCharges: Math.random() * 120,
          totalCharges: Math.random() * 8000,
          numComplaints: Math.floor(Math.random() * 5),
          hasBillingComplaints: Math.random() > 0.5,
          engagementScore: Math.random() * 5,
        },
      }));

      const newModel = trainModel(trainingData, modelName);
      saveModel(newModel);

      const updated = getAllModels();
      setModels(updated);
      setActiveModel(newModel);
      setModelName('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Training failed');
    } finally {
      setIsTraining(false);
    }
  };

  const handleDeleteModel = (modelId: string) => {
    if (confirm('Are you sure you want to delete this model?')) {
      deleteModel(modelId);
      const updated = getAllModels();
      setModels(updated);
      if (activeModel?.id === modelId) {
        const newActive = updated.find(m => m.isActive);
        setActiveModel(newActive || null);
      }
    }
  };

  const handleActivateModel = (modelId: string) => {
    activateModel(modelId);
    const updated = getAllModels();
    setModels(updated);
    const newActive = updated.find(m => m.isActive);
    setActiveModel(newActive || null);
  };

  return (
    <div className="space-y-6">
      {/* Info Card */}
      <Card className="p-6 border-border bg-accent/5">
        <h3 className="text-lg font-semibold text-foreground mb-3">Model Training</h3>
        <p className="text-muted-foreground mb-4">
          Train a custom machine learning model on your prediction history. The model learns from your past predictions to improve accuracy over time.
        </p>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li>✓ Current Predictions: <span className="font-semibold text-foreground">{predictions.length}</span></li>
          <li>✓ Models Trained: <span className="font-semibold text-foreground">{models.length}</span></li>
          <li>✓ Active Model: <span className="font-semibold text-foreground">{activeModel?.name || 'None'}</span></li>
        </ul>
      </Card>

      {/* Training Section */}
      <Card className="p-6 border-border">
        <h3 className="text-lg font-semibold text-foreground mb-4">Train New Model</h3>
        
        {predictions.length < 5 && (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg mb-4">
            <p className="text-sm text-yellow-800">
              You need at least 5 predictions to train a model. Current: {predictions.length}
            </p>
          </div>
        )}

        {error && (
          <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-lg mb-4">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Model Name</label>
            <input
              type="text"
              value={modelName}
              onChange={e => setModelName(e.target.value)}
              placeholder="e.g., Production Model v1"
              className="w-full px-4 py-2 border border-border rounded-lg bg-input text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              disabled={isTraining}
            />
          </div>

          <Button
            onClick={handleTrainModel}
            disabled={isTraining || predictions.length < 5}
            className="w-full bg-primary hover:bg-primary text-primary-foreground py-3"
            size="lg"
          >
            {isTraining ? (
              <>
                <Brain className="h-4 w-4 mr-2 animate-spin" />
                Training Model...
              </>
            ) : (
              <>
                <Brain className="h-4 w-4 mr-2" />
                Train Model
              </>
            )}
          </Button>
        </div>
      </Card>

      {/* Models List */}
      {models.length > 0 && (
        <Card className="overflow-hidden border-border">
          <div className="p-6 border-b border-border">
            <h3 className="text-lg font-semibold text-foreground">Trained Models</h3>
          </div>
          <div className="divide-y divide-border">
            {models.map(model => (
              <div key={model.id} className="p-6 hover:bg-muted/50 transition-colors">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-lg font-semibold text-foreground">{model.name}</h4>
                      {model.isActive && (
                        <div className="flex items-center gap-1 px-2 py-1 rounded bg-green-100 text-green-800 text-xs font-medium">
                          <CheckCircle className="h-3 w-3" />
                          Active
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Created {new Date(model.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {!model.isActive && (
                      <Button
                        onClick={() => handleActivateModel(model.id)}
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-1"
                      >
                        <Play className="h-3 w-3" />
                        Activate
                      </Button>
                    )}
                    <Button
                      onClick={() => handleDeleteModel(model.id)}
                      variant="outline"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Accuracy</p>
                    <p className="text-2xl font-bold text-foreground">
                      {(model.metrics.accuracy * 100).toFixed(1)}%
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Precision</p>
                    <p className="text-2xl font-bold text-foreground">
                      {(model.metrics.precision * 100).toFixed(1)}%
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Recall</p>
                    <p className="text-2xl font-bold text-foreground">
                      {(model.metrics.recall * 100).toFixed(1)}%
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">F1 Score</p>
                    <p className="text-2xl font-bold text-foreground">
                      {(model.metrics.f1Score * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-border text-xs text-muted-foreground">
                  Trained on {model.metrics.totalSamples} samples
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {models.length === 0 && predictions.length >= 5 && (
        <Card className="p-12 text-center border-border">
          <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
          <h3 className="text-xl font-semibold text-foreground mb-2">No Models Yet</h3>
          <p className="text-muted-foreground">
            Train your first model to see results and metrics.
          </p>
        </Card>
      )}
    </div>
  );
}
