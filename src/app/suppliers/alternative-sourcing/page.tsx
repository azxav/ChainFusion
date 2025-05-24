
'use client';

import { useState, type FormEvent } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Loader2, Search, PackageSearch, FileText, Users, CheckCircle, AlertTriangle, BarChartBig } from 'lucide-react';
import { findAlternativeSuppliers, type FindAlternativeSuppliersInput, type FindAlternativeSuppliersOutput } from '@/ai/flows/alternative-sourcing-engine';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

type AlternativeSupplier = FindAlternativeSuppliersOutput['alternativeSuppliers'][0];

export default function AlternativeSourcingPage() {
  const [formData, setFormData] = useState<FindAlternativeSuppliersInput>({
    partName: 'High-Performance GPU HX-5000',
    quantity: 1000,
    dueDate: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10), // Approx 4 weeks from now
    currentSupplier: 'ChipWorks Inc.',
    reasonForShortage: 'Production line fire at ChipWorks factory, causing an indefinite delay.',
    secondarySupplierDatabaseDescription: 'A curated database of global GPU manufacturers, including data on their production capacity (units/month), quality certifications (ISO 9001, Automotive Grade), risk profiles (geopolitical, financial stability scores from 1-10, 10 being lowest risk), and typical lead times (days).',
  });
  const [results, setResults] = useState<FindAlternativeSuppliersOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const [selectedPoDraft, setSelectedPoDraft] = useState<string>('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: name === 'quantity' ? parseInt(value, 10) : value });
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setResults(null);
    try {
      const response = await findAlternativeSuppliers(formData);
      setResults(response);
      toast({ title: 'Alternative Suppliers Found', description: `${response.alternativeSuppliers.length} potential suppliers identified.` });
    } catch (error) {
      console.error('Error finding alternative suppliers:', error);
      toast({ title: 'Error', description: 'Failed to find alternative suppliers. Please try again.', variant: 'destructive' });
    }
    setIsLoading(false);
  };

  const renderScoreBadge = (score: number, scoreType: 'fit' | 'capacity' | 'risk') => {
    let variant: "default" | "secondary" | "destructive" | "outline" = "default";
    let className = "";
    let label = score.toFixed(2);

    if (scoreType === 'risk') { // Lower is better for risk
      if (score <= 3) { variant = "default"; className="bg-green-500/80 hover:bg-green-600/90 text-white"; label = `${score.toFixed(1)} (Low)`;}
      else if (score <= 7) { variant = "secondary"; className="bg-yellow-500/80 hover:bg-yellow-600/90 text-black"; label = `${score.toFixed(1)} (Med)`;}
      else { variant = "destructive"; label = `${score.toFixed(1)} (High)`;}
    } else { 
        const displayScore = score > 1 ? score : score * 100;
        if (displayScore >= 75) { variant = "default"; className="bg-green-500/80 hover:bg-green-600/90 text-white"; }
        else if (displayScore >= 50) { variant = "secondary"; className="bg-yellow-500/80 hover:bg-yellow-600/90 text-black";}
        else { variant = "destructive"; }
        label = `${displayScore.toFixed(0)}${scoreType === 'fit' || scoreType === 'capacity' ? '%' : ''}`;
    }
    return <Badge variant={variant} className={className}>{label}</Badge>;
  };


  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Alternative Sourcing Engine"
        description="AI-powered RFQ automation to identify and engage alternative suppliers."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Sourcing Request</CardTitle>
            <CardDescription>Define the part and reason for needing alternatives.</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4 max-h-[65vh] overflow-y-auto">
              <div>
                <Label htmlFor="partName">Part Name/Number</Label>
                <Input id="partName" name="partName" value={formData.partName} onChange={handleChange} placeholder="e.g., HX-5000 GPU" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="quantity">Quantity Needed</Label>
                  <Input id="quantity" name="quantity" type="number" value={formData.quantity} onChange={handleChange} placeholder="e.g., 1000" />
                </div>
                <div>
                  <Label htmlFor="dueDate">Due Date</Label>
                  <Input id="dueDate" name="dueDate" type="date" value={formData.dueDate} onChange={handleChange} />
                </div>
              </div>
              <div>
                <Label htmlFor="currentSupplier">Current Supplier</Label>
                <Input id="currentSupplier" name="currentSupplier" value={formData.currentSupplier} onChange={handleChange} placeholder="e.g., ChipWorks Inc." />
              </div>
              <div>
                <Label htmlFor="reasonForShortage">Reason for Shortage</Label>
                <Textarea id="reasonForShortage" name="reasonForShortage" value={formData.reasonForShortage} onChange={handleChange} placeholder="Describe the supply issue..." rows={3} />
              </div>
              <div>
                <Label htmlFor="secondarySupplierDatabaseDescription">Supplier Database Description</Label>
                <Textarea id="secondarySupplierDatabaseDescription" name="secondarySupplierDatabaseDescription" value={formData.secondarySupplierDatabaseDescription} onChange={handleChange} placeholder="Describe the data source for alternative suppliers..." rows={4} />
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
                Find Alternative Suppliers
              </Button>
            </CardFooter>
          </form>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Suggested Alternative Suppliers</CardTitle>
            <CardDescription>Ranked list based on your criteria and supplier database.</CardDescription>
          </CardHeader>
          <CardContent className="min-h-[300px]">
            {isLoading && (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="ml-2">Searching for suppliers...</p>
              </div>
            )}
            {!isLoading && results && results.alternativeSuppliers.length > 0 && (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Supplier</TableHead>
                    <TableHead className="text-center">Fit</TableHead>
                    <TableHead className="text-center">Capacity</TableHead>
                    <TableHead className="text-center">Risk</TableHead>
                    <TableHead className="text-center">PO Draft</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {results.alternativeSuppliers.map((supplier, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{supplier.supplierName}</TableCell>
                      <TableCell className="text-center">{renderScoreBadge(supplier.fitScore, 'fit')}</TableCell>
                      <TableCell className="text-center">{renderScoreBadge(supplier.capacityScore, 'capacity')}</TableCell>
                      <TableCell className="text-center">{renderScoreBadge(supplier.riskScore, 'risk')}</TableCell>
                      <TableCell className="text-center">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm" onClick={() => setSelectedPoDraft(supplier.poAmendmentDraft)}>
                              <FileText className="mr-1 h-4 w-4" /> View
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>PO Amendment Draft for {supplier.supplierName}</DialogTitle>
                              <DialogDescription>
                                Review the AI-generated draft. You can copy and paste this into your procurement system.
                              </DialogDescription>
                            </DialogHeader>
                            <Textarea value={selectedPoDraft} readOnly rows={15} className="mt-4 text-sm" />
                            <Button onClick={() => navigator.clipboard.writeText(selectedPoDraft)} className="mt-2">Copy Draft</Button>
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
            {!isLoading && (!results || results.alternativeSuppliers.length === 0) && (
              <div className="text-center py-8 text-muted-foreground">
                <PackageSearch className="mx-auto h-12 w-12" />
                <p className="mt-2">
                  {results ? 'No alternative suppliers found matching your criteria.' : 'Enter details and click "Find Suppliers" to see suggestions.'}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
