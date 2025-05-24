
'use client';

import { useState, type FormEvent, useEffect } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { DollarSign, Clock, Loader2, Lightbulb } from 'lucide-react';
import { costVsTimeTradeoffSimulator, type CostVsTimeTradeoffSimulatorInput, type CostVsTimeTradeoffSimulatorOutput } from '@/ai/flows/cost-vs-time-tradeoff-simulator';
import { useToast } from '@/hooks/use-toast';

export default function CostTimeSimulatorPage() {
  const [formData, setFormData] = useState<Omit<CostVsTimeTradeoffSimulatorInput, 'timeReductionInHours'>>({
    shipmentDetails: '10 pallets of electronics, Tashkent to Samarkand, Total weight: 5000kg, Dimensions: 10x(1.2m x 0.8m x 1m)',
    originalDeliveryTime: 48, // hours
    originalCost: 1200, // USD
  });
  const [timeReduction, setTimeReduction] = useState<number[]>([12]); // Default 12 hours reduction
  const [simulationResult, setSimulationResult] = useState<CostVsTimeTradeoffSimulatorOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: name === 'originalDeliveryTime' || name === 'originalCost' ? parseFloat(value) : value });
  };

  const handleSliderChange = (value: number[]) => {
    setTimeReduction(value);
  };
  
  useEffect(() => {
    if (timeReduction[0] >= formData.originalDeliveryTime) {
      setTimeReduction([Math.max(0, formData.originalDeliveryTime -1)]);
    }
  }, [formData.originalDeliveryTime, timeReduction]);


  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (timeReduction[0] <= 0) {
      toast({ title: 'Invalid Input', description: 'Time reduction must be greater than 0 hours.', variant: 'destructive' });
      return;
    }
    if (timeReduction[0] >= formData.originalDeliveryTime) {
      toast({ title: 'Invalid Input', description: 'Time reduction cannot be equal to or exceed original delivery time.', variant: 'destructive' });
      return;
    }

    setIsLoading(true);
    setSimulationResult(null);
    try {
      const input: CostVsTimeTradeoffSimulatorInput = {
        ...formData,
        timeReductionInHours: timeReduction[0],
      };
      const result = await costVsTimeTradeoffSimulator(input);
      setSimulationResult(result);
      toast({ title: 'Simulation Complete', description: 'Cost vs. time trade-off analysis is ready.' });
    } catch (error) {
      console.error('Error running simulation:', error);
      toast({ title: 'Error', description: 'Failed to run simulation. Please try again.', variant: 'destructive' });
    }
    setIsLoading(false);
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Cost-vs-Time Trade-Off Simulator"
        description="Analyze the incremental cost to reduce delivery time for a shipment."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Shipment &amp; Reduction Details</CardTitle>
            <CardDescription>Input current shipment data and desired time reduction.</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4 max-h-[60vh] overflow-y-auto">
              <div>
                <Label htmlFor="shipmentDetails">Shipment Details</Label>
                <Textarea id="shipmentDetails" name="shipmentDetails" value={formData.shipmentDetails} onChange={handleInputChange} placeholder="Origin, destination, weight, dimensions..." rows={3} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="originalDeliveryTime">Original Delivery Time (hours)</Label>
                  <Input id="originalDeliveryTime" name="originalDeliveryTime" type="number" value={formData.originalDeliveryTime} onChange={handleInputChange} placeholder="e.g., 48" />
                </div>
                <div>
                  <Label htmlFor="originalCost">Original Cost (USD)</Label>
                  <Input id="originalCost" name="originalCost" type="number" value={formData.originalCost} onChange={handleInputChange} placeholder="e.g., 1200" />
                </div>
              </div>
              <div>
                <Label htmlFor="timeReductionInHours" className="mb-2 block">
                  Desired Time Reduction: {timeReduction[0]} hours
                </Label>
                <Slider
                  id="timeReductionInHours"
                  min={1}
                  max={formData.originalDeliveryTime > 1 ? formData.originalDeliveryTime -1 : 1}
                  step={1}
                  value={timeReduction}
                  onValueChange={handleSliderChange}
                  disabled={formData.originalDeliveryTime <=1}
                />
                 {formData.originalDeliveryTime <=1 && <p className="text-xs text-destructive mt-1">Original delivery time too short for reduction.</p>}
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={isLoading || formData.originalDeliveryTime <=1} className="w-full">
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Clock className="mr-2 h-4 w-4" />}
                Simulate Trade-Off
              </Button>
            </CardFooter>
          </form>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Simulation Results</CardTitle>
            <CardDescription>Estimated cost and delivery time for the chosen reduction.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading && (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="ml-2">Running simulation...</p>
              </div>
            )}
            {simulationResult && !isLoading && (
              <div className="space-y-6">
                <Card className="bg-secondary/50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <DollarSign className="h-5 w-5 text-green-600" /> Estimated New Cost
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-4xl font-bold">${simulationResult.estimatedCost.toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground">
                      Original Cost: ${formData.originalCost.toLocaleString()} (+${(simulationResult.estimatedCost - formData.originalCost).toLocaleString()} premium)
                    </p>
                  </CardContent>
                </Card>
                <Card className="bg-secondary/50">
                  <CardHeader className="pb-2">
                     <CardTitle className="text-lg flex items-center gap-2">
                      <Clock className="h-5 w-5 text-blue-600" /> Estimated New Delivery Time
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-4xl font-bold">{simulationResult.deliveryTime} hours</p>
                    <p className="text-sm text-muted-foreground">
                      Original Time: {formData.originalDeliveryTime} hours (Reduced by {formData.originalDeliveryTime - simulationResult.deliveryTime} hours)
                    </p>
                  </CardContent>
                </Card>
                 <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                       <Lightbulb className="h-5 w-5 text-primary" /> Reasoning &amp; Factors
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground whitespace-pre-line">{simulationResult.reasoning}</p>
                  </CardContent>
                </Card>
              </div>
            )}
            {!simulationResult && !isLoading && (
              <div className="text-center py-8 text-muted-foreground">
                <Clock className="mx-auto h-12 w-12" />
                <p className="mt-2">Enter shipment details and adjust the slider to simulate cost-time trade-offs.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
