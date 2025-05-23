'use client';

import { useState, type FormEvent } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, Route, Zap, Lightbulb, Ship, Train, Car, Plane } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';

interface Recommendation {
  method: 'Road' | 'Rail' | 'Air' | 'Sea';
  confidence: number;
  estimatedCost: string;
  estimatedTime: string;
  notes: string;
}

export default function ReinforcementPlannerPage() {
  const [historicalData, setHistoricalData] = useState<string>('Past 12 months shipment data including routes, costs, times, and outcomes. Average road transport cost: $0.5/km. Average rail cost: $0.3/ton-km.');
  const [liveApiData, setLiveApiData] = useState<string>('Fuel Price: $1.2/liter (Diesel). Customs Delay at KAZ Border: Avg. 4 hours. Weather Forecast: Clear for next 3 days.');
  const [shipmentDetails, setShipmentDetails] = useState<string>('Shipment: 20 tons of electronics from Tashkent, UZ to Moscow, RU. Required by: 10 days.');
  
  const [recommendations, setRecommendations] = useState<Recommendation[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setRecommendations(null);

    // Simulate AI processing
    await new Promise(resolve => setTimeout(resolve, 1500));

    const mockRecommendations: Recommendation[] = [
      { method: 'Rail', confidence: 0.85, estimatedCost: '$4,500', estimatedTime: '7-8 days', notes: 'Optimal balance of cost and time for this distance and weight. Low weather impact.' },
      { method: 'Road', confidence: 0.70, estimatedCost: '$6,000', estimatedTime: '5-6 days', notes: 'Faster but higher cost. Potential for border delays.' },
      { method: 'Air', confidence: 0.45, estimatedCost: '$15,000', estimatedTime: '1-2 days', notes: 'Fastest option, significantly higher cost. Recommended for urgent, high-value parts only.' },
      { method: 'Sea', confidence: 0.10, estimatedCost: '$2,500', estimatedTime: '25-30 days', notes: 'Not viable for this route/timeline. Included for completeness.' },
    ].sort((a,b) => b.confidence - a.confidence);

    setRecommendations(mockRecommendations);
    setIsLoading(false);
    toast({ title: 'Recommendations Generated', description: 'RL Planner has suggested optimal shipment methods.' });
  };
  
  const getMethodIcon = (method: Recommendation['method']) => {
    switch(method) {
      case 'Road': return <Car className="h-5 w-5 text-blue-500" />;
      case 'Rail': return <Train className="h-5 w-5 text-green-500" />;
      case 'Air': return <Plane className="h-5 w-5 text-purple-500" />;
      case 'Sea': return <Ship className="h-5 w-5 text-teal-500" />;
      default: return <Route className="h-5 w-5" />;
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Reinforcement Learning Planner"
        description="Recommends dynamic shipment methods based on historical data and live APIs."
      />

      <Alert>
        <Lightbulb className="h-4 w-4" />
        <AlertTitle>Mock Interface</AlertTitle>
        <AlertDescription>
          This page demonstrates the UI for the Reinforcement Learning Planner. The AI logic is simulated for now.
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Planner Inputs</CardTitle>
            <CardDescription>Provide data for the RL model to process.</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4 max-h-[60vh] overflow-y-auto">
              <div>
                <Label htmlFor="shipmentDetails">Shipment Details</Label>
                <Textarea id="shipmentDetails" value={shipmentDetails} onChange={(e) => setShipmentDetails(e.target.value)} placeholder="Describe the shipment..." rows={3} />
              </div>
              <div>
                <Label htmlFor="historicalData">Historical Performance Data (Summary)</Label>
                <Textarea id="historicalData" value={historicalData} onChange={(e) => setHistoricalData(e.target.value)} placeholder="Summarize past performance data..." rows={4} />
              </div>
              <div>
                <Label htmlFor="liveApiData">Live API Data (Summary)</Label>
                <Textarea id="liveApiData" value={liveApiData} onChange={(e) => setLiveApiData(e.target.value)} placeholder="Current fuel prices, customs delays, weather..." rows={4} />
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Zap className="mr-2 h-4 w-4" />}
                Generate Recommendations
              </Button>
            </CardFooter>
          </form>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Shipment Method Recommendations</CardTitle>
            <CardDescription>AI-powered suggestions for optimal transport.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading && (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="ml-2">Generating recommendations...</p>
              </div>
            )}
            {recommendations && !isLoading && (
              <div className="space-y-4">
                <div className="aspect-video bg-muted rounded-md flex items-center justify-center mb-4">
                    <Image src="https://placehold.co/600x338.png" alt="Route Optimization Placeholder" width={600} height={338} className="object-cover rounded-md" data-ai-hint="animated route map" />
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Method</TableHead>
                      <TableHead>Confidence</TableHead>
                      <TableHead>Est. Cost</TableHead>
                      <TableHead>Est. Time</TableHead>
                      <TableHead>Notes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recommendations.map((rec) => (
                      <TableRow key={rec.method}>
                        <TableCell className="font-medium flex items-center gap-2">{getMethodIcon(rec.method)} {rec.method}</TableCell>
                        <TableCell>{(rec.confidence * 100).toFixed(0)}%</TableCell>
                        <TableCell>{rec.estimatedCost}</TableCell>
                        <TableCell>{rec.estimatedTime}</TableCell>
                        <TableCell className="text-xs">{rec.notes}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
            {!recommendations && !isLoading && (
              <div className="text-center py-8 text-muted-foreground">
                <Route className="mx-auto h-12 w-12" />
                <p className="mt-2">Input data and click "Generate" to see shipment recommendations.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
