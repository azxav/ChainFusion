
'use client';

import { useState, type FormEvent } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, Zap, GitFork, Route, Replace, ListOrdered, Lightbulb } from 'lucide-react';
import { autoReplanningGenerator, type AutoReplanningInput, type AutoReplanningOutput } from '@/ai/flows/auto-replanning-generator';
import { useToast } from '@/hooks/use-toast';

export default function AutoReplanningPage() {
  const [formData, setFormData] = useState<AutoReplanningInput>({
    disruptionDescription: 'Sudden closure of major shipping port "Port Omega" due to unexpected strike. All inbound and outbound cargo halted for an estimated 7-10 days.',
    currentProductionPlan: 'Line A: Assembling Product X, requires component C1 (via Port Omega) in 3 days. Line B: Assembling Product Y, requires component C2 (alternate route available) in 5 days. Inventory of C1 is low (2 days supply).',
  });
  const [planningResult, setPlanningResult] = useState<AutoReplanningOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setPlanningResult(null);
    try {
      const result = await autoReplanningGenerator(formData);
      setPlanningResult(result);
      toast({ title: 'Replanning Complete', description: 'AI has generated replanning suggestions.' });
    } catch (error)
    {
      console.error('Error generating replanning suggestions:', error);
      toast({ title: 'Error', description: 'Failed to generate replanning suggestions. Please try again.', variant: 'destructive' });
    }
    setIsLoading(false);
  };

  const renderSuggestionList = (title: string, icon: React.ElementType, suggestions: string[] | undefined) => {
    const IconComponent = icon;
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-md flex items-center gap-2">
            <IconComponent className="h-5 w-5 text-primary" /> {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {suggestions && suggestions.length > 0 ? (
            <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
              {suggestions.map((suggestion, index) => (
                <li key={index}>{suggestion}</li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">No specific suggestions provided for this category.</p>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Auto-Replanning Generator"
        description="AI-powered suggestions for optimized re-routing, component substitutions, or production sequence shifts."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Disruption Scenario</CardTitle>
            <CardDescription>Describe the disruption and current plan.</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4 max-h-[60vh] overflow-y-auto">
              <div>
                <Label htmlFor="disruptionDescription">Disruption Description</Label>
                <Textarea
                  id="disruptionDescription"
                  name="disruptionDescription"
                  value={formData.disruptionDescription}
                  onChange={handleChange}
                  placeholder="Detail the nature, scope, and expected duration of the disruption..."
                  rows={5}
                />
              </div>
              <div>
                <Label htmlFor="currentProductionPlan">Current Production Plan</Label>
                <Textarea
                  id="currentProductionPlan"
                  name="currentProductionPlan"
                  value={formData.currentProductionPlan}
                  onChange={handleChange}
                  placeholder="Outline current routes, components, sequences, and inventory levels relevant to the disruption..."
                  rows={8}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Zap className="mr-2 h-4 w-4" />}
                Generate Replanning Suggestions
              </Button>
            </CardFooter>
          </form>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Replanning Suggestions</CardTitle>
            <CardDescription>AI-generated insights to mitigate the disruption.</CardDescription>
          </CardHeader>
          <CardContent className="min-h-[300px]">
            {isLoading && (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="ml-2">Generating suggestions...</p>
              </div>
            )}
            {planningResult && !isLoading && (
              <div className="space-y-6">
                <Alert variant="default" className="bg-primary/10 border-primary/30">
                  <Lightbulb className="h-5 w-5 text-primary" />
                  <AlertTitle className="text-primary">Overall Recommendation</AlertTitle>
                  <AlertDescription className="text-primary/90">
                    {planningResult.overallRecommendation}
                  </AlertDescription>
                </Alert>

                <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                  {renderSuggestionList("Re-routing Suggestions", Route, planningResult.reroutingSuggestions)}
                  {renderSuggestionList("Component Substitution Suggestions", Replace, planningResult.componentSubstitutionSuggestions)}
                  {renderSuggestionList("Production Sequence Shift Suggestions", ListOrdered, planningResult.productionSequenceShiftSuggestions)}
                </div>
              </div>
            )}
            {!planningResult && !isLoading && (
              <div className="text-center py-8 text-muted-foreground">
                <GitFork className="mx-auto h-12 w-12" />
                <p className="mt-2">Describe the disruption and current plan to get AI-powered replanning suggestions.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
