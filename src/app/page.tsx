
'use client';

import Link from 'next/link';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, BarChart3, Ship, Users, Warehouse, AlertTriangle, PackageSearch, Bot } from 'lucide-react';
import Image from 'next/image';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from "recharts"

const chartData = [
  { month: "January", desktop: 186, mobile: 80 },
  { month: "February", desktop: 305, mobile: 200 },
  { month: "March", desktop: 237, mobile: 120 },
  { month: "April", desktop: 73, mobile: 190 },
  { month: "May", desktop: 209, mobile: 130 },
  { month: "June", desktop: 214, mobile: 140 },
];

const chartConfig = {
  desktop: {
    label: "Actual",
    color: "hsl(var(--chart-1))",
  },
  mobile: {
    label: "Simulated",
    color: "hsl(var(--chart-2))",
  },
} satisfies Record<string, { label: string; color: string }>;


const kpiData = [
  { title: "Overall Uptime", value: "99.8%", trend: "+0.5%", trendColor: "text-green-600" },
  { title: "Average Throughput", value: "1,250 units/hr", trend: "-2.1%", trendColor: "text-red-600" },
  { title: "Total Operational Cost", value: "$1.2M", trend: "+1.0%", trendColor: "text-red-600" },
  { title: "Shipment Delay Rate", value: "3.5%", trend: "+0.2%", trendColor: "text-red-600" },
];

const featureCards = [
  { title: "Risk Heatmap", description: "Real-time view of shipment risks.", icon: Ship, href: "/shipments/risk-heatmap", hint: "logistics map" },
  { title: "Supplier Scorecards", description: "Live risk scores for suppliers.", icon: Users, href: "/suppliers/vitality-scorecards", hint: "supplier dashboard" },
  { title: "Inventory Stress", description: "Forecast stock-outs and time-to-empty.", icon: Warehouse, href: "/inventory/stress-indicators", hint: "warehouse inventory" },
  { title: "Demand Forecaster", description: "Predict semiconductor shortages.", icon: BarChart3, href: "/operations/demand-forecaster", hint: "market trends" },
  { title: "Alternative Sourcing", description: "Find and rank alternative suppliers.", icon: PackageSearch, href: "/suppliers/alternative-sourcing", hint: "sourcing strategy" },
  { title: "Chat-Ops Bot", description: "Query shipment risks and delays.", icon: Bot, href: "/communication/chat-ops", hint: "chat interface" },
];

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Dashboard"
      />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {kpiData.map((kpi) => (
          <Card key={kpi.title} className="shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{kpi.title}</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kpi.value}</div>
              <p className={`text-xs ${kpi.trendColor} mt-1`}>{kpi.trend} from last month</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 shadow-lg">
          <CardHeader>
            <CardTitle>KPI Performance: Actual vs. Simulated</CardTitle>
            <CardDescription>Monthly comparison of key performance indicators.</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
                  <YAxis tickLine={false} axisLine={false} tickMargin={8} />
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent indicator="dot" />}
                  />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Bar dataKey="desktop" fill="var(--color-desktop)" radius={4} />
                  <Bar dataKey="mobile" fill="var(--color-mobile)" radius={4} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
        
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Logistics Overview</CardTitle>
            <CardDescription>Snapshot of current logistics operations.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center">
            <Image 
              src="https://firebasestorage.googleapis.com/v0/b/project-id.appspot.com/o/67e801a0-c0c6-428e-854a-dc640ca66f7e.png?alt=media&token=f4570346-614d-47a5-82b3-0873f9ed6652" 
              alt="Logistics Map Overview" 
              width={600} 
              height={400} 
              className="rounded-md object-cover"
            />
            <p className="mt-4 text-sm text-muted-foreground">
              Interactive 3D map of ongoing shipments.
            </p>
            <Button variant="outline" className="mt-4">View Live Map</Button>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Key Features</CardTitle>
          <CardDescription>Explore the core functionalities of Tashkent Vision.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {featureCards.map((feature) => (
            <Link href={feature.href} key={feature.title} legacyBehavior>
              <a className="block hover:no-underline">
                <Card className="h-full hover:border-primary transition-colors duration-200 flex flex-col">
                  <CardHeader className="flex flex-row items-start gap-4 space-y-0">
                    <div className="rounded-lg bg-primary p-3 text-primary-foreground">
                      <feature.icon className="h-6 w-6" />
                    </div>
                    <div>
                      <CardTitle>{feature.title}</CardTitle>
                      <CardDescription className="mt-1 line-clamp-2">{feature.description}</CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent className="mt-auto flex justify-end">
                     <Button variant="ghost" size="sm">
                       Explore <ArrowRight className="ml-2 h-4 w-4" />
                     </Button>
                  </CardContent>
                </Card>
              </a>
            </Link>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

