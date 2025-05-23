'use client';

import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Line, LineChart, Pie, PieChart, ResponsiveContainer, Cell } from "recharts";
import { TrendingUp, TrendingDown, DollarSign, Clock, Truck } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const uptimeData = [
  { date: "Jan '24", actual: 99.5, simulated: 99.2 },
  { date: "Feb '24", actual: 99.1, simulated: 99.0 },
  { date: "Mar '24", actual: 99.7, simulated: 99.5 },
  { date: "Apr '24", actual: 98.9, simulated: 99.1 },
  { date: "May '24", actual: 99.6, simulated: 99.3 },
  { date: "Jun '24", actual: 99.8, simulated: 99.6 },
];

const throughputData = [
  { date: "Jan '24", actual: 1150, simulated: 1200 },
  { date: "Feb '24", actual: 1250, simulated: 1220 },
  { date: "Mar '24", actual: 1200, simulated: 1180 },
  { date: "Apr '24", actual: 1300, simulated: 1250 },
  { date: "May '24", actual: 1280, simulated: 1260 },
  { date: "Jun '24", actual: 1350, simulated: 1300 },
];

const costData = [
  { name: "Labor", value: 400000, fill: "hsl(var(--chart-1))" },
  { name: "Materials", value: 300000, fill: "hsl(var(--chart-2))" },
  { name: "Logistics", value: 250000, fill: "hsl(var(--chart-3))" },
  { name: "Overhead", value: 150000, fill: "hsl(var(--chart-4))" },
  { name: "Maintenance", value: 100000, fill: "hsl(var(--chart-5))" },
];

const chartConfig = {
  actual: { label: "Actual", color: "hsl(var(--chart-1))" },
  simulated: { label: "Simulated", color: "hsl(var(--chart-2))" },
  units: { label: "Units/hr", color: "hsl(var(--chart-3))" },
} satisfies Record<string, { label: string; color: string }>;

export default function KpiDashboardsPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="KPI Dashboards"
        description="Visualize simulated vs. actual Key Performance Indicators."
      />
      
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3 md:w-[400px]">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="cost">Cost Analysis</TabsTrigger>
        </TabsList>
        <TabsContent value="overview">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mt-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Uptime (Actual)</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">99.62%</div>
                <p className="text-xs text-muted-foreground">+0.3% vs Simulated Avg.</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg. Throughput (Actual)</CardTitle>
                <Truck className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">1255 units/hr</div>
                <p className="text-xs text-muted-foreground">+25 units/hr vs Simulated</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Operational Cost</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$1.2M</div>
                <p className="text-xs text-muted-foreground">-5% vs Last Quarter</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg. Delay Time</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">2.5 hrs</div>
                <p className="text-xs text-muted-foreground text-red-500">+0.5 hrs vs Target</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="performance">
           <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2 mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Production Line Uptime (%)</CardTitle>
                <CardDescription>Comparison of actual vs. simulated uptime over the last 6 months.</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[300px] w-full">
                  <LineChart data={uptimeData} margin={{ top: 5, right: 20, left: -15, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} />
                    <YAxis domain={[98, 100]} tickLine={false} axisLine={false} tickMargin={8} unit="%" />
                    <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
                    <ChartLegend content={<ChartLegendContent />} />
                    <Line type="monotone" dataKey="actual" stroke="var(--color-actual)" strokeWidth={2} dot={true} />
                    <Line type="monotone" dataKey="simulated" stroke="var(--color-simulated)" strokeWidth={2} dot={true} />
                  </LineChart>
                </ChartContainer>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Production Throughput (units/hr)</CardTitle>
                <CardDescription>Comparison of actual vs. simulated throughput over the last 6 months.</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[300px] w-full">
                  <BarChart data={throughputData} margin={{ top: 5, right: 20, left: -25, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} />
                    <YAxis tickLine={false} axisLine={false} tickMargin={8} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <ChartLegend content={<ChartLegendContent />} />
                    <Bar dataKey="actual" fill="var(--color-actual)" radius={4} />
                    <Bar dataKey="simulated" fill="var(--color-simulated)" radius={4} />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="cost">
          <Card className="mt-4">
            <CardHeader>
              <CardTitle>Operational Cost Breakdown</CardTitle>
              <CardDescription>Distribution of costs for the current quarter.</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-center">
              <ChartContainer config={chartConfig} className="h-[350px] w-full max-w-lg">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <ChartTooltip content={<ChartTooltipContent nameKey="name" hideLabel />} />
                    <Pie data={costData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={120} label>
                       {costData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <ChartLegend content={<ChartLegendContent nameKey="name" />} className="mt-4" />
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
