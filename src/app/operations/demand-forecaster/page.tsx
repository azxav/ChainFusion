'use client';

import { useState, type FormEvent } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, TrendingUp, Lightbulb, Percent } from 'lucide-react';
import { marketDemandForecaster, type MarketDemandForecasterInput, type MarketDemandForecasterOutput } from '@/ai/flows/market-demand-forecaster';
import { useToast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';

export default function MarketDemandForecasterPage() {
  const [formData, setFormData] = useState<MarketDemandForecasterInput>({
    globalSemiconductorOrderBacklogs: "Current global backlog for Q2 is 1.5M units, expected to grow by 5% in Q3. Key suppliers report full capacity.",
    electronicsSalesTrends: "Consumer electronics sales up 12% YoY. Automotive electronics demand surging by 20%. Wearables market shows steady 8% growth.",
    localProductionNeeds: "Tashkent region requires 50,000 advanced MCUs for automotive assembly in 6 weeks, and 20,000 power management ICs for consumer goods in 8 weeks.",
  });
  const [forecast, setForecast] = useState<MarketDemandForecasterOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setForecast(null);
    try {
      const result = await marketDemandForecaster(formData);
      setForecast(result);
      toast({ title: 'Demand Forecast Generated', description: 'Semiconductor shortage predictions are ready.' });
    } catch (error) {
      console.error('Error generating demand forecast:', error);
      toast({ title: 'Error', description: 'Failed to generate demand forecast. Please try again.', variant: 'destructive' });
    }
    setIsLoading(false);
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Market Demand Forecaster"
        description="Predicts semiconductor shortages 6–8 weeks out by correlating global and local data."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Input Market Data</CardTitle>
            <CardDescription>Provide relevant data points for an accurate forecast.</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4 max-h-[60vh] overflow-y-auto">
              <div>
                <Label htmlFor="globalSemiconductorOrderBacklogs">Global Semiconductor Order Backlogs</Label>
                <Textarea id="globalSemiconductorOrderBacklogs" name="globalSemiconductorOrderBacklogs" value={formData.globalSemiconductorOrderBacklogs} onChange={handleChange} placeholder="Describe current backlogs, supplier capacities..." rows={4} />
              </div>
              <div>
                <Label htmlFor="electronicsSalesTrends">Electronics Sales Trends</Label>
                <Textarea id="electronicsSalesTrends" name="electronicsSalesTrends" value={formData.electronicsSalesTrends} onChange={handleChange} placeholder="Detail sales growth in relevant sectors..." rows={4} />
              </div>
              <div>
                <Label htmlFor="localProductionNeeds">Local Production Needs</Label>
                <Textarea id="localProductionNeeds" name="localProductionNeeds" value={formData.localProductionNeeds} onChange={handleChange} placeholder="Specify local demand for components, timelines..." rows={4} />
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <TrendingUp className="mr-2 h-4 w-4" />}
                Generate Forecast
              </Button>
            </CardFooter>
          </form>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Semiconductor Demand Forecast (6-8 Weeks)</CardTitle>
            <CardDescription>AI-generated predictions and recommendations.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading && (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="ml-2">Generating forecast...</p>
              </div>
            )}
            {forecast && !isLoading && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-primary" /> Predicted Shortages
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground whitespace-pre-line">{forecast.predictedShortages}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                     <CardTitle className="text-lg flex items-center gap-2">
                      <Percent className="h-5 w-5 text-primary" /> Confidence Level
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2">
                        <span className="text-3xl font-bold text-primary">{(forecast.confidenceLevel * 100).toFixed(0)}%</span>
                        <Progress value={forecast.confidenceLevel * 100} className="w-full" aria-label={`${(forecast.confidenceLevel * 100).toFixed(0)}% confidence`} />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                       <Lightbulb className="h-5 w-5 text-primary" /> Recommendations
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground whitespace-pre-line">{forecast.recommendations}</p>
                  </CardContent>
                </Card>
              </div>
            )}
            {!forecast && !isLoading && (
              <div className="text-center py-8 text-muted-foreground">
                <TrendingUp className="mx-auto h-12 w-12" />
                <p className="mt-2">Enter market data and click "Generate Forecast" to view predictions.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
