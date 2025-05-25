import React from 'react';
import Link from 'next/link';
import { SlidersHorizontal, DatabaseZap, TestTube2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const modules = [
  { 
    title: 'Data Drift Detection', 
    description: 'Automatically detect and alert on changes in data distributions', 
    icon: DatabaseZap, 
    href: '/ai-models/data-drift' 
  },
  { 
    title: 'A/B Experiments', 
    description: 'Run and analyze experiments to improve supply chain operations', 
    icon: TestTube2, 
    href: '/ai-models/ab-experiments' 
  },
];

export default function AIModelsPage() {
  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center mb-6">
        <SlidersHorizontal className="h-8 w-8 mr-3" />
        <h1 className="text-3xl font-bold">AI Models</h1>
      </div>
      
      <p className="text-muted-foreground mb-8">
        Manage and monitor AI models deployed across your supply chain. Track model performance, detect data drift, and run experiments.
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