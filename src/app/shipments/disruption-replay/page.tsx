
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
import { ListChecks, Clock, Zap, Loader2, AlertTriangle, FileText, ShieldAlert, Factory, Lightbulb, Wrench } from 'lucide-react';
import { disruptionReplayAndForecast, type DisruptionReplayAndForecastInput, type DisruptionReplayAndForecastOutput } from '@/ai/flows/disruption-replay-and-forecast';
import { useToast } from '@/hooks/use-toast';

const disruptionTypes = [
  { value: "Semiconductor Outage", label: "Semiconductor Outage" },
  { value: "Border Closure", label: "Border Closure" },
  { value: "Port Congestion", label: "Port Congestion" },
  { value: "Natural Disaster", label: "Natural Disaster" },
  { value: "Labor Strike", label: "Labor Strike" },
  { value: "Supplier Bankruptcy", label: "Supplier Bankruptcy" },
  { value: "Logistics Failure", label: "Logistics Failure" },
];

export default function DisruptionReplayPage() {
  const [formData, setFormData] = useState<DisruptionReplayAndForecastInput>({
    disruptionType: disruptionTypes[0].value,
    disruptionDetails: 'Major fab in Taiwan experienced a power outage, halting production of XZ-8000 series MCUs for an estimated 2 weeks.',
    productionLine: 'Tashkent Assembly Line 1 (Automotive)',
  });
  const [simulationResult, setSimulationResult] = useState<DisruptionReplayAndForecastOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSelectChange = (value: string) => {
    setFormData({ ...formData, disruptionType: value });
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setSimulationResult(null);
    try {
      const result = await disruptionReplayAndForecast(formData);
      setSimulationResult(result);
      toast({ title: 'Simulation Complete', description: `Impact assessment for ${formData.disruptionType} is ready.` });
    } catch (error) {
      console.error('Error running disruption simulation:', error);
      toast({ title: 'Error', description: 'Failed to run simulation. Please try again.', variant: 'destructive' });
    }
    setIsLoading(false);
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Disruption Replay & Forecast"
        description="Simulate the impact of potential supply chain disruptions on your production lines."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Disruption Scenario</CardTitle>
            <CardDescription>Define the parameters of the disruption to simulate.</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4 max-h-[60vh] overflow-y-auto">
              <div>
                <Label htmlFor="disruptionType">Disruption Type</Label>
                <Select name="disruptionType" value={formData.disruptionType} onValueChange={handleSelectChange}>
                  <SelectTrigger id="disruptionType">
                    <SelectValue placeholder="Select disruption type" />
                  </SelectTrigger>
                  <SelectContent>
                    {disruptionTypes.map(type => (
                      <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="disruptionDetails">Disruption Details</Label>
                <Textarea
                  id="disruptionDetails"
                  name="disruptionDetails"
                  value={formData.disruptionDetails}
                  onChange={handleChange}
                  placeholder="Describe the specifics of the disruption (e.g., components affected, duration, location)..."
                  rows={5}
                />
              </div>
              <div>
                <Label htmlFor="productionLine">Production Line</Label>
                <Input
                  id="productionLine"
                  name="productionLine"
                  value={formData.productionLine}
                  onChange={handleChange}
                  placeholder="e.g., Tashkent Assembly Line 1"
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Zap className="mr-2 h-4 w-4" />}
                Simulate Disruption
              </Button>
            </CardFooter>
          </form>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Simulation Results</CardTitle>
            <CardDescription>AI-generated forecast of the disruption's impact.</CardDescription>
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
                <Alert variant="destructive">
                  <ShieldAlert className="h-4 w-4" />
                  <AlertTitle>Impact Summary</AlertTitle>
                  <AlertDescription>{simulationResult.impactSummary}</AlertDescription>
                </Alert>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-md flex items-center gap-2">
                                <Factory className="h-5 w-5 text-primary" /> Affected Components
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {simulationResult.affectedComponents.length > 0 ? (
                                <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                                    {simulationResult.affectedComponents.map((component, index) => (
                                    <li key={index}>{component}</li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-sm text-muted-foreground">No specific components identified as directly affected.</p>
                            )}
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-md flex items-center gap-2">
                                <Clock className="h-5 w-5 text-primary" /> Estimated Delay
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-bold">{simulationResult.estimatedDelay}</p>
                        </CardContent>
                    </Card>
                </div>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-md flex items-center gap-2">
                       <Lightbulb className="h-5 w-5 text-primary" /> Recommended Actions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                     {simulationResult.recommendedActions.length > 0 ? (
                        <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                            {simulationResult.recommendedActions.map((action, index) => (
                            <li key={index}>{action}</li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-sm text-muted-foreground">No specific actions recommended at this time.</p>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}
            {!simulationResult && !isLoading && (
              <div className="text-center py-8 text-muted-foreground">
                <AlertTriangle className="mx-auto h-12 w-12" />
                <p className="mt-2">Define a disruption scenario and click "Simulate Disruption" to see the potential impact.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

    