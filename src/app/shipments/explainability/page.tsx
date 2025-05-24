
'use client';

import { useState, type FormEvent } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, Lightbulb, Info, Search, ListTree, Percent } from 'lucide-react';
import { explainShipmentRisk, type ExplainabilityDashboardInput, type ExplainabilityDashboardOutput } from '@/ai/flows/explainability-dashboards';
import { useToast } from '@/hooks/use-toast';

export default function ExplainabilityDashboardPage() {
  const [shipmentId, setShipmentId] = useState<string>('SHPXYZ789');
  const [explanationResult, setExplanationResult] = useState<ExplainabilityDashboardOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!shipmentId.trim()) {
      toast({ title: 'Shipment ID Required', description: 'Please enter a shipment ID to explain.', variant: 'destructive' });
      return;
    }
    setIsLoading(true);
    setExplanationResult(null);
    try {
      const input: ExplainabilityDashboardInput = { shipmentId };
      const result = await explainShipmentRisk(input);
      setExplanationResult(result);
      toast({ title: 'Explanation Generated', description: `Risk explanation for ${shipmentId} is ready.` });
    } catch (error) {
      console.error('Error generating explanation:', error);
      toast({ title: 'Error', description: 'Failed to generate risk explanation. Please try again.', variant: 'destructive' });
    }
    setIsLoading(false);
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Explainability Dashboards"
        description="Understand why a shipment was flagged as high-risk with feature contributions."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Shipment Risk Explanation</CardTitle>
            <CardDescription>Enter a Shipment ID to get an AI-powered explanation of its risk factors.</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="shipmentId" className="flex items-center gap-1">
                  <Search className="h-4 w-4" /> Shipment ID
                </Label>
                <Input
                  id="shipmentId"
                  name="shipmentId"
                  value={shipmentId}
                  onChange={(e) => setShipmentId(e.target.value)}
                  placeholder="e.g., SHP12345"
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Lightbulb className="mr-2 h-4 w-4" />}
                Explain Risk
              </Button>
            </CardFooter>
          </form>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Risk Explanation for: <span className="text-primary">{shipmentId || "N/A"}</span></CardTitle>
            <CardDescription>Details about the risk assessment for the selected shipment.</CardDescription>
          </CardHeader>
          <CardContent className="min-h-[300px]">
            {isLoading && (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="ml-2">Generating explanation...</p>
              </div>
            )}
            {explanationResult && !isLoading && (
              <div className="space-y-6">
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertTitle>AI Explanation</AlertTitle>
                  <AlertDescription className="whitespace-pre-line">
                    {explanationResult.explanation}
                  </AlertDescription>
                </Alert>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <ListTree className="h-5 w-5 text-primary" /> Feature Contributions
                    </CardTitle>
                    <CardDescription>Breakdown of factors contributing to the risk score.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {explanationResult.featureContributions && explanationResult.featureContributions.length > 0 ? (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Feature</TableHead>
                            <TableHead className="text-right">Contribution</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {explanationResult.featureContributions.map((item, index) => (
                            <TableRow key={index}>
                              <TableCell className="font-medium">{item.feature}</TableCell>
                              <TableCell className="text-right">
                                <Badge variant={item.contribution > 0.5 ? "destructive" : item.contribution > 0.2 ? "secondary" : "default"}
                                 className={item.contribution > 0.5 ? "" : item.contribution > 0.2 ? "bg-yellow-500/20 text-yellow-700 border-yellow-400" : "bg-green-500/20 text-green-700 border-green-400"}
                                >
                                  {(item.contribution * 100).toFixed(1)}%
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    ) : (
                      <p className="text-sm text-muted-foreground">No detailed feature contributions available.</p>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}
            {!explanationResult && !isLoading && (
              <div className="text-center py-8 text-muted-foreground">
                <Lightbulb className="mx-auto h-12 w-12" />
                <p className="mt-2">Enter a shipment ID and click "Explain Risk" to see the analysis.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
