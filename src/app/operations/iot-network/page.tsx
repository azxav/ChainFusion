'use client';

import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { MapPin, Search, Wifi, Barcode, Eye, CheckCircle2, AlertCircle, RefreshCcw } from 'lucide-react';
import Image from 'next/image';

interface TrackedPart {
  id: string;
  name: string;
  type: 'RFID' | 'Vision';
  location: string;
  status: 'Inbound' | 'Warehouse' | 'Staging' | 'Production Line' | 'Error';
  lastSeen: string;
  details?: string;
}

const initialParts: TrackedPart[] = [
  { id: 'PART001', name: 'MCU Chipset XZ-200', type: 'RFID', location: 'Warehouse Zone A, Shelf 3B', status: 'Warehouse', lastSeen: '2 mins ago' },
  { id: 'PART002', name: 'Power Regulator P-50', type: 'Vision', location: 'Inbound Dock 2', status: 'Inbound', lastSeen: '10 mins ago' },
  { id: 'PART003', name: 'Connector Assy C-90', type: 'RFID', location: 'Production Line 1 Staging', status: 'Staging', lastSeen: '1 min ago' },
  { id: 'PART004', name: 'Display Panel D-15', type: 'Vision', location: 'Assembly Station 3', status: 'Production Line', lastSeen: '5 mins ago' },
  { id: 'PART005', name: 'Sensor Module S-07', type: 'RFID', location: 'Unknown (Last: Zone B)', status: 'Error', lastSeen: '1 hour ago', details: 'Signal lost' },
];

export default function IotNetworkPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [trackedParts, setTrackedParts] = useState<TrackedPart[]>(initialParts);
  const [selectedPart, setSelectedPart] = useState<TrackedPart | null>(null);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setTrackedParts(prevParts => 
        prevParts.map(part => ({
          ...part,
          lastSeen: `${Math.floor(Math.random() * 5) + 1} mins ago`, // Randomize lastSeen
          status: part.status !== 'Error' && Math.random() < 0.05 ? (['Inbound', 'Warehouse', 'Staging', 'Production Line'] as TrackedPart['status'][])[Math.floor(Math.random() * 4)] : part.status
        }))
      );
    }, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const filteredParts = trackedParts.filter(part =>
    (part.name.toLowerCase().includes(searchTerm.toLowerCase()) || part.id.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (filterType === 'all' || part.type === filterType) &&
    (filterStatus === 'all' || part.status === filterStatus)
  );

  const getStatusBadge = (status: TrackedPart['status']) => {
    switch (status) {
      case 'Inbound': return <Badge variant="secondary">Inbound</Badge>;
      case 'Warehouse': return <Badge variant="default" className="bg-blue-500 hover:bg-blue-600 text-white">Warehouse</Badge>;
      case 'Staging': return <Badge variant="default" className="bg-yellow-500 hover:bg-yellow-600 text-black">Staging</Badge>;
      case 'Production Line': return <Badge variant="default" className="bg-green-500 hover:bg-green-600 text-white">Production Line</Badge>;
      case 'Error': return <Badge variant="destructive">Error</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };
  
  const getTypeIcon = (type: TrackedPart['type']) => {
    return type === 'RFID' ? <Wifi className="h-4 w-4 text-primary" /> : <Eye className="h-4 w-4 text-accent" />;
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="IoT Sensor Network"
        description="RFID- and vision-based tracking of parts from inbound receipt to production line pick-up."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Live Parts Tracking Map</CardTitle>
              <CardDescription>Visual overview of part locations within the facility.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="aspect-video bg-muted rounded-md flex items-center justify-center">
                <Image 
                  src="https://placehold.co/800x450.png" 
                  alt="Facility Map Placeholder" 
                  width={800} 
                  height={450} 
                  className="object-cover rounded-md"
                  data-ai-hint="factory floor plan 3d" 
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1">
           <Card>
            <CardHeader>
              <CardTitle>Selected Part Details</CardTitle>
              {selectedPart ? <CardDescription>Information for {selectedPart.name} ({selectedPart.id})</CardDescription> : <CardDescription>Click a part in the table to see details.</CardDescription>}
            </CardHeader>
            <CardContent className="min-h-[300px]">
              {selectedPart ? (
                <div className="space-y-3">
                  <h3 className="font-semibold text-lg">{selectedPart.name}</h3>
                  <p className="text-sm text-muted-foreground">ID: {selectedPart.id}</p>
                  <p className="text-sm flex items-center gap-2">Type: {getTypeIcon(selectedPart.type)} {selectedPart.type}</p>
                  <p className="text-sm">Location: {selectedPart.location}</p>
                  <div className="text-sm flex items-center gap-2">Status: {getStatusBadge(selectedPart.status)}</div>
                  <p className="text-sm">Last Seen: {selectedPart.lastSeen}</p>
                  {selectedPart.status === 'Error' && selectedPart.details && (
                    <p className="text-sm text-destructive">Details: {selectedPart.details}</p>
                  )}
                  <Button variant="outline" size="sm" className="w-full mt-2">View Full History</Button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                  <Barcode className="h-16 w-16 mb-2" />
                  <p>No part selected</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tracked Parts List</CardTitle>
          <div className="flex flex-col md:flex-row gap-2 mt-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search by Part Name or ID..." 
                className="pl-8 w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Filter by Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="RFID">RFID</SelectItem>
                <SelectItem value="Vision">Vision</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Filter by Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="Inbound">Inbound</SelectItem>
                <SelectItem value="Warehouse">Warehouse</SelectItem>
                <SelectItem value="Staging">Staging</SelectItem>
                <SelectItem value="Production Line">Production Line</SelectItem>
                <SelectItem value="Error">Error</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={() => console.log("Refreshing data...")} className="w-full md:w-auto">
                <RefreshCcw className="h-4 w-4 mr-2" /> Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Seen</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredParts.length > 0 ? (
                filteredParts.map((part) => (
                  <TableRow key={part.id} onClick={() => setSelectedPart(part)} className="cursor-pointer hover:bg-muted/50">
                    <TableCell className="font-medium">{part.id}</TableCell>
                    <TableCell>{part.name}</TableCell>
                    <TableCell className="flex items-center gap-1">{getTypeIcon(part.type)} {part.type}</TableCell>
                    <TableCell>{part.location}</TableCell>
                    <TableCell>{getStatusBadge(part.status)}</TableCell>
                    <TableCell>{part.lastSeen}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center h-24">
                    No parts found matching your criteria.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
