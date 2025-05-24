
'use client';

import { useState, type FormEvent } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  Loader2, 
  Bot, 
  ListOrdered, 
  PlusCircle, 
  Trash2, 
  MapPin, 
  Package, 
  AlertTriangle,
  SlidersHorizontal,
  Timer,
  Star
} from 'lucide-react';
import { robotReadyTaskQueues, type RobotReadyTaskQueuesInput, type RobotReadyTaskQueuesOutput } from '@/ai/flows/robot-ready-task-queues';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

type ItemInput = RobotReadyTaskQueuesInput['items'][0];
type PrioritizedTask = RobotReadyTaskQueuesOutput['prioritizedTasks'][0];

const initialItem: ItemInput = { itemId: '', location: '', quantity: 1 };

export default function RobotTaskQueuesPage() {
  const [items, setItems] = useState<ItemInput[]>([
    { itemId: 'ITEM-001', location: 'Aisle 3, Shelf B, Bin 5', quantity: 10 },
    { itemId: 'ITEM-002', location: 'Aisle 1, Shelf A, Bin 2', quantity: 5 },
  ]);
  const [orderPriority, setOrderPriority] = useState<RobotReadyTaskQueuesInput['orderPriority']>('medium');
  const [robotCurrentLocation, setRobotCurrentLocation] = useState<string>('Charging Station Alpha');
  
  const [taskQueue, setTaskQueue] = useState<RobotReadyTaskQueuesOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleItemChange = (index: number, field: keyof ItemInput, value: string | number) => {
    const newItems = [...items];
    if (field === 'quantity') {
      newItems[index] = { ...newItems[index], [field]: Math.max(1, Number(value)) };
    } else {
      newItems[index] = { ...newItems[index], [field]: value };
    }
    setItems(newItems);
  };

  const handleAddItem = () => {
    setItems([...items, { ...initialItem, itemId: `ITEM-00${items.length + 1}` }]);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (items.some(item => !item.itemId || !item.location || item.quantity <= 0)) {
      toast({ title: 'Invalid Input', description: 'Please ensure all items have an ID, location, and a valid quantity.', variant: 'destructive' });
      return;
    }
    if (!robotCurrentLocation.trim()) {
        toast({ title: 'Invalid Input', description: 'Please enter the robot\'s current location.', variant: 'destructive' });
        return;
    }

    setIsLoading(true);
    setTaskQueue(null);

    try {
      const input: RobotReadyTaskQueuesInput = { items, orderPriority, robotCurrentLocation };
      const result = await robotReadyTaskQueues(input);
      setTaskQueue(result);
      toast({ title: 'Task Queue Generated', description: `${result.prioritizedTasks.length} tasks prioritized.` });
    } catch (error) {
      console.error('Error generating task queue:', error);
      toast({ title: 'Error', description: 'Failed to generate task queue. Please try again.', variant: 'destructive' });
    }
    setIsLoading(false);
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Robot-Ready Task Queues"
        description="AI-prioritized pick-and-pack instructions for warehouse robots or human pickers."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Task Input</CardTitle>
            <CardDescription>Define items to pick, order priority, and robot location.</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6 max-h-[65vh] overflow-y-auto">
              <div className="space-y-3">
                <Label className="flex items-center gap-1"><Package className="h-4 w-4 text-primary"/> Items to Pick</Label>
                {items.map((item, index) => (
                  <Card key={index} className="p-3 space-y-2 relative bg-muted/30">
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="icon" 
                      className="absolute top-1 right-1 h-6 w-6" 
                      onClick={() => handleRemoveItem(index)}
                      disabled={items.length <= 1}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                    <div className="space-y-1">
                      <Label htmlFor={`itemId-${index}`} className="text-xs">Item ID/SKU</Label>
                      <Input id={`itemId-${index}`} value={item.itemId} onChange={(e) => handleItemChange(index, 'itemId', e.target.value)} placeholder="e.g., SKU123" />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor={`location-${index}`} className="text-xs">Location</Label>
                      <Input id={`location-${index}`} value={item.location} onChange={(e) => handleItemChange(index, 'location', e.target.value)} placeholder="e.g., Aisle 5, Shelf C" />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor={`quantity-${index}`} className="text-xs">Quantity</Label>
                      <Input id={`quantity-${index}`} type="number" min="1" value={item.quantity} onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value, 10))} />
                    </div>
                  </Card>
                ))}
                <Button type="button" variant="outline" onClick={handleAddItem} className="w-full">
                  <PlusCircle className="mr-2 h-4 w-4" /> Add Another Item
                </Button>
              </div>

              <div className="space-y-2">
                <Label htmlFor="orderPriority" className="flex items-center gap-1"><AlertTriangle className="h-4 w-4 text-primary"/>Order Priority</Label>
                <Select value={orderPriority} onValueChange={(value: RobotReadyTaskQueuesInput['orderPriority']) => setOrderPriority(value)}>
                  <SelectTrigger id="orderPriority">
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="robotCurrentLocation" className="flex items-center gap-1"><MapPin className="h-4 w-4 text-primary"/>Robot Current Location</Label>
                <Input id="robotCurrentLocation" value={robotCurrentLocation} onChange={(e) => setRobotCurrentLocation(e.target.value)} placeholder="e.g., Charging Station B" />
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <SlidersHorizontal className="mr-2 h-4 w-4" />}
                Prioritize Tasks
              </Button>
            </CardFooter>
          </form>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Prioritized Task Queue</CardTitle>
            <CardDescription>Optimized picking sequence for efficiency.</CardDescription>
          </CardHeader>
          <CardContent className="min-h-[300px]">
            {isLoading && (
              <div className="flex flex-col items-center justify-center py-8">
                <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                <p className="text-muted-foreground">Generating prioritized task queue...</p>
              </div>
            )}
            {!isLoading && taskQueue && taskQueue.prioritizedTasks.length > 0 && (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order</TableHead>
                    <TableHead>Item ID</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead className="text-center">Qty</TableHead>
                    <TableHead className="text-center">Est. Travel (s)</TableHead>
                    <TableHead className="text-center">Priority Score</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {taskQueue.prioritizedTasks.map((task, index) => (
                    <TableRow key={task.itemId + index}>
                      <TableCell className="font-medium">{index + 1}</TableCell>
                      <TableCell>{task.itemId}</TableCell>
                      <TableCell>{task.location}</TableCell>
                      <TableCell className="text-center">{task.quantity}</TableCell>
                      <TableCell className="text-center flex items-center justify-center gap-1"><Timer size={14}/> {task.estimatedTravelTime.toFixed(0)}s</TableCell>
                      <TableCell className="text-center">
                        <Badge variant={task.priorityScore > 7 ? "default" : task.priorityScore > 4 ? "secondary" : "outline"} 
                               className={task.priorityScore > 7 ? "bg-green-500 hover:bg-green-600 text-white" : task.priorityScore > 4 ? "bg-yellow-400 hover:bg-yellow-500 text-black" : ""}>
                            <Star size={12} className="mr-1 fill-current"/> {task.priorityScore.toFixed(1)}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
            {!isLoading && (!taskQueue || taskQueue.prioritizedTasks.length === 0) && (
              <div className="text-center py-8 text-muted-foreground">
                <ListOrdered className="mx-auto h-16 w-16 mb-4" />
                <p className="text-lg font-medium">Ready to Optimize?</p>
                <p className="mt-1">
                  {taskQueue ? 'No tasks generated for the given input.' : 'Enter item details, priority, and robot location to generate the task queue.'}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
