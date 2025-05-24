
'use client';

import { useState, type FormEvent } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  Loader2, 
  SearchCheck, 
  Package, 
  MapPin, 
  ListChecks, 
  ScanLine, 
  FileClock,
  AlertTriangle,
  Wrench,
  ClipboardList,
  Copy
} from 'lucide-react';
import { automatedDiscrepancyResolution, type AutomatedDiscrepancyResolutionInput, type AutomatedDiscrepancyResolutionOutput } from '@/ai/flows/automated-discrepancy-resolution';
import { useToast } from '@/hooks/use-toast';

export default function DiscrepancyResolutionPage() {
  const [formData, setFormData] = useState<AutomatedDiscrepancyResolutionInput>({
    itemIdentifier: 'PART-XYZ-789',
    location: 'Warehouse Zone B, Shelf 12, Bin 3',
    expectedCount: 100,
    actualCount: 95,
    lastKnownActivity: 'Received from supplier ABC on 2023-10-15, cycle counted on 2023-10-20 with no issues. Part of picklist #PKL500 for order #ORD203.',
  });
  const [resolution, setResolution] = useState<AutomatedDiscrepancyResolutionOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: name === 'expectedCount' || name === 'actualCount' ? parseInt(value, 10) : value });
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setResolution(null);

    if (formData.actualCount < 0 || formData.expectedCount < 0) {
        toast({ title: 'Invalid Input', description: 'Counts cannot be negative.', variant: 'destructive' });
        setIsLoading(false);
        return;
    }
    if (formData.actualCount === formData.expectedCount) {
        toast({ title: 'No Discrepancy', description: 'Expected and actual counts are the same.', variant: 'default' });
        setResolution({ likelyErrorSources: ["No discrepancy found based on input."], workOrderDescription: "No work order needed as counts match."});
        setIsLoading(false);
        return;
    }

    try {
      const result = await automatedDiscrepancyResolution(formData);
      setResolution(result);
      toast({ title: 'Analysis Complete', description: 'Discrepancy analysis and work order draft are ready.' });
    } catch (error) {
      console.error('Error resolving discrepancy:', error);
      toast({ title: 'Error', description: 'Failed to analyze discrepancy. Please try again.', variant: 'destructive' });
    }
    setIsLoading(false);
  };

  const handleCopyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({ title: 'Copied to Clipboard', description: 'Work order description copied.' });
    }).catch(err => {
      toast({ title: 'Copy Failed', description: 'Could not copy text to clipboard.', variant: 'destructive' });
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Automated Discrepancy Resolution"
        description="AI-powered root cause analysis and work order generation for inventory discrepancies."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Discrepancy Details</CardTitle>
            <CardDescription>Enter information about the inventory mismatch.</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4 max-h-[65vh] overflow-y-auto">
              <div>
                <Label htmlFor="itemIdentifier" className="flex items-center gap-1"><Package className="h-4 w-4 text-primary" /> Item Identifier</Label>
                <Input id="itemIdentifier" name="itemIdentifier" value={formData.itemIdentifier} onChange={handleChange} placeholder="e.g., SKU123, PART-ABC" />
              </div>
              <div>
                <Label htmlFor="location" className="flex items-center gap-1"><MapPin className="h-4 w-4 text-primary" /> Location</Label>
                <Input id="location" name="location" value={formData.location} onChange={handleChange} placeholder="e.g., Warehouse A, Shelf 3, Bin 2" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="expectedCount" className="flex items-center gap-1"><ListChecks className="h-4 w-4 text-primary" /> Expected Count</Label>
                  <Input id="expectedCount" name="expectedCount" type="number" value={formData.expectedCount} onChange={handleChange} placeholder="e.g., 100" />
                </div>
                <div>
                  <Label htmlFor="actualCount" className="flex items-center gap-1"><ScanLine className="h-4 w-4 text-primary" /> Actual Count</Label>
                  <Input id="actualCount" name="actualCount" type="number" value={formData.actualCount} onChange={handleChange} placeholder="e.g., 95" />
                </div>
              </div>
              <div>
                <Label htmlFor="lastKnownActivity" className="flex items-center gap-1"><FileClock className="h-4 w-4 text-primary" /> Last Known Activity/Context</Label>
                <Textarea id="lastKnownActivity" name="lastKnownActivity" value={formData.lastKnownActivity} onChange={handleChange} placeholder="Describe any recent movements, counts, or related orders..." rows={4} />
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <SearchCheck className="mr-2 h-4 w-4" />}
                Analyze Discrepancy
              </Button>
            </CardFooter>
          </form>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Resolution Analysis & Work Order</CardTitle>
            <CardDescription>AI-generated insights and recommended actions.</CardDescription>
          </CardHeader>
          <CardContent className="min-h-[300px]">
            {isLoading && (
              <div className="flex flex-col items-center justify-center py-8">
                <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                <p className="text-muted-foreground">Analyzing inventory data and generating recommendations...</p>
              </div>
            )}
            {resolution && !isLoading && (
              <div className="space-y-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-destructive" /> Likely Error Sources
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {resolution.likelyErrorSources.length > 0 ? (
                      <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                        {resolution.likelyErrorSources.map((source, index) => (
                          <li key={index}>{source}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-muted-foreground">No specific error sources identified by the AI.</p>
                    )}
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2 flex flex-row items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Wrench className="h-5 w-5 text-primary" /> Generated Work Order
                    </CardTitle>
                    <Button variant="outline" size="sm" onClick={() => handleCopyToClipboard(resolution.workOrderDescription)}>
                      <Copy className="mr-2 h-4 w-4" /> Copy Work Order
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <Textarea 
                      value={resolution.workOrderDescription} 
                      readOnly 
                      rows={10} 
                      className="text-sm bg-muted/50 focus-visible:ring-0 focus-visible:ring-offset-0 cursor-default" 
                      placeholder="Work order details will appear here..."
                    />
                    <p className="text-xs text-muted-foreground mt-2">This work order is a suggestion. Review and adapt it as necessary for your operational procedures.</p>
                  </CardContent>
                </Card>
              </div>
            )}
            {!resolution && !isLoading && (
              <div className="text-center py-8 text-muted-foreground">
                <ClipboardList className="mx-auto h-16 w-16 mb-4" />
                <p className="text-lg font-medium">Ready to Investigate?</p>
                <p className="mt-1">Enter the discrepancy details on the left and click "Analyze Discrepancy" to get AI-powered insights and a drafted work order.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
