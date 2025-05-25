import React from 'react';
import Link from 'next/link';
import { Cpu, BarChart3, GitFork, BotIcon, Network, Route, Truck } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const modules = [
  { 
    title: 'Demand Forecaster', 
    description: 'Use AI to predict market demand and anticipate shortages', 
    icon: BarChart3, 
    href: '/operations/demand-forecaster' 
  },
  { 
    title: 'Auto-Replanning', 
    description: 'Automatically generate alternative production plans during disruptions', 
    icon: GitFork, 
    href: '/operations/auto-replanning' 
  },
  { 
    title: 'Robot Task Queues', 
    description: 'Manage and prioritize tasks for robotic automation systems', 
    icon: BotIcon, 
    href: '/operations/robot-tasks' 
  },
  { 
    title: 'IoT Network', 
    description: 'Monitor your factory IoT network and connected devices', 
    icon: Network, 
    href: '/operations/iot-network' 
  },
  { 
    title: 'RL Planner', 
    description: 'Reinforcement learning-based production planning (Mock)', 
    icon: Route, 
    href: '/operations/reinforcement-planner' 
  },
  { 
    title: 'Load Matching', 
    description: 'Optimize transportation routes and load matching (Mock)', 
    icon: Truck, 
    href: '/operations/load-matching' 
  },
];

export default function OperationsPage() {
  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center mb-6">
        <Cpu className="h-8 w-8 mr-3" />
        <h1 className="text-3xl font-bold">Production & Planning</h1>
      </div>
      
      <p className="text-muted-foreground mb-8">
        Optimize production processes, plan capacity, and use AI-driven forecasting to stay ahead of market demand.
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