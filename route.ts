import { NextRequest, NextResponse } from 'next/server';
import { predictChurn } from '@/lib/prediction-engine';
import { CustomerData, PredictionResult } from '@/lib/types';
import { extractFeatures, predictWithSimpleModel } from '@/lib/ml-training';

export async function POST(request: NextRequest): Promise<NextResponse<PredictionResult | { error: string }>> {
  try {
    const body = await request.json();

    // Validate required fields
    const requiredFields = [
      'name',
      'tenure',
      'monthlyCharges',
      'totalCharges',
      'complaintCount',
      'billingComplaints',
      'interactionCount',
    ];

    const missingFields = requiredFields.filter((field) => !(field in body));
    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }

    // Validate field types and ranges
    if (typeof body.name !== 'string' || body.name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Name must be a non-empty string' },
        { status: 400 }
      );
    }

    const numericFields = [
      'tenure',
      'monthlyCharges',
      'totalCharges',
      'complaintCount',
      'billingComplaints',
      'interactionCount',
    ];

    for (const field of numericFields) {
      if (typeof body[field] !== 'number' || body[field] < 0) {
        return NextResponse.json(
          { error: `${field} must be a non-negative number` },
          { status: 400 }
        );
      }
    }

    const customerData: CustomerData = {
      name: body.name.trim(),
      tenure: body.tenure,
      monthlyCharges: body.monthlyCharges,
      totalCharges: body.totalCharges,
      complaintCount: Math.floor(body.complaintCount),
      billingComplaints: Math.floor(body.billingComplaints),
      interactionCount: Math.floor(body.interactionCount),
    };

    // 1. Get base prediction to construct base features
    const basePrediction = predictChurn(customerData);

    // 2. Prepare metadata for ML feature extraction
    const metadata: Record<string, number> = {
      tenure: customerData.tenure,
      monthlyCharges: customerData.monthlyCharges,
      totalCharges: customerData.totalCharges,
      numComplaints: customerData.complaintCount,
      hasBillingComplaints: customerData.billingComplaints > 0 ? 1 : 0,
      engagementScore: customerData.interactionCount,
    };

    // 3. Extract features
    const features = extractFeatures(basePrediction, metadata);

    // 4. Run ML model
    const mlRiskLevelUpper = predictWithSimpleModel(features);
    const mlRiskLevel = mlRiskLevelUpper.toLowerCase() as 'low' | 'medium' | 'high';

    // 5. Construct final prediction result merging ML with base features
    const mlPrediction: PredictionResult = {
      ...basePrediction,
      riskLevel: mlRiskLevel,
      reasoning: `(ML Engine) ${basePrediction.reasoning}`,
    };

    return NextResponse.json(mlPrediction);
  } catch (error) {
    console.error('ML Prediction error:', error);

    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
