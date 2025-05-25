import React from 'react';
import Link from 'next/link';
import { Users, FileText, PackageSearch } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const modules = [
  { 
    title: 'Vitality Scorecards', 
    description: 'View detailed risk scores and performance metrics for suppliers', 
    icon: FileText, 
    href: '/suppliers/vitality-scorecards' 
  },
  { 
    title: 'Alternative Sourcing', 
    description: 'Find and evaluate alternative suppliers when disruptions occur', 
    icon: PackageSearch, 
    href: '/suppliers/alternative-sourcing' 
  },
];

export default function SuppliersPage() {
  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center mb-6">
        <Users className="h-8 w-8 mr-3" />
        <h1 className="text-3xl font-bold">Suppliers</h1>
      </div>
      
      <p className="text-muted-foreground mb-8">
        Manage your supplier network, assess risks, and find alternative sourcing options during disruptions.
      </p>
      
      <div className="grid gap-6 md:grid-cols-2">
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