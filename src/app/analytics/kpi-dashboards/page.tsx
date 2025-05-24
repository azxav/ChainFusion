
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
import { Area, AreaChart, Bar, BarChart, CartesianGrid, XAxis, YAxis, Line, LineChart, Pie, PieChart, ResponsiveContainer, Cell, Legend, Tooltip } from "recharts";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Clock, 
  Truck, 
  CheckCircle, 
  Target, 
  PackageX, 
  PackageMinus, 
  RefreshCw, 
  Warehouse, 
  Zap, 
  AlertOctagon,
  Percent,
  Briefcase,
  ClipboardList
} from 'lucide-react';
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

const otdData = [
  { date: "Jan '24", actual: 95.2, simulated: 96.0 },
  { date: "Feb '24", actual: 94.5, simulated: 95.5 },
  { date: "Mar '24", actual: 96.1, simulated: 96.5 },
  { date: "Apr '24", actual: 93.8, simulated: 95.0 },
  { date: "May '24", actual: 95.5, simulated: 96.2 },
  { date: "Jun '24", actual: 96.7, simulated: 97.0 },
];

const inventoryTurnoverData = [
  { category: "Electronics", actual: 4.5, simulated: 5.0 },
  { category: "Components", actual: 6.2, simulated: 6.0 },
  { category: "Raw Mats", actual: 3.1, simulated: 3.5 },
  { category: "Finished Goods", actual: 5.8, simulated: 5.5 },
];

const fulfillmentStatusData = [
  { name: "On Time", value: 750, fill: "hsl(var(--chart-1))" },
  { name: "Slightly Delayed", value: 150, fill: "hsl(var(--chart-2))" },
  { name: "Significantly Delayed", value: 50, fill: "hsl(var(--chart-3))" },
  { name: "Cancelled", value: 20, fill: "hsl(var(--chart-4))" },
  { name: "Partial", value: 30, fill: "hsl(var(--chart-5))" },
];

const capacityUtilizationData = [
  { date: "Jan '24", actual: 75, simulated: 80 },
  { date: "Feb '24", actual: 78, simulated: 82 },
  { date: "Mar '24", actual: 82, simulated: 85 },
  { date: "Apr '24", actual: 80, simulated: 83 },
  { date: "May '24", actual: 85, simulated: 88 },
  { date: "Jun '24", actual: 83, simulated: 86 },
];


const chartConfig = {
  actual: { label: "Actual", color: "hsl(var(--chart-1))" },
  simulated: { label: "Simulated", color: "hsl(var(--chart-2))" },
  units: { label: "Units/hr", color: "hsl(var(--chart-3))" },
  cost: { label: "Cost", color: "hsl(var(--chart-4))" },
  percentage: { label: "%", color: "hsl(var(--chart-5))" },
} satisfies Record<string, { label: string; color: string; icon?: React.ElementType }>;

const overviewKpiData = [
  { title: "Total Uptime (Actual)", value: "99.62%", trend: "+0.3% vs Simulated Avg.", icon: TrendingUp, trendColor: "text-green-500 dark:text-green-400" },
  { title: "Avg. Throughput (Actual)", value: "1255 units/hr", trend: "+25 units/hr vs Simulated", icon: Truck, trendColor: "text-green-500 dark:text-green-400" },
  { title: "Total Operational Cost", value: "$1.2M", trend: "-5% vs Last Quarter", icon: DollarSign, trendColor: "text-green-500 dark:text-green-400" },
  { title: "Avg. Delay Time", value: "2.5 hrs", trend: "+0.5 hrs vs Target", icon: Clock, trendColor: "text-red-500 dark:text-red-400" },
];

