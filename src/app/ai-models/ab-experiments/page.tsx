'use client';

import { useState, type FormEvent } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CheckCircle2, Loader2, TestTube2, Percent, Trophy, BarChart } from 'lucide-react';
import { runABTest, type ABTestInput, type ABTestOutput } from '@/ai/flows/a-b-style-pilot-experiments';
import { useToast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';

export default function ABExperimentsPage() {
  const [formData, setFormData] = useState<ABTestInput>({
    shipmentData: 'Sample shipment data: 1000 records including features like origin, destination, weight, weather, traffic conditions, carrier performance etc.',
    modelAVersion: 'DelayPredictor_v2.1',
    modelBVersion: 'DelayPredictor_v3.0-beta',
    experimentPercentage: 10, // 10% of shipments
    performanceMetric: 'delivery_time_accuracy', // Example metric
  });
  const [experimentResult, setExperimentResult] = useState<ABTestOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: name === 'experimentPercentage' ? parseFloat(value) : value });
  };

  const handleSelectChange = (name: keyof ABTestInput, value: string) => {
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setExperimentResult(null);
    try {
      const result = await runABTest(formData);
      setExperimentResult(result);
      toast({ title: 'A/B Test Complete', description: `Winning model: ${result.winningModel}.` });
    } catch (error) {
      console.error('Error running A/B test:', error);
      toast({ title: 'Error', description: 'Failed to run A/B test. Please try again.', variant: 'destructive' });
    }
    setIsLoading(false);
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="A/B-Style Pilot Experiments"
        description="Test new AI model versions on a subset of shipments and promote the best performer."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Experiment Setup</CardTitle>
            <CardDescription>Configure the A/B test parameters.</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4 max-h-[60vh] overflow-y-auto">
              <div>
                <Label htmlFor="shipmentData">Shipment Data (Description)</Label>
                <Textarea id="shipmentData" name="shipmentData" value={formData.shipmentData} onChange={handleChange} placeholder="Describe the dataset used for testing..." rows={4} />
              </div>
              <div>
                <Label htmlFor="modelAVersion">Model A Version</Label>
                <Input id="modelAVersion" name="modelAVersion" value={formData.modelAVersion} onChange={handleChange} placeholder="e.g., DelayPredictor_v2.1" />
              </div>
              <div>
                <Label htmlFor="modelBVersion">Model B Version</Label>
                <Input id="modelBVersion" name="modelBVersion" value={formData.modelBVersion} onChange={handleChange} placeholder="e.g., DelayPredictor_v3.0-beta" />
              </div>
              <div>
                <Label htmlFor="experimentPercentage">Experiment Percentage (%)</Label>
                <Input id="experimentPercentage" name="experimentPercentage" type="number" min="1" max="100" value={formData.experimentPercentage} onChange={handleChange} placeholder="e.g., 10" />
              </div>
              <div>
                <Label htmlFor="performanceMetric">Performance Metric</Label>
                <Select name="performanceMetric" value={formData.performanceMetric} onValueChange={(value) => handleSelectChange('performanceMetric', value)}>
                  <SelectTrigger id="performanceMetric">
                    <SelectValue placeholder="Select metric" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="delivery_time_accuracy">Delivery Time Accuracy</SelectItem>
                    <SelectItem value="cost_efficiency">Cost Efficiency</SelectItem>
                    <SelectItem value="risk_prediction_score">Risk Prediction Score</SelectItem>
                    <SelectItem value="throughput_improvement">Throughput Improvement</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <TestTube2 className="mr-2 h-4 w-4" />}
                Run A/B Test
              </Button>
            </CardFooter>
          </form>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>A/B Test Results</CardTitle>
            <CardDescription>Comparison of model performance and the winning model.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading && (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="ml-2">Running experiment...</p>
              </div>
            )}
            {experimentResult && !isLoading && (
              <div className="space-y-6">
                <Alert variant="default" className="bg-green-50 border-green-200 dark:bg-green-900/30 dark:border-green-700">
                  <Trophy className="h-5 w-5 text-green-600 dark:text-green-400" />
                  <AlertTitle className="text-green-700 dark:text-green-300">Winning Model: {experimentResult.winningModel}</AlertTitle>
                  <AlertDescription className="text-green-600 dark:text-green-400">
                    Model <span className="font-semibold">{experimentResult.winningModel}</span> performed better based on the selected metric.
                  </AlertDescription>
                </Alert>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-md flex items-center gap-2">
                                <BarChart className="h-5 w-5 text-primary" /> Model A Performance ({formData.modelAVersion})
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-3xl font-bold">{experimentResult.modelAPerformance.toFixed(3)}</p>
                            <p className="text-xs text-muted-foreground">Metric: {formData.performanceMetric.replace(/_/g, ' ')}</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-md flex items-center gap-2">
                                <BarChart className="h-5 w-5 text-accent" /> Model B Performance ({formData.modelBVersion})
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-3xl font-bold">{experimentResult.modelBPerformance.toFixed(3)}</p>
                             <p className="text-xs text-muted-foreground">Metric: {formData.performanceMetric.replace(/_/g, ' ')}</p>
                        </CardContent>
                    </Card>
                </div>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-md flex items-center gap-2">
                       <Percent className="h-5 w-5 text-primary" /> Confidence Level
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold text-primary">{(experimentResult.confidenceLevel * 100).toFixed(1)}%</span>
                        <Progress value={experimentResult.confidenceLevel * 100} className="w-full" aria-label={`${(experimentResult.confidenceLevel * 100).toFixed(1)}% confidence`} />
                    </div>
                     <p className="text-xs text-muted-foreground mt-1">Confidence that the winning model is superior.</p>
                  </CardContent>
                </Card>
                
                <div className="mt-6 flex justify-end">
                    <Button variant="outline">Promote {experimentResult.winningModel}</Button>
                </div>

              </div>
            )}
            {!experimentResult && !isLoading && (
              <div className="text-center py-8 text-muted-foreground">
                <TestTube2 className="mx-auto h-12 w-12" />
                <p className="mt-2">Configure and run an A/B test to compare model versions.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
