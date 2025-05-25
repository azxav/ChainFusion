import React from 'react';
import Link from 'next/link';
import { Warehouse, AlertTriangle, RefreshCw, ClipboardList } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const modules = [
  { 
    title: 'Stress Indicators', 
    description: 'Monitor inventory levels and forecast potential stock-outs', 
    icon: AlertTriangle, 
    href: '/inventory/stress-indicators' 
  },
  { 
    title: 'Buffer Stock Recommendations', 
    description: 'Get AI-driven recommendations for optimal buffer stock levels', 
    icon: RefreshCw, 
    href: '/inventory/buffer-stock' 
  },
  { 
    title: 'Discrepancy Resolution', 
    description: 'Identify and resolve inventory discrepancies automatically', 
    icon: ClipboardList, 
    href: '/inventory/discrepancy-resolution' 
  },
];

export default function InventoryPage() {
  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center mb-6">
        <Warehouse className="h-8 w-8 mr-3" />
        <h1 className="text-3xl font-bold">Inventory</h1>
      </div>
      
      <p className="text-muted-foreground mb-8">
        Manage inventory levels, prevent stockouts, and optimize buffer stock across your supply chain.
      </p>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
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