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
import { Loader2, Truck, Package, Zap, Lightbulb, MapPin, CheckCircle, DollarSign } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';

interface OrderDetails {
  orderId: string;
  origin: string;
  destination: string;
  partType: string;
  quantity: number;
  requiredBy: string;
}

interface MatchedCarrier {
  carrierId: string;
  carrierName: string;
  truckType: string;
  availableCapacity: string;
  currentLocation: string;
  estimatedCost: string;
  matchScore: number; // 0-1
  notes: string;
}

export default function LoadMatchingPage() {
  const [orderDetails, setOrderDetails] = useState<OrderDetails>({
    orderId: `ORD-${Date.now().toString().slice(-4)}`,
    origin: 'Tashkent Central Warehouse',
    destination: 'Fergana Assembly Plant',
    partType: 'Engine Control Units (ECUs)',
    quantity: 50,
    requiredBy: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().slice(0,10), // 2 days from now
  });
  
  const [matchedCarriers, setMatchedCarriers] = useState<MatchedCarrier[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setOrderDetails(prev => ({ ...prev, [name]: name === 'quantity' ? parseInt(value) : value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setMatchedCarriers(null);

    // Simulate AI processing
    await new Promise(resolve => setTimeout(resolve, 1500));

    const mockCarriers: MatchedCarrier[] = [
      { carrierId: 'TRK001', carrierName: 'UzTrans Logistics', truckType: '20t Curtain Sider', availableCapacity: '50% (10t free)', currentLocation: 'Tashkent Depot (5km away)', estimatedCost: '$350', matchScore: 0.92, notes: 'Optimal backhaul route match.' },
      { carrierId: 'TRK002', carrierName: 'Silk Road Express', truckType: '10t Box Truck', availableCapacity: '80% (8t free)', currentLocation: 'Chirchiq (30km away)', estimatedCost: '$420', matchScore: 0.85, notes: 'Slight detour, good capacity.' },
      { carrierId: 'TRK003', carrierName: 'Samarkand Hauliers', truckType: 'Refrigerated Truck', availableCapacity: 'Full', currentLocation: 'Angren (60km away)', estimatedCost: '$500', matchScore: 0.65, notes: 'Not ideal truck type, but available.' },
    ].sort((a,b) => b.matchScore - a.matchScore);

    setMatchedCarriers(mockCarriers);
    setIsLoading(false);
    toast({ title: 'Load Matching Complete', description: `${mockCarriers.length} potential carriers found.` });
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Intelligent Load-Matching"
        description="Matches spare-parts orders to the best carrier/truck combo in real time."
      />

      <Alert>
        <Lightbulb className="h-4 w-4" />
        <AlertTitle>Mock Interface</AlertTitle>
        <AlertDescription>
          This page demonstrates the UI for Intelligent Load-Matching. The matching logic is simulated.
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>New Spare Parts Order</CardTitle>
            <CardDescription>Enter order details to find suitable carriers.</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4 max-h-[60vh] overflow-y-auto">
              <div>
                <Label htmlFor="orderId">Order ID</Label>
                <Input id="orderId" name="orderId" value={orderDetails.orderId} onChange={handleInputChange} readOnly />
              </div>
              <div>
                <Label htmlFor="origin">Origin</Label>
                <Input id="origin" name="origin" value={orderDetails.origin} onChange={handleInputChange} placeholder="e.g., Tashkent Central Warehouse" />
              </div>
              <div>
                <Label htmlFor="destination">Destination</Label>
                <Input id="destination" name="destination" value={orderDetails.destination} onChange={handleInputChange} placeholder="e.g., Fergana Assembly Plant" />
              </div>
              <div>
                <Label htmlFor="partType">Part Type / Description</Label>
                <Input id="partType" name="partType" value={orderDetails.partType} onChange={handleInputChange} placeholder="e.g., Engine Control Units" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <div>
                    <Label htmlFor="quantity">Quantity</Label>
                    <Input id="quantity" name="quantity" type="number" value={orderDetails.quantity} onChange={handleInputChange} placeholder="e.g., 50" />
                 </div>
                 <div>
                    <Label htmlFor="requiredBy">Required By Date</Label>
                    <Input id="requiredBy" name="requiredBy" type="date" value={orderDetails.requiredBy} onChange={handleInputChange} />
                 </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Zap className="mr-2 h-4 w-4" />}
                Find Best Match
              </Button>
            </CardFooter>
          </form>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Matched Carriers &amp; Trucks</CardTitle>
            <CardDescription>Real-time suggestions for the best transport options.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading && (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="ml-2">Searching for matches...</p>
              </div>
            )}
            {matchedCarriers && !isLoading && (
              <div className="space-y-4">
                 <div className="aspect-video bg-muted rounded-md flex items-center justify-center mb-4">
                    <Image src="https://placehold.co/600x338.png" alt="Carrier Routes Placeholder" width={600} height={338} className="object-cover rounded-md" data-ai-hint="map carrier routes animation" />
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Carrier</TableHead>
                      <TableHead>Truck</TableHead>
                      <TableHead className="text-center">Match %</TableHead>
                      <TableHead>Cost</TableHead>
                      <TableHead>Notes</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {matchedCarriers.map((carrier) => (
                      <TableRow key={carrier.carrierId}>
                        <TableCell className="font-medium">
                            {carrier.carrierName}
                            <p className="text-xs text-muted-foreground flex items-center gap-1"><MapPin size={12}/>{carrier.currentLocation}</p>
                        </TableCell>
                        <TableCell>
                            {carrier.truckType}
                            <p className="text-xs text-muted-foreground">Capacity: {carrier.availableCapacity}</p>
                        </TableCell>
                        <TableCell className="text-center">
                            <Badge variant={carrier.matchScore > 0.9 ? "default" : carrier.matchScore > 0.7 ? "secondary" : "outline"} 
                                   className={carrier.matchScore > 0.9 ? "bg-green-500 hover:bg-green-600 text-white" : ""}>
                                {(carrier.matchScore * 100).toFixed(0)}%
                            </Badge>
                        </TableCell>
                        <TableCell>{carrier.estimatedCost}</TableCell>
                        <TableCell className="text-xs">{carrier.notes}</TableCell>
                        <TableCell>
                            <Button variant="outline" size="sm" onClick={() => toast({title: "Booking Confirmed (Mock)", description: `Order ${orderDetails.orderId} assigned to ${carrier.carrierName}.`})}>
                                <CheckCircle className="h-4 w-4 mr-1" /> Book
                            </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
            {!matchedCarriers && !isLoading && (
              <div className="text-center py-8 text-muted-foreground">
                <Truck className="mx-auto h-12 w-12" />
                <p className="mt-2">Enter order details to find the best carrier matches.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
