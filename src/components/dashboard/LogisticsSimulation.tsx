import React, { useState, useEffect, useRef } from 'react';
import { Truck, MapPin, AlertTriangle, CheckCircle, Navigation, Clock, Sun, Cloud, CloudRain, BarChart4, FileCheck, RefreshCw, AlertCircle, ChevronRight, FileWarning, Activity, Brain, AlertOctagon, Zap, Share2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

type WeatherCondition = 'sunny' | 'cloudy' | 'rainy';
type TrafficCondition = 'smooth' | 'moderate' | 'jam';
type TruckStatus = 'on-time' | 'delayed' | 'cautious' | 'rerouted';
type SimulationScenario = 'supplier-delay' | 'traffic-jam' | 'document-issue';

interface RoutePoint {
  name: string;
  x: number;
  y: number;
  isCheckpoint: boolean;
}

interface TruckRoute {
  id: string;
  color: string;
  points: RoutePoint[];
  pathString: string;
  pathCoordinates: {x: number, y: number}[];
}

interface TruckData {
  id: string;
  name: string;
  initial: string;
  checkpoints: string[];
  destination: string;
  status: TruckStatus;
  progress: number;
  position: { x: number; y: number };
  eta: string;
  isAffected?: boolean;
  routeId: string;
  currentSegment: number;
}

interface AgentMessage {
  agent: string;
  message: string;
  type: 'info' | 'warning' | 'recommendation' | 'success';
}

interface AgentActivity {
  id: string;
  agent: string;
  action: string;
  status: 'idle' | 'working' | 'completed' | 'waiting';
  startTime: number;
  completionTime?: number;
  icon: React.ReactNode;
}

// Define all locations with their coordinates
const locations: Record<string, {x: number, y: number}> = {
  'Origin 1': { x: 5, y: 70 },
  'Origin 2': { x: 15, y: 83 },
  'Origin 3': { x: 10, y: 90 },
  'Central Hub': { x: 50, y: 55 },
  'Destination 1': { x: 70, y: 90 },
  'Destination 2': { x: 80, y: 25 },
  'Checkpoint E': { x: 20, y: 75 },
  'Checkpoint F': { x: 60, y: 70 },
  'Checkpoint A': { x: 25, y: 60 },
  'Checkpoint B': { x: 65, y: 40 },
  'Checkpoint C': { x: 40, y: 80 },
  'Checkpoint D': { x: 35, y: 40 },
};

// Helper function to generate bezier curve points
const generatePathCoordinates = (points: RoutePoint[], numPoints = 100): {x: number, y: number}[] => {
  const coordinates: {x: number, y: number}[] = [];
  
  if (points.length < 2) return coordinates;

  // For each segment, generate intermediate points along the bezier curve
  for (let i = 0; i < points.length - 1; i++) {
    const startPoint = points[i];
    const endPoint = points[i + 1];
    const midX = (startPoint.x + endPoint.x) / 2;
    
    // Generate points along this segment
    const segmentPoints = numPoints / (points.length - 1);
    
    for (let j = 0; j <= segmentPoints; j++) {
      const t = j / segmentPoints;
      
      // Quadratic bezier curve formula for x and y
      // P = (1-t)²P₁ + 2(1-t)tP₂ + t²P₃
      // We're using P₂ as the control point (midX, startPoint.y)
      const oneMinusT = 1 - t;
      const x = (oneMinusT * oneMinusT * startPoint.x) + 
                (2 * oneMinusT * t * midX) + 
                (t * t * endPoint.x);
      
      const y = (oneMinusT * oneMinusT * startPoint.y) + 
                (2 * oneMinusT * t * startPoint.y) + 
                (t * t * endPoint.y);
                
      coordinates.push({ x, y });
    }
  }
  
  return coordinates;
};

// Define routes with waypoints
const routes: TruckRoute[] = [
  {
    id: 'R001',
    color: '#3B82F6', // blue
    points: [
      { name: 'Origin 1', x: locations['Origin 1'].x, y: locations['Origin 1'].y, isCheckpoint: false },
      { name: 'Checkpoint A', x: locations['Checkpoint A'].x, y: locations['Checkpoint A'].y, isCheckpoint: true },
      { name: 'Central Hub', x: locations['Central Hub'].x, y: locations['Central Hub'].y, isCheckpoint: true },
      { name: 'Checkpoint B', x: locations['Checkpoint B'].x, y: locations['Checkpoint B'].y, isCheckpoint: true },
      { name: 'Destination 2', x: locations['Destination 2'].x, y: locations['Destination 2'].y, isCheckpoint: false }
    ],
    pathString: '',
    pathCoordinates: []
  },
  {
    id: 'R002',
    color: '#EF4444', // red
    points: [
      { name: 'Origin 2', x: locations['Origin 2'].x, y: locations['Origin 2'].y, isCheckpoint: false },
      { name: 'Checkpoint E', x: locations['Checkpoint E'].x, y: locations['Checkpoint E'].y, isCheckpoint: true },
      { name: 'Central Hub', x: locations['Central Hub'].x, y: locations['Central Hub'].y, isCheckpoint: false }
    ],
    pathString: '',
    pathCoordinates: []
  },
  {
    id: 'R003',
    color: '#10B981', // green
    points: [
      { name: 'Central Hub', x: locations['Central Hub'].x, y: locations['Central Hub'].y, isCheckpoint: false },
      { name: 'Checkpoint F', x: locations['Checkpoint F'].x, y: locations['Checkpoint F'].y, isCheckpoint: true },
      { name: 'Destination 1', x: locations['Destination 1'].x, y: locations['Destination 1'].y, isCheckpoint: false }
    ],
    pathString: '',
    pathCoordinates: []
  },
  {
    id: 'R004',
    color: '#F59E0B', // amber
    points: [
      { name: 'Origin 3', x: locations['Origin 3'].x, y: locations['Origin 3'].y, isCheckpoint: false },
      { name: 'Checkpoint C', x: locations['Checkpoint C'].x, y: locations['Checkpoint C'].y, isCheckpoint: true },
      { name: 'Central Hub', x: locations['Central Hub'].x, y: locations['Central Hub'].y, isCheckpoint: false }
    ],
    pathString: '',
    pathCoordinates: []
  },
  {
    id: 'R005',
    color: '#8B5CF6', // purple
    points: [
      { name: 'Central Hub', x: locations['Central Hub'].x, y: locations['Central Hub'].y, isCheckpoint: false },
      { name: 'Checkpoint D', x: locations['Checkpoint D'].x, y: locations['Checkpoint D'].y, isCheckpoint: true },
      { name: 'Checkpoint B', x: locations['Checkpoint B'].x, y: locations['Checkpoint B'].y, isCheckpoint: true },
      { name: 'Destination 2', x: locations['Destination 2'].x, y: locations['Destination 2'].y, isCheckpoint: false }
    ],
    pathString: '',
    pathCoordinates: []
  },
];

// Generate SVG path strings and path coordinates for each route
routes.forEach(route => {
  const points = route.points;
  
  // Generate SVG path string - Fix the y-coordinate scaling to make it responsive
  let pathString = `M ${points[0].x} ${points[0].y}`;
  
  for (let i = 1; i < points.length; i++) {
    const prevPoint = points[i-1];
    const currentPoint = points[i];
    const midX = (prevPoint.x + currentPoint.x) / 2;
    
    pathString += ` Q ${midX} ${prevPoint.y} ${currentPoint.x} ${currentPoint.y}`;
  }
  
  route.pathString = pathString;
  
  // Generate path coordinates for animation
  route.pathCoordinates = generatePathCoordinates(points);
});

const LogisticsSimulation: React.FC = () => {
  const [weather, setWeather] = useState<WeatherCondition>('sunny');
  const [traffic, setTraffic] = useState<TrafficCondition>('smooth');
  const [currentLocation, setCurrentLocation] = useState<string>('Central Hub');
  const [trucks, setTrucks] = useState<TruckData[]>([
    { 
      id: 'T001', 
      name: 'Truck 1', 
      initial: 'Origin 1', 
      checkpoints: ['Checkpoint A', 'Central Hub', 'Checkpoint B'],
      destination: 'Destination 2', 
      status: 'on-time', 
      progress: 0, 
      position: { x: locations['Origin 1'].x, y: locations['Origin 1'].y }, 
      eta: '45 min',
      routeId: 'R001',
      currentSegment: 0
    },
    { 
      id: 'T002', 
      name: 'Truck 2', 
      initial: 'Origin 2', 
      checkpoints: ['Checkpoint E'],
      destination: 'Central Hub', 
      status: 'on-time', 
      progress: 0, 
      position: { x: locations['Origin 2'].x, y: locations['Origin 2'].y }, 
      eta: '30 min',
      routeId: 'R002',
      currentSegment: 0
    },
    { 
      id: 'T003', 
      name: 'Truck 3', 
      initial: 'Central Hub', 
      checkpoints: ['Checkpoint F'],
      destination: 'Destination 1', 
      status: 'on-time', 
      progress: 0, 
      position: { x: locations['Central Hub'].x, y: locations['Central Hub'].y }, 
      eta: '75 min',
      routeId: 'R003',
      currentSegment: 0
    },
    { 
      id: 'T004', 
      name: 'Truck 4', 
      initial: 'Origin 3', 
      checkpoints: ['Checkpoint C'],
      destination: 'Central Hub', 
      status: 'on-time', 
      progress: 0, 
      position: { x: locations['Origin 3'].x, y: locations['Origin 3'].y }, 
      eta: '55 min',
      routeId: 'R004',
      currentSegment: 0
    },
    { 
      id: 'T005', 
      name: 'Truck 5', 
      initial: 'Central Hub', 
      checkpoints: ['Checkpoint D', 'Checkpoint B'],
      destination: 'Destination 2', 
      status: 'on-time', 
      progress: 0, 
      position: { x: locations['Central Hub'].x, y: locations['Central Hub'].y }, 
      eta: '15 min',
      routeId: 'R005',
      currentSegment: 0
    },
  ]);
  const [agentMessages, setAgentMessages] = useState<AgentMessage[]>([]);
  const [showRecommendation, setShowRecommendation] = useState<boolean>(false);
  const [currentScenario, setCurrentScenario] = useState<SimulationScenario>('supplier-delay');
  const [simulationCompleted, setSimulationCompleted] = useState<boolean>(false);
  const [kpiData, setKpiData] = useState({
    delaysPrevented: 0,
    timeSaved: 0,
    costSaved: 0,
    slaImprovement: 0,
    activeAgents: 0
  });
  const [agentThinking, setAgentThinking] = useState<boolean>(false);
  const [agentThinkingMessage, setAgentThinkingMessage] = useState<string>('');
  const [documentIssue, setDocumentIssue] = useState<boolean>(false);
  const [documentFixed, setDocumentFixed] = useState<boolean>(false);
  const [agentActivities, setAgentActivities] = useState<AgentActivity[]>([]);
  const [activeAgents, setActiveAgents] = useState<string[]>([]);

  const routeRef = useRef<HTMLDivElement>(null);
  const simulationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Improved position calculation along the actual path
  const calculatePositionAlongPath = (truck: TruckData) => {
    const route = routes.find(r => r.id === truck.routeId);
    if (!route || route.pathCoordinates.length === 0) return truck.position;

    // Calculate total path length and segment lengths
    const segmentLengths: number[] = [];
    let totalLength = 0;
    
    for (let i = 0; i < route.points.length - 1; i++) {
      const numPointsInSegment = route.pathCoordinates.length / (route.points.length - 1);
      const segmentStart = Math.floor(i * numPointsInSegment);
      const segmentEnd = Math.floor((i + 1) * numPointsInSegment);
      
      segmentLengths.push(segmentEnd - segmentStart);
      totalLength += segmentEnd - segmentStart;
    }
    
    // Find the segment the truck is in
    let currentSegment = truck.currentSegment;
    let progressWithinSegment = truck.progress;
    
    // Get the position from the precomputed path coordinates
    const segmentLength = segmentLengths[currentSegment] || 1;
    const segmentStart = currentSegment > 0 
      ? segmentLengths.slice(0, currentSegment).reduce((a, b) => a + b, 0) 
      : 0;
    
    // Calculate index in the pathCoordinates array
    const index = Math.min(
      Math.floor(segmentStart + (progressWithinSegment / 100) * segmentLength),
      route.pathCoordinates.length - 1
    );
    
    return route.pathCoordinates[index];
  };

  // Clear existing simulation and reset state
  const resetSimulation = () => {
    if (simulationTimeoutRef.current) {
      clearTimeout(simulationTimeoutRef.current);
    }
    
    setAgentMessages([]);
    setShowRecommendation(false);
    setSimulationCompleted(false);
    setDocumentIssue(false);
    setDocumentFixed(false);
    
    setAgentActivities([]);
    setActiveAgents([]);
    
    // Reset all trucks to original state
    setTrucks(prevTrucks => prevTrucks.map(truck => ({
      ...truck,
      status: 'on-time',
      isAffected: false,
      progress: 0,
      currentSegment: 0,
      position: { 
        x: locations[truck.initial].x, 
        y: locations[truck.initial].y 
      },
      eta: truck.id === 'T001' ? '45 min' : 
           truck.id === 'T002' ? '30 min' : 
           truck.id === 'T003' ? '75 min' : 
           truck.id === 'T004' ? '55 min' : '15 min'
    })));
  };

  // Handle scenario selection
  const handleScenarioChange = (scenario: SimulationScenario) => {
    resetSimulation();
    setCurrentScenario(scenario);
    
    // Immediately start the agent workflow for the selected scenario
    startScenarioWorkflow(scenario);
  };

  // Start the agent workflow based on the selected scenario
  const startScenarioWorkflow = (scenario: SimulationScenario) => {
    const now = Date.now();
    
    switch (scenario) {
      case 'supplier-delay':
        // Set initial agent activities
        setAgentActivities([
          {
            id: 'sd-1',
            agent: 'Supplier Monitoring Agent',
            action: 'Monitoring supplier loading schedule',
            status: 'working',
            startTime: now,
            icon: <AlertOctagon className="w-4 h-4 text-blue-500" />
          },
          {
            id: 'sd-2',
            agent: 'Logistics Agent',
            action: 'Tracking shipment readiness',
            status: 'working',
            startTime: now + 100,
            icon: <Activity className="w-4 h-4 text-green-500" />
          }
        ]);
        setActiveAgents(['Supplier Monitoring Agent', 'Logistics Agent']);
        
        // Immediately trigger the delay
        setTimeout(() => {
          // Update agent activity
          setAgentActivities(prev => {
            const updated = [...prev];
            const monitoringIndex = updated.findIndex(a => a.id === 'sd-1');
            if (monitoringIndex >= 0) {
              updated[monitoringIndex] = {
                ...updated[monitoringIndex],
                action: 'Detected loading delay at Origin 2',
                status: 'completed',
                completionTime: Date.now()
              };
            }
            
            // Add new agent activities
            return [
              ...updated,
              {
                id: 'sd-3',
                agent: 'Risk Assessment Agent',
                action: 'Calculating impact on delivery timeline',
                status: 'working',
                startTime: Date.now(),
                icon: <Brain className="w-4 h-4 text-purple-500" />
              }
            ];
          });
          
          setActiveAgents(prev => [...prev, 'Risk Assessment Agent']);
          
          // Trigger the truck delay and warning
          setTrucks(prevTrucks => {
            const updatedTrucks = [...prevTrucks];
            updatedTrucks[1] = { 
              ...updatedTrucks[1], 
              status: 'delayed', 
              isAffected: true, 
              eta: '65 min' 
            };
            return updatedTrucks;
          });

          // Add agent warning message
          setAgentMessages([
            {
              agent: 'Supplier Monitoring Agent',
              message: '⚠️ Supplier at Origin 2 failed to load shipment on time. Truck T002 delayed at origin.',
              type: 'warning',
            }
          ]);
          setShowRecommendation(true);
          
          // Update agent activities again after a moment
          setTimeout(() => {
            setAgentActivities(prev => {
              const updated = [...prev];
              const riskIndex = updated.findIndex(a => a.id === 'sd-3');
              if (riskIndex >= 0) {
                updated[riskIndex] = {
                  ...updated[riskIndex],
                  action: 'Impact analysis complete: 4h delay predicted',
                  status: 'completed',
                  completionTime: Date.now()
                };
              }
              
              return [
                ...updated,
                {
                  id: 'sd-4',
                  agent: 'Strategy Agent',
                  action: 'Evaluating rerouting options',
                  status: 'working',
                  startTime: Date.now(),
                  icon: <Share2 className="w-4 h-4 text-amber-500" />
                }
              ];
            });
            
            setActiveAgents(prev => [...prev, 'Strategy Agent']);
          }, 2000);
        }, 2000);
        break;
        
      case 'traffic-jam':
        // Set initial agent activities
        setAgentActivities([
          {
            id: 'tj-1',
            agent: 'GPS Monitoring Agent',
            action: 'Tracking real-time vehicle positions',
            status: 'working',
            startTime: now,
            icon: <Navigation className="w-4 h-4 text-green-500" />
          },
          {
            id: 'tj-2',
            agent: 'Traffic Analysis Agent',
            action: 'Monitoring traffic conditions',
            status: 'working',
            startTime: now + 100,
            icon: <Activity className="w-4 h-4 text-blue-500" />
          }
        ]);
        setActiveAgents(['GPS Monitoring Agent', 'Traffic Analysis Agent']);
        
        // Start traffic jam scenario after a brief delay
        setTimeout(() => {
          // Focus on Truck 1 and progress it a bit
          setTrucks(prevTrucks => {
            const updatedTrucks = [...prevTrucks];
            // Move truck 1 along the route
            updatedTrucks[0] = {
              ...updatedTrucks[0],
              currentSegment: 1,
              progress: 30,
              position: calculatePositionAlongPath({
                ...updatedTrucks[0],
                currentSegment: 1,
                progress: 30
              })
            };
            return updatedTrucks;
          });
          
          // After truck moves along, trigger the traffic jam
          setTimeout(() => {
            // Update agent activities
            setAgentActivities(prev => {
              const updated = [...prev];
              const trafficIndex = updated.findIndex(a => a.id === 'tj-2');
              if (trafficIndex >= 0) {
                updated[trafficIndex] = {
                  ...updated[trafficIndex],
                  action: 'Detected severe traffic jam on Route A',
                  status: 'completed',
                  completionTime: Date.now()
                };
              }
              
              return [
                ...updated,
                {
                  id: 'tj-3',
                  agent: 'Risk Detection Agent',
                  action: 'Calculating delay impact',
                  status: 'working',
                  startTime: Date.now(),
                  icon: <AlertOctagon className="w-4 h-4 text-red-500" />
                }
              ];
            });
            
            setActiveAgents(prev => [...prev, 'Risk Detection Agent']);
            
            // Update traffic and truck status
            setTraffic('jam');
            setTrucks(prevTrucks => {
              const updatedTrucks = [...prevTrucks];
              updatedTrucks[0] = { 
                ...updatedTrucks[0], 
                status: 'delayed', 
                isAffected: true, 
                eta: '120 min' 
              };
              return updatedTrucks;
            });
            
            // Add agent message
            setAgentMessages([
              {
                agent: 'Risk Detection Agent',
                message: '🚧 Detected traffic jam near Route A — expected delay: 2.5h.',
                type: 'warning',
              }
            ]);
            setShowRecommendation(true);
            
            // After a moment, update agent activities again
            setTimeout(() => {
              setAgentActivities(prev => {
                const updated = [...prev];
                const riskIndex = updated.findIndex(a => a.id === 'tj-3');
                if (riskIndex >= 0) {
                  updated[riskIndex] = {
                    ...updated[riskIndex],
                    action: 'Delay impact analysis complete',
                    status: 'completed',
                    completionTime: Date.now()
                  };
                }
                
                return [
                  ...updated,
                  {
                    id: 'tj-4',
                    agent: 'Strategy Agent',
                    action: 'Analyzing alternative routes',
                    status: 'working',
                    startTime: Date.now(),
                    icon: <Brain className="w-4 h-4 text-purple-500" />
                  }
                ];
              });
              
              setActiveAgents(prev => [...prev, 'Strategy Agent']);
            }, 2000);
          }, 1000);
        }, 1000);
        break;
        
      case 'document-issue':
        // Set initial agent activities
        setAgentActivities([
          {
            id: 'di-1',
            agent: 'Document Intelligence Agent',
            action: 'Scanning shipment documentation',
            status: 'working',
            startTime: now,
            icon: <FileCheck className="w-4 h-4 text-blue-500" />
          },
          {
            id: 'di-2',
            agent: 'Compliance Agent',
            action: 'Monitoring regulatory requirements',
            status: 'working',
            startTime: now + 100,
            icon: <AlertOctagon className="w-4 h-4 text-amber-500" />
          }
        ]);
        setActiveAgents(['Document Intelligence Agent', 'Compliance Agent']);
        
        // Start document issue scenario
        setTimeout(() => {
          // Focus on Truck 3 and progress it
          setTrucks(prevTrucks => {
            const updatedTrucks = [...prevTrucks];
            // Move truck 3 along the route
            updatedTrucks[2] = {
              ...updatedTrucks[2],
              currentSegment: 1,
              progress: 40,
              position: calculatePositionAlongPath({
                ...updatedTrucks[2],
                currentSegment: 1,
                progress: 40
              })
            };
            return updatedTrucks;
          });
          
          // After truck moves, trigger document issue
          setTimeout(() => {
            // Update agent activities
            setAgentActivities(prev => {
              const updated = [...prev];
              const docIndex = updated.findIndex(a => a.id === 'di-1');
              if (docIndex >= 0) {
                updated[docIndex] = {
                  ...updated[docIndex],
                  action: 'Found documentation mismatch in customs code',
                  status: 'completed',
                  completionTime: Date.now()
                };
              }
              
              return [
                ...updated,
                {
                  id: 'di-3',
                  agent: 'Risk Assessment Agent',
                  action: 'Evaluating customs clearance impact',
                  status: 'working',
                  startTime: Date.now(),
                  icon: <AlertOctagon className="w-4 h-4 text-red-500" />
                }
              ];
            });
            
            setActiveAgents(prev => [...prev, 'Risk Assessment Agent']);
            
            // Update truck status
            setTrucks(prevTrucks => {
              const updatedTrucks = [...prevTrucks];
              updatedTrucks[2] = { 
                ...updatedTrucks[2], 
                status: 'cautious', 
                isAffected: true, 
                eta: '90 min' 
              };
              return updatedTrucks;
            });
            
            // Set document issue and add agent message
            setDocumentIssue(true);
            setAgentMessages([
              {
                agent: 'Document Intelligence Agent',
                message: '📄 Mismatch detected in customs code for shipment #82491. Flagged for manual verification.',
                type: 'warning',
              }
            ]);
            setShowRecommendation(true);
            
            // After a moment, update agent activities again
            setTimeout(() => {
              setAgentActivities(prev => {
                const updated = [...prev];
                const riskIndex = updated.findIndex(a => a.id === 'di-3');
                if (riskIndex >= 0) {
                  updated[riskIndex] = {
                    ...updated[riskIndex],
                    action: 'Clearance delay of 3.5h predicted',
                    status: 'completed',
                    completionTime: Date.now()
                  };
                }
                
                return [
                  ...updated,
                  {
                    id: 'di-4',
                    agent: 'Insight Agent',
                    action: 'Analyzing historical documentation issues',
                    status: 'working',
                    startTime: Date.now(),
                    icon: <Zap className="w-4 h-4 text-purple-500" />
                  }
                ];
              });
              
              setActiveAgents(prev => [...prev, 'Insight Agent']);
            }, 2000);
          }, 1000);
        }, 1000);
        break;
    }
  };

  // Real-time updates for trucks with improved path following
  useEffect(() => {
    const interval = setInterval(() => {
      // Update truck positions and progress with constant speed
      setTrucks(prevTrucks => {
        return prevTrucks.map(truck => {
          // Constant speed increment (adjust this value to control speed)
          const incrementProgress = 0.5;
          let newProgress = truck.progress + incrementProgress;
          let newSegment = truck.currentSegment;
          
          // If segment is complete, move to next segment
          if (newProgress >= 100) {
            newSegment++;
            newProgress = 0;
            
            // Find the route for this truck
            const route = routes.find(r => r.id === truck.routeId);
            
            // If we've reached the end of the route, reset to beginning
            if (route && newSegment >= route.points.length - 1) {
              newSegment = 0;
              // Reset truck position to initial position
              return {
                ...truck,
                progress: 0,
                currentSegment: 0,
                position: { 
                  x: route.points[0].x, 
                  y: route.points[0].y 
                }
              };
            }
          }
          
          // Get updated truck with new progress and segment
          const updatedTruck = {
            ...truck,
            progress: newProgress,
            currentSegment: newSegment,
          };
          
          // Calculate new position based on the path
          const newPosition = calculatePositionAlongPath(updatedTruck);
          
          return {
            ...updatedTruck,
            position: newPosition
          };
        });
      });

      // Randomly change weather
      if (Math.random() > 0.95) {
        const weathers: WeatherCondition[] = ['sunny', 'cloudy', 'rainy'];
        setWeather(weathers[Math.floor(Math.random() * weathers.length)]);
      }

      // Randomly change traffic - make it more likely to be 'jam' if we're in traffic scenario
      if (Math.random() > 0.92) {
        const traffics: TrafficCondition[] = ['smooth', 'moderate', 'jam'];
        let trafficChoice = traffics[Math.floor(Math.random() * traffics.length)];
        
        // Force "jam" traffic for the traffic scenario at a certain point
        if (currentScenario === 'traffic-jam' && !simulationCompleted && 
            trucks.some(t => t.id === 'T001' && t.currentSegment >= 1 && t.progress > 30)) {
          trafficChoice = 'jam';
        }
        
        setTraffic(trafficChoice);
      }

      // For document scenario, randomly show agent "thinking" messages
      if (currentScenario === 'document-issue' && documentIssue && !documentFixed && Math.random() > 0.9) {
        const thinkingMessages = [
          "Document Intelligence Agent analyzing invoice data...",
          "Searching for matching customs codes in database...",
          "Cross-referencing with previous shipments...",
          "Analyzing document formatting anomalies...",
          "Checking digital signatures..."
        ];
        setAgentThinking(true);
        setAgentThinkingMessage(thinkingMessages[Math.floor(Math.random() * thinkingMessages.length)]);
        
        // Hide the thinking message after 2 seconds
        setTimeout(() => {
          setAgentThinking(false);
        }, 2000);
      }
    }, 150); // Slower updates for reduced speed

    return () => clearInterval(interval);
  }, [currentScenario, trucks, documentIssue, documentFixed, simulationCompleted]);

  // Scenario simulations
  useEffect(() => {
    if (simulationCompleted) return;
    
    // Clear any existing timeouts
    if (simulationTimeoutRef.current) {
      clearTimeout(simulationTimeoutRef.current);
    }
    
    switch (currentScenario) {
      case 'supplier-delay':
        // Simulate a delay for one of the trucks after 5 seconds
        simulationTimeoutRef.current = setTimeout(() => {
          setTrucks(prevTrucks => {
            const updatedTrucks = [...prevTrucks];
            // Make Truck 2 delayed
            updatedTrucks[1] = { 
              ...updatedTrucks[1], 
              status: 'delayed', 
              isAffected: true, 
              eta: '65 min' 
            };
            return updatedTrucks;
          });

          // Add agent warning message
          setAgentMessages([
            {
              agent: 'Supplier Monitoring Agent',
              message: '⚠️ Supplier at Origin 2 failed to load shipment on time. Truck T002 delayed at origin.',
              type: 'warning',
            }
          ]);
          setShowRecommendation(true);
        }, 5000);
        break;

      case 'traffic-jam':
        // Simulate a traffic jam after Truck 1 is en route
        simulationTimeoutRef.current = setTimeout(() => {
          // First, make sure Truck 1 is on its way
          setTrucks(prevTrucks => {
            const updatedTrucks = [...prevTrucks];
            if (updatedTrucks[0].currentSegment >= 1 && updatedTrucks[0].progress > 30) {
              // Traffic jam detected
              updatedTrucks[0] = { 
                ...updatedTrucks[0], 
                status: 'delayed', 
                isAffected: true, 
                eta: '120 min' 
              };
              
              // Show traffic jam messages
              setAgentMessages([
                {
                  agent: 'Risk Detection Agent',
                  message: '🚧 Detected traffic jam near Route A — expected delay: 2.5h.',
                  type: 'warning',
                }
              ]);
              setShowRecommendation(true);
              setTraffic('jam');
            }
            return updatedTrucks;
          });
        }, 8000);
        break;

      case 'document-issue':
        // Simulate document issues when Truck 3 reaches destination
        simulationTimeoutRef.current = setTimeout(() => {
          setTrucks(prevTrucks => {
            const updatedTrucks = [...prevTrucks];
            // Focus on Truck 3 for this scenario
            if (updatedTrucks[2].currentSegment >= 1) {
              updatedTrucks[2] = { 
                ...updatedTrucks[2], 
                status: 'cautious', 
                isAffected: true, 
                eta: '90 min' 
              };
              
              // Show document issue messages
              setAgentMessages([
                {
                  agent: 'Document Intelligence Agent',
                  message: '📄 Mismatch detected in customs code for shipment #82491. Flagged for manual verification.',
                  type: 'warning',
                }
              ]);
              setDocumentIssue(true);
              setShowRecommendation(true);
            }
            return updatedTrucks;
          });
        }, 6000);
        break;
    }

    return () => {
      if (simulationTimeoutRef.current) {
        clearTimeout(simulationTimeoutRef.current);
      }
    };
  }, [currentScenario, simulationCompleted]);

  const handleApproveRecommendation = () => {
    switch(currentScenario) {
      case 'supplier-delay':
        setAgentMessages(prevMessages => [
          ...prevMessages,
          {
            agent: 'Logistics Agent',
            message: '📦 Recommending reroute of Truck T003 to pick up critical components from Origin 2.',
            type: 'recommendation',
          },
          {
            agent: 'Efficiency Agent',
            message: '⏱️ Potential delay avoided: 4h. Cost saved: $250.',
            type: 'success',
          },
        ]);

        // Update truck status
        setTrucks(prevTrucks => {
          const updatedTrucks = [...prevTrucks];
          // Mark the affected truck as on-time again
          updatedTrucks[1] = { 
            ...updatedTrucks[1], 
            status: 'on-time', 
            name: 'Truck 2 (Rerouted)', 
            isAffected: false,
            eta: '40 min'
          };
          return updatedTrucks;
        });

        // Update agent activities
        setAgentActivities(prev => {
          const updated = [...prev];
          const strategyIndex = updated.findIndex(a => a.id === 'sd-4');
          if (strategyIndex >= 0) {
            updated[strategyIndex] = {
              ...updated[strategyIndex],
              action: 'Selected optimal rerouting solution',
              status: 'completed',
              completionTime: Date.now()
            };
          }
          
          return [
            ...updated,
            {
              id: 'sd-5',
              agent: 'Efficiency Agent',
              action: 'Calculating time and cost savings',
              status: 'working',
              startTime: Date.now(),
              icon: <Zap className="w-4 h-4 text-yellow-500" />
            }
          ];
        });
        
        setActiveAgents(prev => [...prev, 'Efficiency Agent']);
        break;

      case 'traffic-jam':
        setAgentMessages(prevMessages => [
          ...prevMessages,
          {
            agent: 'Strategy Agent',
            message: '🧠 Rerouting to Alt Route B. ETA improves by 1.8h. Fuel usage increases by 3%.',
            type: 'recommendation',
          },
          {
            agent: 'Efficiency Agent',
            message: '📉 Delay minimized. Final delivery meets SLA.',
            type: 'success',
          },
        ]);

        // Update truck status
        setTrucks(prevTrucks => {
          const updatedTrucks = [...prevTrucks];
          updatedTrucks[0] = { 
            ...updatedTrucks[0], 
            status: 'rerouted', 
            name: 'Truck 1 (Rerouted)', 
            isAffected: false,
            eta: '60 min'
          };
          return updatedTrucks;
        });

        // Update agent activities
        setAgentActivities(prev => {
          const updated = [...prev];
          const strategyIndex = updated.findIndex(a => a.id === 'tj-4');
          if (strategyIndex >= 0) {
            updated[strategyIndex] = {
              ...updated[strategyIndex],
              action: 'Selected Alt Route B as optimal solution',
              status: 'completed',
              completionTime: Date.now()
            };
          }
          
          return [
            ...updated,
            {
              id: 'tj-5',
              agent: 'Efficiency Agent',
              action: 'Calculating fuel usage and time impact',
              status: 'working',
              startTime: Date.now(),
              icon: <Zap className="w-4 h-4 text-yellow-500" />
            }
          ];
        });
        
        setActiveAgents(prev => [...prev, 'Efficiency Agent']);
        break;

      case 'document-issue':
        setAgentMessages(prevMessages => [
          ...prevMessages,
          {
            agent: 'Compliance Agent',
            message: '📝 Suggested fix: Pull correct documentation from supplier API. Notify customs handling team.',
            type: 'recommendation',
          },
          {
            agent: 'Insight Agent',
            message: '🚦 3 similar issues detected this month. Recommend automated document validation pre-arrival.',
            type: 'info',
          },
        ]);

        // Update document status
        setDocumentFixed(true);
        
        // Update agent activities
        setAgentActivities(prev => {
          const updated = [...prev];
          const insightIndex = updated.findIndex(a => a.id === 'di-4');
          if (insightIndex >= 0) {
            updated[insightIndex] = {
              ...updated[insightIndex],
              action: 'Identified 3 similar issues this month',
              status: 'completed',
              completionTime: Date.now()
            };
          }
          
          return [
            ...updated,
            {
              id: 'di-5',
              agent: 'Document Fix Agent',
              action: 'Retrieving correct customs code from supplier API',
              status: 'working',
              startTime: Date.now(),
              icon: <FileCheck className="w-4 h-4 text-green-500" />
            }
          ];
        });
        
        setActiveAgents(prev => [...prev, 'Document Fix Agent']);
        
        // After document fix
        setTimeout(() => {
          setAgentActivities(prev => {
            const updated = [...prev];
            const fixIndex = updated.findIndex(a => a.id === 'di-5');
            if (fixIndex >= 0) {
              updated[fixIndex] = {
                ...updated[fixIndex],
                action: 'Applied document correction',
                status: 'completed',
                completionTime: Date.now()
              };
            }
            
            return updated;
          });
        }, 3000);
        break;
    }

    setShowRecommendation(false);
    
    // Show simulation results after a delay
    setTimeout(() => {
      setSimulationCompleted(true);
      
      // Set KPI data based on scenario
      switch(currentScenario) {
        case 'supplier-delay':
          setKpiData({
            delaysPrevented: 1,
            timeSaved: 4.0,
            costSaved: 250,
            slaImprovement: 8,
            activeAgents: 2
          });
          break;
        case 'traffic-jam':
          setKpiData({
            delaysPrevented: 1,
            timeSaved: 1.8,
            costSaved: 320,
            slaImprovement: 15,
            activeAgents: 2
          });
          break;
        case 'document-issue':
          setKpiData({
            delaysPrevented: 1,
            timeSaved: 2.5,
            costSaved: 850,
            slaImprovement: 12,
            activeAgents: 3
          });
          break;
      }
    }, 10000);
  };

  const getWeatherIcon = () => {
    switch (weather) {
      case 'sunny': return <Sun className="w-5 h-5 text-yellow-500" />;
      case 'cloudy': return <Cloud className="w-5 h-5 text-gray-500" />;
      case 'rainy': return <CloudRain className="w-5 h-5 text-blue-500" />;
      default: return <Sun className="w-5 h-5 text-yellow-500" />;
    }
  };

  const getTrafficColor = () => {
    switch (traffic) {
      case 'smooth': return 'text-green-500';
      case 'moderate': return 'text-yellow-500';
      case 'jam': return 'text-red-500';
      default: return 'text-green-500';
    }
  };

  const getTruckStatusColor = (status: TruckStatus) => {
    switch (status) {
      case 'on-time': return 'text-green-500';
      case 'delayed': return 'text-red-500';
      case 'cautious': return 'text-yellow-500';
      default: return 'text-green-500';
    }
  };

  const getWeatherOverlay = () => {
    if (weather === 'rainy') {
      return (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(30)].map((_, i) => (
            <div
              key={i}
              className="absolute w-0.5 h-4 bg-blue-300 opacity-60 animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: '1s'
              }}
            />
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Scenario Selection */}
      <div className="md:col-span-2">
        <Tabs 
          defaultValue="supplier-delay" 
          className="w-full" 
          value={currentScenario}
          onValueChange={(value) => handleScenarioChange(value as SimulationScenario)}
        >
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="supplier-delay" className="text-xs md:text-sm">
              🏭 Supplier Delay
            </TabsTrigger>
            <TabsTrigger value="traffic-jam" className="text-xs md:text-sm">
              🚧 Traffic Jam
            </TabsTrigger>
            <TabsTrigger value="document-issue" className="text-xs md:text-sm">
              📄 Document Issue
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Map and Trucks */}
      <div className="md:col-span-2">
        <div className="relative h-[300px] bg-slate-100 rounded-lg overflow-hidden border" ref={routeRef}>
          {getWeatherOverlay()}
          
          <div className="absolute inset-0">
            {/* SVG Container for routes */}
            <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
              {/* Draw all routes with their specific colors */}
              {routes.map(route => (
                <path
                  key={route.id}
                  d={route.pathString}
                  stroke={route.color}
                  strokeWidth="1"
                  fill="none"
                  strokeDasharray="4,2"
                  className="opacity-70"
                />
              ))}
              
              {/* Draw active segment for each truck */}
              {trucks.map((truck) => {
                const route = routes.find(r => r.id === truck.routeId);
                if (!route) return null;
                
                // Get current segment points
                const startPointIndex = truck.currentSegment;
                const endPointIndex = truck.currentSegment + 1;
                
                if (endPointIndex >= route.points.length) return null;
                
                const startPoint = route.points[startPointIndex];
                const endPoint = route.points[endPointIndex];
                const midX = (startPoint.x + endPoint.x) / 2;
                
                // Create a path string for just this segment
                const segmentPath = `M ${startPoint.x} ${startPoint.y} Q ${midX} ${startPoint.y} ${endPoint.x} ${endPoint.y}`;
                
                return (
                  <path
                    key={`active-${truck.id}`}
                    d={segmentPath}
                    stroke={route.color}
                    strokeWidth="2"
                    fill="none"
                    strokeDasharray="none"
                    className="opacity-100"
                  />
                );
              })}
              
              {/* Draw animated dots along the route */}
              {trucks.map((truck) => {
                const route = routes.find(r => r.id === truck.routeId);
                if (!route) return null;
                
                // Calculate positions for animated dots
                const dotsCount = 5;
                const dots = [];
                
                for (let i = 0; i < dotsCount; i++) {
                  // Calculate position for this dot (behind the truck)
                  const segmentProgress = truck.progress;
                  let dotProgress = segmentProgress - (i * 10);
                  let dotSegment = truck.currentSegment;
                  
                  // If dot would be in previous segment
                  if (dotProgress < 0) {
                    dotProgress = 100 + dotProgress; // Wrap around to end of previous segment
                    dotSegment = dotSegment - 1;
                    
                    // If we're at the first segment, wrap to the last
                    if (dotSegment < 0) {
                      dotSegment = route.points.length - 2;
                    }
                  }
                  
                  // Skip if position is invalid
                  if (dotSegment < 0 || dotSegment >= route.points.length - 1) continue;
                  
                  // Get points for this segment
                  const segStartPoint = route.points[dotSegment];
                  const segEndPoint = route.points[dotSegment + 1];
                  const segMidX = (segStartPoint.x + segEndPoint.x) / 2;
                  
                  // Calculate position using bezier curve
                  const t = dotProgress / 100;
                  const oneMinusT = 1 - t;
                  const x = (oneMinusT * oneMinusT * segStartPoint.x) + 
                            (2 * oneMinusT * t * segMidX) + 
                            (t * t * segEndPoint.x);
                  
                  const y = (oneMinusT * oneMinusT * segStartPoint.y) + 
                            (2 * oneMinusT * t * segStartPoint.y) + 
                            (t * t * segEndPoint.y);
                  
                  dots.push({ x, y, opacity: 1 - (i * 0.15) });
                }
                
                return (
                  <g key={`dots-${truck.id}`}>
                    {dots.map((dot, idx) => (
                      <circle
                        key={`dot-${truck.id}-${idx}`}
                        cx={dot.x}
                        cy={dot.y}
                        r="1"
                        fill={route.color}
                        opacity={dot.opacity}
                      />
                    ))}
                  </g>
                );
              })}
            </svg>
          
            {/* Locations and Trucks using the same coordinate system */}
            <div className="absolute inset-0" style={{ pointerEvents: 'none' }}>
              {/* All locations (cities and checkpoints) */}
              {Object.entries(locations).map(([name, pos]) => (
                <div 
                  key={name}
                  className="absolute flex flex-col items-center"
                  style={{ 
                    left: `${pos.x}%`, 
                    top: `${pos.y}%`, 
                    transform: 'translate(-50%, -50%)'
                  }}
                >
                  <div className={`w-3 h-3 rounded-full border-2 border-white shadow-md ${
                    name === 'Destination 2' ? 'bg-red-500' :
                    name === 'Central Hub' ? 'bg-orange-500' :
                    name.includes('Checkpoint') ? 'bg-yellow-500' : 
                    name.includes('Origin') ? 'bg-blue-500' : 'bg-green-500'
                  }`}></div>
                  <div className="bg-white px-2 py-0.5 rounded-md shadow-sm mt-1 text-xs font-medium whitespace-nowrap">
                    {name}
                  </div>
                </div>
              ))}

              {/* Moving Trucks */}
              {trucks.map((truck) => {
                const route = routes.find(r => r.id === truck.routeId);
                return (
                  <div 
                    key={truck.id}
                    className="absolute transition-all duration-200 ease-linear"
                    style={{
                      left: `${truck.position.x}%`, 
                      top: `${truck.position.y}%`,
                      transform: 'translate(-50%, -50%)'
                    }}
                  >
                    <div className={`p-1 rounded-full shadow-md ${
                      truck.isAffected ? 'bg-red-100' : 
                      `bg-${route?.color.substring(1)}-100` || 'bg-blue-100'
                    }`}>
                      <Truck 
                        className={`w-4 h-4 ${
                          truck.isAffected ? 'text-red-500 animate-pulse' : 
                          route ? route.color : getTruckStatusColor(truck.status)
                        }`} 
                      />
                    </div>
                    <div className={`text-[10px] font-medium mt-0.5 whitespace-nowrap text-center ${truck.isAffected ? 'text-red-600' : ''}`}>
                      {truck.name}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Agent thinking indicator */}
          {agentThinking && (
            <div className="absolute bottom-2 left-2 right-2 bg-white/90 shadow-md rounded-md p-2 flex items-center text-xs animate-pulse">
              <RefreshCw className="w-3 h-3 mr-2 animate-spin" />
              {agentThinkingMessage}
            </div>
          )}
        </div>
      </div>

      {/* Results Dashboard - Show when simulation completes */}
      {simulationCompleted && (
        <div className="md:col-span-2 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-blue-800 flex items-center">
              <BarChart4 className="w-5 h-5 mr-2" />
              Agent Performance Dashboard
            </h3>
            <Button variant="outline" size="sm" onClick={() => resetSimulation()}>
              Reset Simulation
            </Button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <Card className="bg-white/80">
              <CardContent className="p-3">
                <div className="text-2xl font-bold text-blue-700">{kpiData.delaysPrevented}</div>
                <div className="text-xs text-gray-600">Delays Prevented</div>
              </CardContent>
            </Card>
            
            <Card className="bg-white/80">
              <CardContent className="p-3">
                <div className="text-2xl font-bold text-blue-700">{kpiData.timeSaved.toFixed(1)}h</div>
                <div className="text-xs text-gray-600">Avg Time Saved</div>
              </CardContent>
            </Card>
            
            <Card className="bg-white/80">
              <CardContent className="p-3">
                <div className="text-2xl font-bold text-blue-700">${kpiData.costSaved}</div>
                <div className="text-xs text-gray-600">Cost Saved</div>
              </CardContent>
            </Card>
            
            <Card className="bg-white/80">
              <CardContent className="p-3">
                <div className="text-2xl font-bold text-blue-700">+{kpiData.slaImprovement}%</div>
                <div className="text-xs text-gray-600">SLA Compliance ↑</div>
              </CardContent>
            </Card>
            
            <Card className="bg-white/80">
              <CardContent className="p-3">
                <div className="text-2xl font-bold text-blue-700">{kpiData.activeAgents}</div>
                <div className="text-xs text-gray-600">Active Agents</div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Agent Messages */}
      {agentMessages.length > 0 && (
        <div className="md:col-span-2">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center">
                <AlertTriangle className="w-4 h-4 mr-2 text-orange-500" />
                Agent Notifications
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-36 overflow-y-auto pr-2">
                {agentMessages.map((msg, idx) => (
                  <div key={idx} className={`p-2 rounded-md border-l-4 text-sm ${
                    msg.type === 'warning' ? 'bg-red-50 border-red-500' :
                    msg.type === 'recommendation' ? 'bg-blue-50 border-blue-500' :
                    msg.type === 'success' ? 'bg-green-50 border-green-500' : 
                    msg.type === 'info' ? 'bg-purple-50 border-purple-500' : 'bg-gray-50 border-gray-500'
                  }`}>
                    <p className="text-xs font-medium text-gray-800">{msg.agent}:</p>
                    <p className={`text-xs ${ 
                      msg.type === 'warning' ? 'text-red-700' :
                      msg.type === 'recommendation' ? 'text-blue-700' :
                      msg.type === 'success' ? 'text-green-700' : 
                      msg.type === 'info' ? 'text-purple-700' : 'text-gray-700'
                    }`}>{msg.message}</p>
                  </div>
                ))}
              </div>
              
              {showRecommendation && (
                <Button 
                  onClick={handleApproveRecommendation}
                  className="mt-3 w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-1 px-3 rounded-md transition-colors duration-150 flex items-center justify-center"
                  size="sm"
                >
                  <CheckCircle className="w-4 h-4 mr-2" /> Approve Recommendation
                </Button>
              )}

              {/* Document scenario: show document panel */}
              {currentScenario === 'document-issue' && documentIssue && !documentFixed && (
                <div className="mt-3 border border-orange-200 rounded-md p-2 bg-orange-50">
                  <div className="flex items-center text-xs font-medium text-orange-800 mb-1">
                    <FileWarning className="w-3 h-3 mr-1" />
                    Document Issue Details
                  </div>
                  <div className="text-xs text-gray-700 mb-1">
                    <span className="font-medium">Shipment:</span> #82491 <br />
                    <span className="font-medium">Document Type:</span> Customs Declaration <br />
                    <span className="font-medium">Issue:</span> Missing customs code (HS: 8471.60)
                  </div>
                </div>
              )}
              
              {currentScenario === 'document-issue' && documentFixed && (
                <div className="mt-3 border border-green-200 rounded-md p-2 bg-green-50">
                  <div className="flex items-center text-xs font-medium text-green-800 mb-1">
                    <FileCheck className="w-3 h-3 mr-1" />
                    Document Fixed
                  </div>
                  <div className="text-xs text-gray-700">
                    <span className="font-medium">Shipment:</span> #82491 <br />
                    <span className="font-medium">Solution:</span> Customs code automatically retrieved and updated
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Truck Status */}
      <div>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center">
              <Truck className="w-4 h-4 mr-2" />
              Active Shipments
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="grid grid-cols-1 gap-2">
              {trucks.map((truck) => {
                const route = routes.find(r => r.id === truck.routeId);
                const currentPoint = route?.points[truck.currentSegment];
                const nextPoint = route?.points[truck.currentSegment + 1];
                return (
                  <div 
                    key={truck.id}
                    className={`flex justify-between items-center p-2 rounded-md text-sm ${
                      truck.isAffected ? 'bg-red-50' : 
                      truck.status === 'delayed' ? 'bg-yellow-50' : 'bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center">
                      <Truck 
                        className={`w-4 h-4 mr-2 ${
                          truck.isAffected ? 'text-red-500' : 
                          route ? route.color : getTruckStatusColor(truck.status)
                        }`} 
                      />
                      <div>
                        <p className="font-medium">{truck.name}</p>
                        <p className="text-xs text-gray-500">
                          {currentPoint?.name} → {nextPoint?.name || 'Destination'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-medium ${getTruckStatusColor(truck.status)}`}>
                        {truck.status === 'delayed' ? 'Delayed' : 'On time'}
                      </p>
                      <p className="text-xs">ETA: {truck.eta}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Truck Progress Bars */}
      <div className="md:col-span-2">
        <Card>
          <CardHeader className="pb-1">
            <CardTitle className="text-base flex items-center">
              <Clock className="w-4 h-4 mr-2" />
              Shipment Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {trucks.map((truck) => {
                const route = routes.find(r => r.id === truck.routeId);
                if (!route) return null;
                
                // Calculate overall route progress (combining segments)
                const totalSegments = route.points.length - 1;
                const overallProgress = ((truck.currentSegment / totalSegments) * 100) + 
                                       (truck.progress / totalSegments);
                
                // Get all checkpoints and destination for this route
                const routePoints = route.points;
                
                // Get current and next points for this truck
                const currentPoint = route.points[truck.currentSegment];
                const nextPoint = route.points[truck.currentSegment + 1];
                
                return (
                  <div key={`progress-${truck.id}`} className="relative">
                    {/* Header: Truck info and status */}
                    <div className="flex items-center justify-between text-xs mb-0.5">
                      <div className="flex items-center gap-1">
                        <div 
                          className="w-2 h-2 rounded-full" 
                          style={{ backgroundColor: route.color }}
                        ></div>
                        <span className="font-medium">{truck.name}</span>
                        <span className="text-gray-500">
                          {currentPoint?.name?.replace('Checkpoint', 'CP').replace('Origin', 'O').replace('Destination', 'D') || ''} → 
                          {nextPoint?.name?.replace('Checkpoint', 'CP').replace('Origin', 'O').replace('Destination', 'D') || ''}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className={`font-medium ${getTruckStatusColor(truck.status)}`}>
                          {truck.status === 'on-time' ? 'On time' : 'Delayed'}
                        </span>
                        <span>ETA: {truck.eta}</span>
                      </div>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="relative h-6">
                      {/* Background track */}
                      <div 
                        className="absolute inset-0 rounded-full h-1.5 mt-2"
                        style={{ backgroundColor: `${route.color}20` }}
                      ></div>
                      
                      {/* Progress fill */}
                      <div 
                        className="absolute h-1.5 rounded-full mt-2 transition-all duration-500"
                        style={{ 
                          width: `${Math.min(100, overallProgress)}%`,
                          backgroundColor: route.color
                        }}
                      ></div>
                      
                      {/* Checkpoints and destination markers - More compact */}
                      {routePoints.map((point, index) => {
                        // Calculate position as percentage of total route
                        const position = (index / (routePoints.length - 1)) * 100;
                        const isStart = index === 0;
                        const isEnd = index === routePoints.length - 1;
                        
                        // Skip rendering points that are too close to others
                        // Only show start, end and significant checkpoints
                        if (!isStart && !isEnd && index % 2 !== 0 && routePoints.length > 4) {
                          return null;
                        }
                        
                        return (
                          <div 
                            key={`point-${truck.id}-${index}`}
                            className="absolute transform -translate-x-1/2"
                            style={{ left: `${position}%` }}
                          >
                            {/* Marker dot - smaller */}
                            <div 
                              className={`w-2.5 h-2.5 rounded-full border ${
                                isStart ? 'bg-blue-500 border-blue-300' : 
                                isEnd ? 'bg-red-500 border-red-300' : 
                                'bg-yellow-500 border-yellow-300'
                              } mx-auto mb-0.5`}
                            ></div>
                            
                            {/* Abbreviated label */}
                            <div className={`text-[8px] font-medium whitespace-nowrap ${
                              position < 10 ? 'text-left ml-1' : 
                              position > 90 ? 'text-right -ml-2' : 'text-center'
                            }`}>
                              {point.name.replace('Checkpoint', 'CP').replace('Origin', 'O').replace('Destination', 'D')}
                            </div>
                          </div>
                        );
                      })}
                      
                      {/* Truck position marker - smaller */}
                      <div 
                        className="absolute transform -translate-x-1/2 transition-all duration-500"
                        style={{ left: `${Math.min(100, overallProgress)}%` }}
                      >
                        <div className="w-4 h-4 rounded-full bg-white border shadow-md -mt-1.5" 
                          style={{ borderColor: route.color }}>
                          <Truck 
                            className="w-2 h-2 mx-auto mt-0.5" 
                            style={{ color: route.color }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Agent Workflow Visualization */}
      <div className="md:col-span-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center">
              <Activity className="w-4 h-4 mr-2 text-blue-500" />
              Agent Workflow
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              {/* Active Agents */}
              <div className="flex flex-wrap gap-2 mb-3">
                {activeAgents.map(agent => (
                  <div key={agent} className="bg-blue-50 text-blue-800 text-xs font-medium rounded px-2 py-1 flex items-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mr-1.5 animate-pulse"></div>
                    {agent}
                  </div>
                ))}
              </div>
              
              {/* Agent Activity Timeline */}
              <div className="space-y-3 max-h-[180px] overflow-y-auto">
                {agentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-start">
                    {/* Status indicator */}
                    <div className={`mt-0.5 mr-2 ${
                      activity.status === 'working' ? 'text-blue-500' :
                      activity.status === 'completed' ? 'text-green-500' :
                      activity.status === 'waiting' ? 'text-amber-500' : 'text-gray-400'
                    }`}>
                      {activity.icon}
                    </div>
                    
                    {/* Activity details */}
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <p className="text-xs font-medium">{activity.agent}</p>
                        <p className="text-[10px] text-gray-500">
                          {activity.status === 'working' ? (
                            <span className="flex items-center">
                              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mr-1 animate-pulse"></span>
                              Working
                            </span>
                          ) : activity.status === 'completed' ? (
                            <span className="flex items-center">
                              <CheckCircle className="w-3 h-3 mr-1 text-green-500" />
                              Completed
                            </span>
                          ) : (
                            activity.status
                          )}
                        </p>
                      </div>
                      <p className="text-xs text-gray-700">{activity.action}</p>
                      
                      {/* Progress bar for working activities */}
                      {activity.status === 'working' && (
                        <div className="w-full h-1 bg-blue-100 rounded-full mt-1 overflow-hidden">
                          <div className="h-full bg-blue-500 animate-progress-indeterminate"></div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// Add this animation at the end of the file before export default
const customStyles = `
@keyframes progress-indeterminate {
  0% { width: 0%; margin-left: -10%; }
  100% { width: 60%; margin-left: 100%; }
}

.animate-progress-indeterminate {
  animation: progress-indeterminate 1.5s ease infinite;
}
`;

export default LogisticsSimulation;

// Append styles to document
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = customStyles;
  document.head.appendChild(style);
} 