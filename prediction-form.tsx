'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { CustomerData, PredictionResult } from '@/lib/types';
import { getCachedPrediction, cachePrediction, generateCacheKey } from '@/lib/cache';

interface PredictionFormProps {
  onPredictionResult: (result: PredictionResult, name: string) => void;
}

export function PredictionForm({ onPredictionResult }: PredictionFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [engine, setEngine] = useState<'rule-based' | 'ml'>('rule-based');
  const [formData, setFormData] = useState<CustomerData>({
    name: '',
    tenure: 0,
    monthlyCharges: 0,
    totalCharges: 0,
    complaintCount: 0,
    billingComplaints: 0,
    interactionCount: 0,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numericFields = [
      'tenure',
      'monthlyCharges',
      'totalCharges',
      'complaintCount',
      'billingComplaints',
      'interactionCount',
    ];

    setFormData((prev) => ({
      ...prev,
      [name]: numericFields.includes(name) ? parseFloat(value) || 0 : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Validate inputs
      if (!formData.name.trim()) {
        throw new Error('Customer name is required');
      }

      // Check cache first
      if (engine === 'rule-based') {
        const cached = getCachedPrediction(formData);
        if (cached) {
          onPredictionResult(cached, formData.name);
          setLoading(false);
          return;
        }
      }

      const endpoint = engine === 'ml' ? '/api/predict/ml' : '/api/predict';
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Prediction failed');
      }

      const result: PredictionResult = await response.json();
      
      // Cache the result
      if (engine === 'rule-based') {
        cachePrediction(formData, result);
      }
      
      onPredictionResult(result, formData.name);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred';
      setError(message);
      console.error('Form submission error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-3xl p-8 shadow-lg border-border">
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Error Message */}
        {error && (
          <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-xl text-sm text-destructive">
            <p className="font-medium">Error:</p>
            <p>{error}</p>
          </div>
        )}

        {/* Engine Selection Section */}
        <div className="space-y-4 pb-6 border-b border-border">
          <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-primary"></span>
            Prediction Engine
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <label className={`cursor-pointer flex flex-col items-center justify-center p-4 border rounded-lg transition-colors ${engine === 'rule-based' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`}>
              <input type="radio" name="engine" value="rule-based" className="sr-only" checked={engine === 'rule-based'} onChange={() => setEngine('rule-based')} />
              <span className="font-medium text-sm">Rule-Based API</span>
              <span className="text-xs text-muted-foreground text-center mt-1">Standard deterministic prediction</span>
            </label>
            <label className={`cursor-pointer flex flex-col items-center justify-center p-4 border rounded-lg transition-colors ${engine === 'ml' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`}>
              <input type="radio" name="engine" value="ml" className="sr-only" checked={engine === 'ml'} onChange={() => setEngine('ml')} />
              <span className="font-medium text-sm">Machine Learning</span>
              <span className="text-xs text-muted-foreground text-center mt-1">Advanced pattern recognition</span>
            </label>
          </div>
        </div>

        {/* Customer Info Section */}
        <div className="space-y-4 pb-6 border-b border-border">
          <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-primary"></span>
            Customer Information
          </h3>
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-1">
              Customer Name *
            </label>
            <Input
              id="name"
              name="name"
              type="text"
              placeholder="e.g., John Smith"
              value={formData.name}
              onChange={handleInputChange}
              disabled={loading}
              required
            />
          </div>
        </div>

        {/* Billing & Charges Section */}
        <div className="space-y-4 pb-6 border-b border-border">
          <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-primary"></span>
            Billing & Charges
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="tenure" className="block text-sm font-medium mb-1">
                Tenure (months) *
              </label>
              <Input
                id="tenure"
                name="tenure"
                type="number"
                placeholder="0"
                min="0"
                value={formData.tenure || ''}
                onChange={handleInputChange}
                disabled={loading}
                required
              />
              <p className="text-xs text-muted-foreground mt-1">
                Months customer has been with company
              </p>
            </div>
            <div>
              <label htmlFor="monthlyCharges" className="block text-sm font-medium mb-1">
                Monthly Charges ($) *
              </label>
              <Input
                id="monthlyCharges"
                name="monthlyCharges"
                type="number"
                placeholder="0"
                min="0"
                step="0.01"
                value={formData.monthlyCharges || ''}
                onChange={handleInputChange}
                disabled={loading}
                required
              />
            </div>
            <div>
              <label htmlFor="totalCharges" className="block text-sm font-medium mb-1">
                Total Charges ($) *
              </label>
              <Input
                id="totalCharges"
                name="totalCharges"
                type="number"
                placeholder="0"
                min="0"
                step="0.01"
                value={formData.totalCharges || ''}
                onChange={handleInputChange}
                disabled={loading}
                required
              />
            </div>
          </div>
        </div>

        {/* Service Quality Section */}
        <div className="space-y-4 pb-6 border-b border-border">
          <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-primary"></span>
            Service Quality
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="complaintCount" className="block text-sm font-medium mb-1">
                Complaint Count *
              </label>
              <Input
                id="complaintCount"
                name="complaintCount"
                type="number"
                placeholder="0"
                min="0"
                value={formData.complaintCount || ''}
                onChange={handleInputChange}
                disabled={loading}
                required
              />
              <p className="text-xs text-muted-foreground mt-1">
                Number of service complaints
              </p>
            </div>
            <div>
              <label htmlFor="billingComplaints" className="block text-sm font-medium mb-1">
                Billing Complaints *
              </label>
              <Input
                id="billingComplaints"
                name="billingComplaints"
                type="number"
                placeholder="0"
                min="0"
                value={formData.billingComplaints || ''}
                onChange={handleInputChange}
                disabled={loading}
                required
              />
              <p className="text-xs text-muted-foreground mt-1">
                Number of billing-related complaints
              </p>
            </div>
          </div>
        </div>

        {/* Engagement Section */}
        <div className="space-y-4 pb-6 border-b border-border">
          <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-primary"></span>
            Customer Engagement
          </h3>
          <div>
            <label htmlFor="interactionCount" className="block text-sm font-medium mb-1">
              Interaction Count *
            </label>
            <Input
              id="interactionCount"
              name="interactionCount"
              type="number"
              placeholder="0"
              min="0"
              value={formData.interactionCount || ''}
              onChange={handleInputChange}
              disabled={loading}
              required
            />
            <p className="text-xs text-muted-foreground mt-1">
              Number of support/engagement interactions
            </p>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-4">
          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-primary text-primary-foreground font-semibold py-6 rounded-lg transition-all"
            size="lg"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                Analyzing Customer Data...
              </span>
            ) : (
              'Predict Churn Risk'
            )}
          </Button>
        </div>

        <p className="text-xs text-muted-foreground text-center pt-2">
          All fields marked with * are required. Results are instant.
        </p>
      </form>
    </Card>
  );
}
