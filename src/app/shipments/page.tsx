import React from 'react';
import Link from 'next/link';
import { Ship, MapPin, DollarSign, AlertTriangle, Lightbulb } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const modules = [
  { 
    title: 'Risk Heatmap', 
    description: 'View real-time shipment risks on an interactive map', 
    icon: MapPin, 
    href: '/shipments/risk-heatmap' 
  },
  { 
    title: 'Cost/Time Simulator', 
    description: 'Simulate different routing options to optimize cost and time', 
    icon: DollarSign, 
    href: '/shipments/cost-time-simulator' 
  },
  { 
    title: 'Disruption Replay', 
    description: 'Analyze past disruptions to improve future resilience', 
    icon: AlertTriangle, 
    href: '/shipments/disruption-replay' 
  },
  { 
    title: 'Explainability', 
    description: 'Understand the reasoning behind shipment routing decisions', 
    icon: Lightbulb, 
    href: '/shipments/explainability' 
  },
];

export default function ShipmentsPage() {
  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center mb-6">
        <Ship className="h-8 w-8 mr-3" />
        <h1 className="text-3xl font-bold">Shipments</h1>
      </div>
      
      <p className="text-muted-foreground mb-8">
        Manage and monitor your shipments across the global supply chain. Track risks, optimize routes, and gain insights.
      </p>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4">
        {modules.map((module) => (
          <Link href={module.href} key={module.title} className="block">
            <Card className="h-full transition-all hover:shadow-md">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <module.icon className="h-5 w-5" />
                </div>
                <CardTitle className="mt-4">{module.title}</CardTitle>
                <CardDescription>{module.description}</CardDescription>
              </CardHeader>
              <CardFooter>
                <Button variant="ghost" className="w-full justify-between">
                  Open module
                  <span className="sr-only">Open {module.title}</span>
                </Button>
              </CardFooter>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
} 