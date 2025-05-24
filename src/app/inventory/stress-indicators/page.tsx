'use client';

import { useState, type FormEvent } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { AlertTriangle, Clock, Loader2 } from 'lucide-react';
import { getInventoryStressIndicators } from '@/ai/flows/inventory-stress-indicators';
import { 
  type InventoryStressIndicatorsInput, 
  type InventoryStressIndicatorsOutput 
} from '@/ai/flows/types/inventory-stress-types';
import { useToast } from '@/hooks/use-toast';

export default function InventoryStressIndicatorsPage() {
  const [formData, setFormData] = useState<InventoryStressIndicatorsInput>({
    componentName: 'ZX-8000 Chip',
    currentStockLevel: 500,
    averageDailyUsage: 25,
    leadTimeDays: 7,
    historicalUsageData: 'Jan: 600, Feb: 750, Mar: 700, Apr: 650 (monthly usage)',
    forecastVolatility: 0.15, // 15%
  });
  const [indicators, setIndicators] = useState<InventoryStressIndicatorsOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: name === 'currentStockLevel' || name === 'averageDailyUsage' || name === 'leadTimeDays' || name === 'forecastVolatility' ? parseFloat(value) : value });
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setIndicators(null);
    try {
      const result = await getInventoryStressIndicators(formData);
      setIndicators(result);
      toast({ title: 'Indicators Calculated', description: `Stress indicators for ${formData.componentName} generated.` });
    } catch (error) {
      console.error('Error calculating indicators:', error);
      toast({ title: 'Error', description: 'Failed to calculate indicators. Please try again.', variant: 'destructive' });
    }
    setIsLoading(false);
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Inventory Stress Indicators"
        description="Stock-out probability forecasts and “time-to-empty” countdowns for components."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Component Details</CardTitle>
            <CardDescription>Provide information about the inventory component.</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4 max-h-[60vh] overflow-y-auto">
              <div>
                <Label htmlFor="componentName">Component Name</Label>
                <Input id="componentName" name="componentName" value={formData.componentName} onChange={handleChange} placeholder="e.g., ZX-8000 Chip" />
              </div>
              <div>
                <Label htmlFor="currentStockLevel">Current Stock Level</Label>
                <Input id="currentStockLevel" name="currentStockLevel" type="number" value={formData.currentStockLevel} onChange={handleChange} placeholder="e.g., 500" />
              </div>
              <div>
                <Label htmlFor="averageDailyUsage">Average Daily Usage</Label>
                <Input id="averageDailyUsage" name="averageDailyUsage" type="number" value={formData.averageDailyUsage} onChange={handleChange} placeholder="e.g., 25" />
              </div>
              <div>
                <Label htmlFor="leadTimeDays">Lead Time (Days)</Label>
                <Input id="leadTimeDays" name="leadTimeDays" type="number" value={formData.leadTimeDays} onChange={handleChange} placeholder="e.g., 7" />
              </div>
              <div>
                <Label htmlFor="historicalUsageData">Historical Usage Data</Label>
                <Textarea id="historicalUsageData" name="historicalUsageData" value={formData.historicalUsageData} onChange={handleChange} placeholder="e.g., Jan: 600, Feb: 750..." rows={3}/>
              </div>
              <div>
                <Label htmlFor="forecastVolatility">Forecast Volatility (0-1)</Label>
                <Input id="forecastVolatility" name="forecastVolatility" type="number" step="0.01" min="0" max="1" value={formData.forecastVolatility} onChange={handleChange} placeholder="e.g., 0.15 for 15%" />
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <AlertTriangle className="mr-2 h-4 w-4" />}
                Calculate Stress Indicators
              </Button>
            </CardFooter>
          </form>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Stress Indicators for: <span className="text-primary">{formData.componentName || "Component"}</span></CardTitle>
            <CardDescription>AI-generated stock-out probability and time-to-empty.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading && (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="ml-2">Calculating indicators...</p>
              </div>
            )}
            {indicators && !isLoading && (
              <div className="space-y-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Stock-Out Probability</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4">
                      <span className={`text-4xl font-bold ${indicators.stockOutProbability > 0.7 ? 'text-red-600' : indicators.stockOutProbability > 0.3 ? 'text-yellow-500' : 'text-green-600'}`}>
                        {(indicators.stockOutProbability * 100).toFixed(1)}%
                      </span>
                      <Progress value={indicators.stockOutProbability * 100} className="w-full" aria-label={`${(indicators.stockOutProbability * 100).toFixed(1)}% stock-out probability`} />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Likelihood of stocking out before next replenishment.</p>
                  </CardContent>
                </Card>
                 <Card>
                  <CardHeader  className="pb-2">
                    <CardTitle className="text-lg">Time to Empty</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2">
                      <Clock className={`h-10 w-10 ${indicators.timeToEmpty < formData.leadTimeDays ? 'text-red-600' : indicators.timeToEmpty < formData.leadTimeDays * 2 ? 'text-yellow-500' : 'text-green-600'}`} />
                      <div>
                        <p className="text-3xl font-bold">{indicators.timeToEmpty.toFixed(1)} days</p>
                        <p className="text-xs text-muted-foreground">Estimated days until stock depletion at average usage.</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                 <Card>
                  <CardHeader  className="pb-2">
                    <CardTitle className="text-lg">Restock Recommendation</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">{indicators.restockRecommendation}</p>
                  </CardContent>
                </Card>
              </div>
            )}
            {!indicators && !isLoading && (
              <div className="text-center py-8 text-muted-foreground">
                <AlertTriangle className="mx-auto h-12 w-12" />
                <p className="mt-2">Enter component details and click "Calculate" to view indicators.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
