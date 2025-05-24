
'use client';

import { useState, type FormEvent } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea'; // Although not used in form, good to have if reasoning becomes editable.
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Calculator, Lightbulb, Loader2, Package, TrendingUp, Clock, ShieldCheck, RefreshCw } from 'lucide-react';
import { calculateBufferStock, type CalculateBufferStockInput, type CalculateBufferStockOutput } from '@/ai/flows/automated-buffer-stock-recommendations';
import { useToast } from '@/hooks/use-toast';

export default function BufferStockPage() {
  const [formData, setFormData] = useState<CalculateBufferStockInput>({
    sku: 'SKU-BUFFER-001',
    forecastVolatility: 0.2, // e.g., 20%
    leadTimeVariability: 0.1, // e.g., 10%
    desiredServiceLevel: 0.95, // e.g., 95%
  });
  const [recommendation, setRecommendation] = useState<CalculateBufferStockOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: name === 'sku' ? value : parseFloat(value) });
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setRecommendation(null);

    if (formData.desiredServiceLevel < 0 || formData.desiredServiceLevel > 1) {
        toast({ title: 'Invalid Input', description: 'Desired Service Level must be between 0 and 1.', variant: 'destructive' });
        setIsLoading(false);
        return;
    }
     if (formData.forecastVolatility < 0 || formData.leadTimeVariability < 0) {
        toast({ title: 'Invalid Input', description: 'Volatility and Variability must be non-negative.', variant: 'destructive' });
        setIsLoading(false);
        return;
    }


    try {
      const result = await calculateBufferStock(formData);
      setRecommendation(result);
      toast({ title: 'Buffer Stock Calculated', description: `Recommendation for SKU ${formData.sku} is ready.` });
    } catch (error) {
      console.error('Error calculating buffer stock:', error);
      toast({ title: 'Error', description: 'Failed to calculate buffer stock. Please try again.', variant: 'destructive' });
    }
    setIsLoading(false);
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Automated Buffer Stock Recommendations"
        description="Calculate optimal safety-stock levels per SKU using AI."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>SKU Parameters</CardTitle>
            <CardDescription>Enter details for the SKU to calculate its buffer stock.</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4 max-h-[60vh] overflow-y-auto">
              <div>
                <Label htmlFor="sku" className="flex items-center gap-1"><Package className="h-4 w-4" /> SKU</Label>
                <Input id="sku" name="sku" value={formData.sku} onChange={handleChange} placeholder="e.g., COMPONENT-XYZ" />
              </div>
              <div>
                <Label htmlFor="forecastVolatility" className="flex items-center gap-1"><TrendingUp className="h-4 w-4" /> Forecast Volatility (0-1)</Label>
                <Input id="forecastVolatility" name="forecastVolatility" type="number" step="0.01" min="0" value={formData.forecastVolatility} onChange={handleChange} placeholder="e.g., 0.2 for 20%" />
              </div>
              <div>
                <Label htmlFor="leadTimeVariability" className="flex items-center gap-1"><Clock className="h-4 w-4" /> Lead Time Variability (0-1)</Label>
                <Input id="leadTimeVariability" name="leadTimeVariability" type="number" step="0.01" min="0" value={formData.leadTimeVariability} onChange={handleChange} placeholder="e.g., 0.1 for 10%" />
              </div>
              <div>
                <Label htmlFor="desiredServiceLevel" className="flex items-center gap-1"><ShieldCheck className="h-4 w-4" /> Desired Service Level (0-1)</Label>
                <Input id="desiredServiceLevel" name="desiredServiceLevel" type="number" step="0.01" min="0" max="1" value={formData.desiredServiceLevel} onChange={handleChange} placeholder="e.g., 0.95 for 95%" />
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
                Calculate Buffer Stock
              </Button>
            </CardFooter>
          </form>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Buffer Stock Recommendation</CardTitle>
            <CardDescription>AI-generated optimal safety stock level and reasoning.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading && (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="ml-2">Calculating recommendation...</p>
              </div>
            )}
            {recommendation && !isLoading && (
              <div className="space-y-6">
                <Card className="bg-secondary/30">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Calculator className="h-5 w-5 text-primary" /> Recommended Buffer Stock for {formData.sku}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-4xl font-bold text-primary">{recommendation.recommendedBufferStock.toLocaleString()} units</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                       <Lightbulb className="h-5 w-5 text-primary" /> Reasoning
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground whitespace-pre-line">{recommendation.reasoning}</p>
                  </CardContent>
                </Card>
              </div>
            )}
            {!recommendation && !isLoading && (
              <div className="text-center py-8 text-muted-foreground">
                <RefreshCw className="mx-auto h-12 w-12" />
                <p className="mt-2">Enter SKU parameters and click "Calculate" to see the recommendation.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
