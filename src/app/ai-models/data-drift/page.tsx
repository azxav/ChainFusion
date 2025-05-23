'use client';

import { useState, type FormEvent } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CheckCircle2, AlertCircle, Loader2, DatabaseZap, BarChartBig, Info } from 'lucide-react';
import { detectDataDrift, type DetectDataDriftInput, type DetectDataDriftOutput } from '@/ai/flows/automated-data-drift-detection';
import { useToast } from '@/hooks/use-toast';

export default function DataDriftDetectionPage() {
  const [formData, setFormData] = useState<DetectDataDriftInput>({
    modelName: 'ShipmentDelayPredictor_v2.1',
    inputDataSample: JSON.stringify({ avgRouteTime: 12.5, weatherSeverity: 0.2, customsWaitTime: 3.1, supplierReliability: 0.85 }, null, 2),
    baselineDataSummary: JSON.stringify({ avgRouteTime: { mean: 10.2, std: 1.5 }, weatherSeverity: { mean: 0.1, std: 0.05 }, customsWaitTime: { mean: 2.5, std: 0.5 }, supplierReliability: { mean: 0.9, std: 0.03 } }, null, 2),
    driftThreshold: 0.65, // Example threshold
  });
  const [detectionResult, setDetectionResult] = useState<DetectDataDriftOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: name === 'driftThreshold' ? parseFloat(value) : value });
  };
  
  const isValidJson = (str: string) => {
    try {
      JSON.parse(str);
    } catch (e) {
      return false;
    }
    return true;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isValidJson(formData.inputDataSample) || !isValidJson(formData.baselineDataSummary)) {
      toast({ title: 'Invalid JSON', description: 'Input Data Sample and Baseline Data Summary must be valid JSON.', variant: 'destructive'});
      return;
    }
    setIsLoading(true);
    setDetectionResult(null);
    try {
      // The actual AI flow needs structured JSON, so parse it before sending
      const payload: DetectDataDriftInput = {
        ...formData,
        inputDataSample: JSON.parse(formData.inputDataSample),
        baselineDataSummary: JSON.parse(formData.baselineDataSummary),
      };
      const result = await detectDataDrift(payload);
      setDetectionResult(result);
      toast({ title: 'Data Drift Analysis Complete', description: result.driftDetected ? 'Drift detected.' : 'No significant drift detected.' });
    } catch (error) {
      console.error('Error detecting data drift:', error);
      toast({ title: 'Error', description: 'Failed to analyze data drift. Please try again.', variant: 'destructive' });
    }
    setIsLoading(false);
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Automated Data Drift Detection"
        description="Monitors model inputs and flags when retraining is needed."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Model &amp; Data Input</CardTitle>
            <CardDescription>Provide details for the model and data samples.</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4 max-h-[60vh] overflow-y-auto">
              <div>
                <Label htmlFor="modelName">Model Name</Label>
                <Input id="modelName" name="modelName" value={formData.modelName} onChange={handleChange} placeholder="e.g., ShipmentDelayPredictor_v2.1" />
              </div>
              <div>
                <Label htmlFor="inputDataSample">Recent Input Data Sample (JSON)</Label>
                <Textarea id="inputDataSample" name="inputDataSample" value={formData.inputDataSample} onChange={handleChange} placeholder='{ "feature1": 10, "feature2": "A" }' rows={5} />
              </div>
              <div>
                <Label htmlFor="baselineDataSummary">Baseline Data Summary (JSON)</Label>
                <Textarea id="baselineDataSummary" name="baselineDataSummary" value={formData.baselineDataSummary} onChange={handleChange} placeholder='{ "feature1": { "mean": 8, "std": 1.2 } }' rows={5} />
              </div>
              <div>
                <Label htmlFor="driftThreshold">Drift Threshold (0-1)</Label>
                <Input id="driftThreshold" name="driftThreshold" type="number" step="0.01" min="0" max="1" value={formData.driftThreshold} onChange={handleChange} placeholder="e.g., 0.7" />
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <DatabaseZap className="mr-2 h-4 w-4" />}
                Detect Data Drift
              </Button>
            </CardFooter>
          </form>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Data Drift Analysis Results</CardTitle>
            <CardDescription>Indicates if significant data drift is detected and if retraining is recommended.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading && (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="ml-2">Analyzing data...</p>
              </div>
            )}
            {detectionResult && !isLoading && (
              <div className="space-y-6">
                <Alert variant={detectionResult.driftDetected ? "destructive" : "default"}>
                  {detectionResult.driftDetected ? <AlertCircle className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
                  <AlertTitle>{detectionResult.driftDetected ? "Data Drift Detected" : "No Significant Data Drift Detected"}</AlertTitle>
                  <AlertDescription>
                    {detectionResult.explanation}
                  </AlertDescription>
                </Alert>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <BarChartBig className="h-5 w-5 text-primary" /> Drift Metrics
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {Object.entries(detectionResult.driftMetrics).length > 0 ? (
                      <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                        {Object.entries(detectionResult.driftMetrics).map(([key, value]) => (
                          <li key={key}><strong>{key}:</strong> {value.toFixed(4)}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-muted-foreground">No drift metrics available.</p>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Info className="h-5 w-5 text-primary" /> Retraining Recommendation
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className={`text-md font-semibold ${detectionResult.recommendRetraining ? 'text-destructive' : 'text-green-600'}`}>
                      {detectionResult.recommendRetraining ? "Retraining Recommended" : "Retraining Not Currently Recommended"}
                    </p>
                  </CardContent>
                </Card>
              </div>
            )}
            {!detectionResult && !isLoading && (
              <div className="text-center py-8 text-muted-foreground">
                <DatabaseZap className="mx-auto h-12 w-12" />
                <p className="mt-2">Enter model and data details to analyze for data drift.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
