'use client';

import { useState, type FormEvent } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { FileText, Loader2, Zap } from 'lucide-react';
import { getSupplierVitalityScore } from '@/ai/flows/supplier-vitality-scorecards';
import { 
  type SupplierVitalityScoreInput,
  type SupplierVitalityScoreOutput 
} from '@/ai/flows/types/supplier-vitality-types';
import { useToast } from '@/hooks/use-toast';

export default function SupplierVitalityScorecardsPage() {
  const [formData, setFormData] = useState<SupplierVitalityScoreInput>({
    supplierName: 'Global Semiconductors Inc.',
    financialHealth: 'Stable, Positive Outlook, Net Profit Margin: 15%, Debt-to-Equity Ratio: 0.5',
    deliveryHistory: 'On-time delivery rate: 95%, Average lead time: 14 days, Order accuracy: 99%',
    newsSentiment: 'Positive sentiment overall. Recent news about expansion and new product lines. Some minor concerns about regional labor disputes.',
    geopoliticalIndicators: 'Supplier operates in a politically stable region. Low risk of trade disruptions. Minor currency fluctuation risks.',
  });
  const [scorecard, setScorecard] = useState<SupplierVitalityScoreOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setScorecard(null);
    try {
      const result = await getSupplierVitalityScore(formData);
      setScorecard(result);
      toast({ title: 'Scorecard Generated', description: `Vitality score for ${result.supplierName} is ${result.vitalityScore}.` });
    } catch (error) {
      console.error('Error generating scorecard:', error);
      toast({ title: 'Error', description: 'Failed to generate scorecard. Please try again.', variant: 'destructive' });
    }
    setIsLoading(false);
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Supplier Vitality Scorecards"
        description="Live risk scores combining financial health, delivery history, news sentiment, and geopolitical indicators."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Input Supplier Data</CardTitle>
            <CardDescription>Provide details about the supplier to generate a vitality score.</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4 max-h-[60vh] overflow-y-auto">
              <div>
                <Label htmlFor="supplierName">Supplier Name</Label>
                <Input id="supplierName" name="supplierName" value={formData.supplierName} onChange={handleChange} placeholder="e.g., Acme Corp" />
              </div>
              <div>
                <Label htmlFor="financialHealth">Financial Health Data</Label>
                <Textarea id="financialHealth" name="financialHealth" value={formData.financialHealth} onChange={handleChange} placeholder="e.g., Revenue, Profitability, Debt ratios" rows={3}/>
              </div>
              <div>
                <Label htmlFor="deliveryHistory">Delivery History Data</Label>
                <Textarea id="deliveryHistory" name="deliveryHistory" value={formData.deliveryHistory} onChange={handleChange} placeholder="e.g., On-time delivery rate, Lead times" rows={3}/>
              </div>
              <div>
                <Label htmlFor="newsSentiment">News Sentiment Data</Label>
                <Textarea id="newsSentiment" name="newsSentiment" value={formData.newsSentiment} onChange={handleChange} placeholder="e.g., Positive/Negative news mentions, Key events" rows={3}/>
              </div>
              <div>
                <Label htmlFor="geopoliticalIndicators">Geopolitical Indicators</Label>
                <Textarea id="geopoliticalIndicators" name="geopoliticalIndicators" value={formData.geopoliticalIndicators} onChange={handleChange} placeholder="e.g., Country risk, Trade policy changes" rows={3}/>
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Zap className="mr-2 h-4 w-4" />}
                Generate Scorecard
              </Button>
            </CardFooter>
          </form>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Supplier Vitality Scorecard</CardTitle>
            <CardDescription>AI-generated risk assessment and recommendations.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading && (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="ml-2">Generating scorecard...</p>
              </div>
            )}
            {scorecard && !isLoading && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-xl">{scorecard.supplierName}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-1">
                        <Label className="text-lg">Vitality Score</Label>
                        <span className={`text-2xl font-bold ${scorecard.vitalityScore > 70 ? 'text-green-600' : scorecard.vitalityScore > 40 ? 'text-yellow-500' : 'text-red-600'}`}>
                          {scorecard.vitalityScore} / 100
                        </span>
                      </div>
                      <Progress value={scorecard.vitalityScore} aria-label={`${scorecard.vitalityScore}% vitality score`} />
                    </div>
                    <div>
                      <h4 className="font-semibold text-md">Risk Assessment:</h4>
                      <p className="text-sm text-muted-foreground">{scorecard.riskAssessment}</p>
                    </div>
                     <div>
                      <h4 className="font-semibold text-md">Recommendations:</h4>
                      <p className="text-sm text-muted-foreground">{scorecard.recommendations}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
            {!scorecard && !isLoading && (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="mx-auto h-12 w-12" />
                <p className="mt-2">Enter supplier data and click "Generate Scorecard" to view the results.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