const logisticsKpiData = [
  { title: "On-Time Delivery (OTD)", value: "95.8%", trend: "-0.5% vs Simulated", icon: CheckCircle, trendColor: "text-red-500 dark:text-red-400" },
  { title: "Order Accuracy", value: "99.2%", trend: "+0.1% vs Simulated", icon: Target, trendColor: "text-green-500 dark:text-green-400" },
  { title: "Avg. Freight Cost/Unit", value: "$12.50", trend: "+$0.75 vs Simulated", icon: PackageX, trendColor: "text-red-500 dark:text-red-400" },
  { title: "Return Rate", value: "1.8%", trend: "-0.2% vs Last Period", icon: PackageMinus, trendColor: "text-green-500 dark:text-green-400" },
];

const efficiencyKpiData = [
  { title: "Inventory Turnover", value: "5.2", trend: "+0.4 vs Simulated", icon: RefreshCw, trendColor: "text-green-500 dark:text-green-400" },
  { title: "Warehouse Capacity Util.", value: "85%", trend: "+3% vs Target", icon: Warehouse, trendColor: "text-green-500 dark:text-green-400" },
  { title: "Production Cycle Time (Avg.)", value: "4.2 days", trend: "-0.3 days vs Simulated", icon: Zap, trendColor: "text-green-500 dark:text-green-400" },
  { title: "Supplier Defect Rate", value: "0.75%", trend: "+0.1% vs Benchmark", icon: AlertOctagon, trendColor: "text-red-500 dark:text-red-400" },
];

interface KpiCardProps {
  title: string;
  value: string;
  trend: string;
  icon: React.ElementType;
  trendColor: string;
}

const KpiCard: React.FC<KpiCardProps> = ({ title, value, trend, icon: Icon, trendColor }) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <Icon className="h-4 w-4 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      <p className={`text-xs ${trendColor}`}>{trend}</p>
    </CardContent>
  </Card>
);


