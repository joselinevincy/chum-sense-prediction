'use client';

import { useState, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { parseCSVFile, downloadCSV, generateCSVTemplate, BatchPredictionResult } from '@/lib/csv-parser';
import { Upload, Download, CheckCircle, AlertCircle, Loader } from 'lucide-react';

export function BatchUploadComponent() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<BatchPredictionResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError(null);
      setResults([]);
    }
  };

  const handleProcessFile = async () => {
    if (!file) {
      setError('Please select a file');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const customers = await parseCSVFile(file);
      const batchResults: BatchPredictionResult[] = [];

      for (let i = 0; i < customers.length; i++) {
        try {
          const response = await fetch('/api/predict', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(customers[i]),
          });

          if (!response.ok) {
            throw new Error('Prediction failed');
          }

          const prediction = await response.json();
          batchResults.push({
            customerId: `customer_${i + 1}`,
            customerName: customers[i].name,
            prediction,
            status: 'success',
          });
        } catch (err) {
          batchResults.push({
            customerId: `customer_${i + 1}`,
            customerName: customers[i].name,
            prediction: null as any,
            status: 'error',
            error: err instanceof Error ? err.message : 'Unknown error',
          });
        }
      }

      setResults(batchResults);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process file');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownloadTemplate = () => {
    const csv = generateCSVTemplate();
    downloadCSV('churn_prediction_template.csv', csv);
  };

  const handleDownloadResults = () => {
    if (results.length === 0) return;

    const csv = [
      ['Customer Name', 'Risk Level', 'Confidence Score', 'Status'].join(','),
      ...results.map(r => [
        r.customerName,
        r.status === 'success' ? r.prediction.riskLevel : 'N/A',
        r.status === 'success' ? r.prediction.confidenceScore : 'N/A',
        r.status,
      ].join(',')),
    ].join('\n');

    downloadCSV('churn_predictions_results.csv', csv);
  };

  return (
    <div className="w-full space-y-6">
      {/* Instructions Card */}
      <Card className="p-6 border-border bg-card">
        <h3 className="text-lg font-semibold text-foreground mb-4">Batch Prediction Upload</h3>
        <p className="text-muted-foreground mb-4">
          Upload a CSV file with customer data to predict churn risk for multiple customers at once.
        </p>
        <Button
          onClick={handleDownloadTemplate}
          variant="outline"
          className="flex items-center gap-2"
        >
          <Download className="h-4 w-4" />
          Download CSV Template
        </Button>
      </Card>

      {/* Upload Area */}
      <Card className="p-8 border-2 border-dashed border-border hover:border-primary transition-colors">
        <div className="flex flex-col items-center justify-center gap-4 text-center">
          <Upload className="h-12 w-12 text-muted-foreground" />
          <div>
            <p className="text-lg font-semibold text-foreground mb-1">
              {file ? file.name : 'Select a CSV file'}
            </p>
            <p className="text-sm text-muted-foreground">
              {file ? 'Ready to process' : 'Drag and drop your CSV file here'}
            </p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="hidden"
          />
          <Button onClick={() => fileInputRef.current?.click()} variant="outline">
            Choose File
          </Button>
        </div>
      </Card>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-xl text-destructive">
          <p className="font-medium">Error:</p>
          <p>{error}</p>
        </div>
      )}

      {/* Process Button */}
      {file && !isProcessing && results.length === 0 && (
        <Button
          onClick={handleProcessFile}
          className="w-full bg-primary hover:bg-primary text-primary-foreground py-6 rounded-lg font-semibold"
          size="lg"
        >
          Process File
        </Button>
      )}

      {/* Processing State */}
      {isProcessing && (
        <div className="p-6 bg-card border border-border rounded-xl flex items-center gap-4 justify-center">
          <Loader className="h-5 w-5 animate-spin text-primary" />
          <p className="text-foreground font-medium">Processing {results.length} customers...</p>
        </div>
      )}

      {/* Results Table */}
      {results.length > 0 && !isProcessing && (
        <>
          <Card className="overflow-hidden border-border">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-muted border-b border-border">
                    <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                      Customer Name
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                      Risk Level
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                      Confidence
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((result, idx) => (
                    <tr key={idx} className="border-b border-border hover:bg-muted/50 transition-colors">
                      <td className="px-6 py-4 text-sm text-foreground">{result.customerName}</td>
                      <td className="px-6 py-4 text-sm">
                        {result.status === 'success' ? (
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            result.prediction.riskLevel === 'HIGH'
                              ? 'bg-red-100 text-red-800'
                              : result.prediction.riskLevel === 'MEDIUM'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {result.prediction.riskLevel}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-foreground">
                        {result.status === 'success'
                          ? `${result.prediction.confidenceScore}%`
                          : '-'}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {result.status === 'success' ? (
                          <div className="flex items-center gap-2 text-green-600">
                            <CheckCircle className="h-4 w-4" />
                            Success
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-destructive">
                            <AlertCircle className="h-4 w-4" />
                            {result.error || 'Error'}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          <div className="flex gap-4">
            <Button
              onClick={handleDownloadResults}
              className="flex-1 bg-primary hover:bg-primary text-primary-foreground py-6 rounded-lg font-semibold"
              size="lg"
            >
              <Download className="h-4 w-4 mr-2" />
              Download Results
            </Button>
            <Button
              onClick={() => {
                setFile(null);
                setResults([]);
                if (fileInputRef.current) fileInputRef.current.value = '';
              }}
              variant="outline"
              className="flex-1"
              size="lg"
            >
              Upload Another File
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
