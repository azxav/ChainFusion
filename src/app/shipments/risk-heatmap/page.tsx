
'use client';

import { useState, type FormEvent } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertCircle, Loader2, MapPin, PlusCircle, Trash2 } from 'lucide-react';
import { generateRiskHeatmapAlerts, type RiskHeatmapAlertsInput, type RiskHeatmapAlertsOutput } from '@/ai/flows/risk-heatmap-alerts';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';

type ShipmentDetailInput = RiskHeatmapAlertsInput['shipmentDetails'][0];

export default function RiskHeatmapPage() {
  const [shipmentDetails, setShipmentDetails] = useState<ShipmentDetailInput[]>([
    { shipmentId: 'SHP001', origin: 'Tashkent, UZ', destination: 'Almaty, KZ', currentLocation: 'En route near Shymkent', estimatedDeparture: new Date().toISOString(), estimatedArrival: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), cargoDescription: 'Electronics Components' },
  ]);
  const [alerts, setAlerts] = useState<RiskHeatmapAlertsOutput['alerts'] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleAddShipment = () => {
    setShipmentDetails([...shipmentDetails, { shipmentId: `SHP00${shipmentDetails.length + 1}`, origin: '', destination: '', currentLocation: '', estimatedDeparture: new Date().toISOString(), estimatedArrival: new Date().toISOString(), cargoDescription: '' }]);
  };

  const handleRemoveShipment = (index: number) => {
    setShipmentDetails(shipmentDetails.filter((_, i) => i !== index));
  };

  const handleShipmentChange = (index: number, field: keyof ShipmentDetailInput, value: string) => {
    const newDetails = [...shipmentDetails];
    newDetails[index] = { ...newDetails[index], [field]: value };
    setShipmentDetails(newDetails);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setAlerts(null);
    try {
      const result = await generateRiskHeatmapAlerts({ shipmentDetails });
      setAlerts(result.alerts);
      toast({ title: 'Risk Analysis Complete', description: `${result.alerts.length} alerts generated.` });
    } catch (error) {
      console.error('Error generating risk heatmap alerts:', error);
      toast({ title: 'Error', description: 'Failed to generate risk alerts. Please try again.', variant: 'destructive' });
    }
    setIsLoading(false);
  };
  
  const getRiskBadgeVariant = (riskScore: number): "default" | "secondary" | "destructive" | "outline" => {
    if (riskScore > 0.7) return "destructive";
    if (riskScore > 0.4) return "secondary"; 
    return "default"; 
  };


  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Risk Heatmap &amp; Alerts"
        description="Real-time geospatial view of shipments, color-coded by AI-predicted delay risk."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Input Shipment Data</CardTitle>
            <CardDescription>Add details for shipments to analyze.</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6 max-h-[60vh] overflow-y-auto">
              {shipmentDetails.map((shipment, index) => (
                <Card key={index} className="p-4 space-y-3 relative">
                   <Button type="button" variant="ghost" size="icon" className="absolute top-2 right-2 h-6 w-6" onClick={() => handleRemoveShipment(index)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                   </Button>
                  <div className="space-y-1">
                    <Label htmlFor={`shipmentId-${index}`}>Shipment ID</Label>
                    <Input id={`shipmentId-${index}`} value={shipment.shipmentId} onChange={(e) => handleShipmentChange(index, 'shipmentId', e.target.value)} placeholder="e.g., SHP123" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label htmlFor={`origin-${index}`}>Origin</Label>
                      <Input id={`origin-${index}`} value={shipment.origin} onChange={(e) => handleShipmentChange(index, 'origin', e.target.value)} placeholder="e.g., Tashkent, UZ" />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor={`destination-${index}`}>Destination</Label>
                      <Input id={`destination-${index}`} value={shipment.destination} onChange={(e) => handleShipmentChange(index, 'destination', e.target.value)} placeholder="e.g., Almaty, KZ" />
                    </div>
                  </div>
                   <div className="space-y-1">
                    <Label htmlFor={`currentLocation-${index}`}>Current Location</Label>
                    <Input id={`currentLocation-${index}`} value={shipment.currentLocation} onChange={(e) => handleShipmentChange(index, 'currentLocation', e.target.value)} placeholder="e.g., En route near Shymkent" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                     <div className="space-y-1">
                        <Label htmlFor={`estimatedDeparture-${index}`}>Est. Departure</Label>
                        <Input id={`estimatedDeparture-${index}`} type="datetime-local" value={shipment.estimatedDeparture.substring(0,16)} onChange={(e) => handleShipmentChange(index, 'estimatedDeparture', new Date(e.target.value).toISOString())} />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor={`estimatedArrival-${index}`}>Est. Arrival</Label>
                        <Input id={`estimatedArrival-${index}`} type="datetime-local" value={shipment.estimatedArrival.substring(0,16)} onChange={(e) => handleShipmentChange(index, 'estimatedArrival', new Date(e.target.value).toISOString())} />
                      </div>
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor={`cargoDescription-${index}`}>Cargo Description</Label>
                    <Textarea id={`cargoDescription-${index}`} value={shipment.cargoDescription} onChange={(e) => handleShipmentChange(index, 'cargoDescription', e.target.value)} placeholder="e.g., Electronics, Textiles" />
                  </div>
                </Card>
              ))}
              <Button type="button" variant="outline" onClick={handleAddShipment} className="w-full">
                <PlusCircle className="mr-2 h-4 w-4" /> Add Another Shipment
              </Button>
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <MapPin className="mr-2 h-4 w-4" />}
                Analyze Risks
              </Button>
            </CardFooter>
          </form>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Shipment Risk Overview</CardTitle>
            <CardDescription>Geospatial map showing shipment locations and risk levels.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="aspect-video bg-muted rounded-md flex items-center justify-center mb-4">
              <Image src="https://placehold.co/800x450.png" alt="Risk Heatmap Placeholder" width={800} height={450} className="object-cover rounded-md" data-ai-hint="world map logistics routes" />
            </div>
            {isLoading && (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="ml-2">Analyzing shipment risks...</p>
              </div>
            )}
            {alerts && alerts.length === 0 && !isLoading && (
              <div className="text-center py-8">
                <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground" />
                <p className="mt-2 text-muted-foreground">No alerts to display. All shipments appear to be on track.</p>
              </div>
            )}
            {alerts && alerts.length > 0 && (
              <div className="mt-4">
                <h3 className="text-lg font-semibold mb-2">Generated Alerts:</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Shipment ID</TableHead>
                      <TableHead>Risk Score</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead>Affected Segment</TableHead>
                      <TableHead>Suggestion</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {alerts.map((alert) => (
                      <TableRow key={alert.shipmentId}>
                        <TableCell>{alert.shipmentId}</TableCell>
                        <TableCell>
                           <Badge variant={getRiskBadgeVariant(alert.riskScore)}>
                            {(alert.riskScore * 100).toFixed(0)}%
                           </Badge>
                        </TableCell>
                        <TableCell>{alert.delayReason}</TableCell>
                        <TableCell>{alert.affectedRouteSegment || 'N/A'}</TableCell>
                        <TableCell>{alert.suggestedAction}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
            {!alerts && !isLoading && (
               <div className="text-center py-8 text-muted-foreground">
                <MapPin className="mx-auto h-12 w-12" />
                <p className="mt-2">Enter shipment details and click "Analyze Risks" to see the heatmap and alerts.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