export default function KpiDashboardsPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="KPI Dashboards"
        description="Visualize simulated vs. actual Key Performance Indicators across the supply chain."
      />
      
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4">
          <TabsTrigger value="overview">Overview KPIs</TabsTrigger>
          <TabsTrigger value="operational">Operational</TabsTrigger>
          <TabsTrigger value="financial">Financial & Efficiency</TabsTrigger>
          <TabsTrigger value="logistics">Logistics & Fulfillment</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 mt-4">
            {overviewKpiData.map(kpi => <KpiCard key={kpi.title} {...kpi} />)}
          </div>
        </TabsContent>

        <TabsContent value="operational">
           <div className="grid gap-4 md:gap-6 md:grid-cols-1 lg:grid-cols-2 mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><TrendingUp className="h-5 w-5 text-primary"/> Production Line Uptime (%)</CardTitle>
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
                    <Line type="monotone" dataKey="actual" stroke="var(--color-actual)" strokeWidth={2} dot={{ r: 4 }} />
                    <Line type="monotone" dataKey="simulated" stroke="var(--color-simulated)" strokeWidth={2} dot={{ r: 4 }} />
                  </LineChart>
                </ChartContainer>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Truck className="h-5 w-5 text-primary"/> Production Throughput (units/hr)</CardTitle>
                <CardDescription>Comparison of actual vs. simulated throughput over the last 6 months.</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[300px] w-full">
                  <BarChart data={throughputData} margin={{ top: 5, right: 20, left: -25, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} />
                    <YAxis tickLine={false} axisLine={false} tickMargin={8} unit=" u" />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <ChartLegend content={<ChartLegendContent />} />
                    <Bar dataKey="actual" fill="var(--color-actual)" radius={4} />
                    <Bar dataKey="simulated" fill="var(--color-simulated)" radius={4} />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>
            <Card className="lg:col-span-2"> 
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Percent className="h-5 w-5 text-primary"/> Capacity Utilization (%)</CardTitle>
                <CardDescription>Monthly actual vs. simulated production capacity utilization.</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[300px] w-full">
                  <AreaChart data={capacityUtilizationData} margin={{ top: 5, right: 20, left: -15, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false}/>
                    <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} />
                    <YAxis unit="%" tickLine={false} axisLine={false} tickMargin={8}/>
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <ChartLegend content={<ChartLegendContent />} />
                    <Area type="monotone" dataKey="actual" stackId="1" stroke="var(--color-actual)" fill="var(--color-actual)" fillOpacity={0.6} />
                    <Area type="monotone" dataKey="simulated" stackId="2" stroke="var(--color-simulated)" fill="var(--color-simulated)" fillOpacity={0.4}/>
                  </AreaChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="financial">
          <div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 mt-4">
            {efficiencyKpiData.map(kpi => <KpiCard key={kpi.title} {...kpi} />)}
          </div>
          <div className="grid gap-4 md:gap-6 md:grid-cols-1 lg:grid-cols-2 mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><DollarSign className="h-5 w-5 text-primary"/>Operational Cost Breakdown</CardTitle>
                <CardDescription>Distribution of costs for the current quarter.</CardDescription>
              </CardHeader>
              <CardContent className="flex items-center justify-center">
                <ChartContainer config={chartConfig} className="h-[350px] w-full max-w-lg">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <ChartTooltip content={<ChartTooltipContent nameKey="name" hideLabel />} />
                      <Pie data={costData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} labelLine={false} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
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
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><RefreshCw className="h-5 w-5 text-primary"/>Inventory Turnover by Category</CardTitle>
                <CardDescription>Actual vs. simulated inventory turnover ratios.</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[350px] w-full">
                  <BarChart data={inventoryTurnoverData} layout="vertical" margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false}/>
                    <XAxis type="number" tickLine={false} axisLine={false} tickMargin={8} />
                    <YAxis dataKey="category" type="category" tickLine={false} axisLine={false} tickMargin={8} width={100} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <ChartLegend content={<ChartLegendContent />} />
                    <Bar dataKey="actual" fill="var(--color-actual)" radius={4} name="Actual Turnover" />
                    <Bar dataKey="simulated" fill="var(--color-simulated)" radius={4} name="Simulated Turnover" />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="logistics">
          <div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 mt-4">
            {logisticsKpiData.map(kpi => <KpiCard key={kpi.title} {...kpi} />)}
          </div>
           <div className="grid gap-4 md:gap-6 md:grid-cols-1 lg:grid-cols-2 mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><CheckCircle className="h-5 w-5 text-primary"/>On-Time Delivery (OTD) Rate (%)</CardTitle>
                <CardDescription>Monthly actual vs. simulated OTD performance.</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[300px] w-full">
                  <LineChart data={otdData} margin={{ top: 5, right: 20, left: -15, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} />
                    <YAxis domain={[90, 100]} unit="%" tickLine={false} axisLine={false} tickMargin={8}/>
                    <ChartTooltip content={<ChartTooltipContent indicator="line"/>} />
                    <ChartLegend content={<ChartLegendContent />} />
                    <Line type="monotone" dataKey="actual" stroke="var(--color-actual)" strokeWidth={2} dot={{ r: 4 }} />
                    <Line type="monotone" dataKey="simulated" stroke="var(--color-simulated)" strokeWidth={2} dot={{ r: 4 }} />
                  </LineChart>
                </ChartContainer>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><ClipboardList className="h-5 w-5 text-primary"/>Order Fulfillment Status (Last 1000 Orders)</CardTitle>
                <CardDescription>Breakdown of recent order fulfillment outcomes.</CardDescription>
              </CardHeader>
              <CardContent className="flex items-center justify-center">
                 <ChartContainer config={chartConfig} className="h-[300px] w-full max-w-md">
                   <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <ChartTooltip content={<ChartTooltipContent nameKey="name" hideLabel />} />
                        <Pie data={fulfillmentStatusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} labelLine={false} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                          {fulfillmentStatusData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                          ))}
                        </Pie>
                        <ChartLegend content={<ChartLegendContent nameKey="name"/>} className="mt-2"/>
                      </PieChart>
                    </ResponsiveContainer>
                 </ChartContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
