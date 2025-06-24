import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Square, 
  Circle, 
  Move, 
  RotateCw, 
  Trash2, 
  Save, 
  Download, 
  Upload, 
  Undo, 
  Redo,
  Grid,
  Ruler,
  Palette,
  Home,
  Sofa,
  Bed,
  ChefHat,
  Bath,
  Tv,
  Lamp,
  Table,
  Chair,
  Calculator,
  IndianRupee,
  Plus,
  Minus,
  ArrowLeft,
  Eye,
  EyeOff,
  Settings,
  Layers
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

interface Point {
  x: number;
  y: number;
}

interface Room {
  id: string;
  name: string;
  points: Point[];
  color: string;
  area: number;
  type: string;
}

interface Furniture {
  id: string;
  type: string;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  color: string;
  price: number;
}

interface Wall {
  id: string;
  start: Point;
  end: Point;
  thickness: number;
  color: string;
}

interface DesignData {
  rooms: Room[];
  furniture: Furniture[];
  walls: Wall[];
  gridSize: number;
  scale: number; // pixels per foot
}

const DesignTool = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [tool, setTool] = useState<'select' | 'room' | 'wall' | 'furniture'>('select');
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPoints, setCurrentPoints] = useState<Point[]>([]);
  const [showGrid, setShowGrid] = useState(true);
  const [showRuler, setShowRuler] = useState(true);
  const [showCostPanel, setShowCostPanel] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  
  const [designData, setDesignData] = useState<DesignData>({
    rooms: [],
    furniture: [],
    walls: [],
    gridSize: 20,
    scale: 20 // 20 pixels = 1 foot
  });

  const [history, setHistory] = useState<DesignData[]>([designData]);
  const [historyIndex, setHistoryIndex] = useState(0);

  const furnitureTypes = [
    { type: 'sofa', name: 'Sofa', icon: Sofa, width: 80, height: 40, price: 25000 },
    { type: 'bed', name: 'Bed', icon: Bed, width: 60, height: 80, price: 15000 },
    { type: 'dining-table', name: 'Dining Table', icon: Table, width: 60, height: 40, price: 12000 },
    { type: 'chair', name: 'Chair', icon: Chair, width: 20, height: 20, price: 3000 },
    { type: 'tv', name: 'TV Unit', icon: Tv, width: 50, height: 15, price: 8000 },
    { type: 'lamp', name: 'Lamp', icon: Lamp, width: 15, height: 15, price: 2000 },
  ];

  const roomTypes = [
    { type: 'living', name: 'Living Room', color: '#E3F2FD' },
    { type: 'bedroom', name: 'Bedroom', color: '#F3E5F5' },
    { type: 'kitchen', name: 'Kitchen', color: '#E8F5E8' },
    { type: 'bathroom', name: 'Bathroom', color: '#FFF3E0' },
    { type: 'dining', name: 'Dining Room', color: '#FCE4EC' },
    { type: 'study', name: 'Study Room', color: '#E1F5FE' },
  ];

  // Check authentication
  useEffect(() => {
    if (!user) {
      navigate('/');
    }
  }, [user, navigate]);

  // Canvas drawing functions
  const drawGrid = useCallback((ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
    if (!showGrid) return;
    
    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = 0.5;
    
    const gridSize = designData.gridSize * zoom;
    const offsetX = pan.x % gridSize;
    const offsetY = pan.y % gridSize;
    
    for (let x = offsetX; x < canvas.width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    
    for (let y = offsetY; y < canvas.height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }
  }, [showGrid, designData.gridSize, zoom, pan]);

  const drawRoom = useCallback((ctx: CanvasRenderingContext2D, room: Room) => {
    if (room.points.length < 3) return;
    
    ctx.fillStyle = room.color;
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    
    ctx.beginPath();
    const firstPoint = room.points[0];
    ctx.moveTo(firstPoint.x * zoom + pan.x, firstPoint.y * zoom + pan.y);
    
    room.points.slice(1).forEach(point => {
      ctx.lineTo(point.x * zoom + pan.x, point.y * zoom + pan.y);
    });
    
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    
    // Draw room label
    const centerX = room.points.reduce((sum, p) => sum + p.x, 0) / room.points.length;
    const centerY = room.points.reduce((sum, p) => sum + p.y, 0) / room.points.length;
    
    ctx.fillStyle = '#333';
    ctx.font = '14px Inter';
    ctx.textAlign = 'center';
    ctx.fillText(room.name, centerX * zoom + pan.x, centerY * zoom + pan.y);
  }, [zoom, pan]);

  const drawFurniture = useCallback((ctx: CanvasRenderingContext2D, furniture: Furniture) => {
    ctx.save();
    
    const x = furniture.x * zoom + pan.x;
    const y = furniture.y * zoom + pan.y;
    const width = furniture.width * zoom;
    const height = furniture.height * zoom;
    
    ctx.translate(x + width/2, y + height/2);
    ctx.rotate(furniture.rotation * Math.PI / 180);
    
    ctx.fillStyle = furniture.color;
    ctx.strokeStyle = selectedItem === furniture.id ? '#2196F3' : '#666';
    ctx.lineWidth = selectedItem === furniture.id ? 3 : 1;
    
    ctx.fillRect(-width/2, -height/2, width, height);
    ctx.strokeRect(-width/2, -height/2, width, height);
    
    // Draw furniture icon/label
    ctx.fillStyle = '#333';
    ctx.font = '12px Inter';
    ctx.textAlign = 'center';
    ctx.fillText(furniture.name, 0, 4);
    
    ctx.restore();
  }, [zoom, pan, selectedItem]);

  const drawWall = useCallback((ctx: CanvasRenderingContext2D, wall: Wall) => {
    ctx.strokeStyle = wall.color;
    ctx.lineWidth = wall.thickness * zoom;
    
    ctx.beginPath();
    ctx.moveTo(wall.start.x * zoom + pan.x, wall.start.y * zoom + pan.y);
    ctx.lineTo(wall.end.x * zoom + pan.x, wall.end.y * zoom + pan.y);
    ctx.stroke();
  }, [zoom, pan]);

  const redrawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw grid
    drawGrid(ctx, canvas);
    
    // Draw rooms
    designData.rooms.forEach(room => drawRoom(ctx, room));
    
    // Draw walls
    designData.walls.forEach(wall => drawWall(ctx, wall));
    
    // Draw furniture
    designData.furniture.forEach(furniture => drawFurniture(ctx, furniture));
    
    // Draw current drawing
    if (isDrawing && currentPoints.length > 0) {
      ctx.strokeStyle = '#2196F3';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      
      ctx.beginPath();
      const firstPoint = currentPoints[0];
      ctx.moveTo(firstPoint.x * zoom + pan.x, firstPoint.y * zoom + pan.y);
      
      currentPoints.slice(1).forEach(point => {
        ctx.lineTo(point.x * zoom + pan.x, point.y * zoom + pan.y);
      });
      
      ctx.stroke();
      ctx.setLineDash([]);
    }
  }, [designData, drawGrid, drawRoom, drawWall, drawFurniture, isDrawing, currentPoints, zoom, pan]);

  // Canvas event handlers
  const getCanvasPoint = (e: React.MouseEvent<HTMLCanvasElement>): Point => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left - pan.x) / zoom;
    const y = (e.clientY - rect.top - pan.y) / zoom;
    
    // Snap to grid
    const gridSize = designData.gridSize;
    return {
      x: Math.round(x / gridSize) * gridSize,
      y: Math.round(y / gridSize) * gridSize
    };
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const point = getCanvasPoint(e);
    
    if (tool === 'room') {
      if (!isDrawing) {
        setIsDrawing(true);
        setCurrentPoints([point]);
      } else {
        setCurrentPoints(prev => [...prev, point]);
      }
    } else if (tool === 'furniture') {
      // Add furniture at clicked position
      const furnitureType = furnitureTypes[0]; // Default to sofa
      const newFurniture: Furniture = {
        id: Date.now().toString(),
        type: furnitureType.type,
        name: furnitureType.name,
        x: point.x,
        y: point.y,
        width: furnitureType.width,
        height: furnitureType.height,
        rotation: 0,
        color: '#8BC34A',
        price: furnitureType.price
      };
      
      addToHistory({
        ...designData,
        furniture: [...designData.furniture, newFurniture]
      });
    }
  };

  const handleCanvasDoubleClick = () => {
    if (tool === 'room' && isDrawing && currentPoints.length >= 3) {
      // Complete room
      const area = calculatePolygonArea(currentPoints);
      const newRoom: Room = {
        id: Date.now().toString(),
        name: `Room ${designData.rooms.length + 1}`,
        points: currentPoints,
        color: roomTypes[0].color,
        area,
        type: roomTypes[0].type
      };
      
      addToHistory({
        ...designData,
        rooms: [...designData.rooms, newRoom]
      });
      
      setIsDrawing(false);
      setCurrentPoints([]);
      setTool('select');
    }
  };

  const calculatePolygonArea = (points: Point[]): number => {
    if (points.length < 3) return 0;
    
    let area = 0;
    for (let i = 0; i < points.length; i++) {
      const j = (i + 1) % points.length;
      area += points[i].x * points[j].y;
      area -= points[j].x * points[i].y;
    }
    
    return Math.abs(area) / 2 / (designData.scale * designData.scale); // Convert to square feet
  };

  const addToHistory = (newData: DesignData) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newData);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    setDesignData(newData);
  };

  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setDesignData(history[historyIndex - 1]);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setDesignData(history[historyIndex + 1]);
    }
  };

  const calculateTotalCost = (): number => {
    const furnitureCost = designData.furniture.reduce((total, item) => total + item.price, 0);
    const roomCost = designData.rooms.reduce((total, room) => {
      // Basic cost per square foot based on room type
      const costPerSqFt = {
        living: 1500,
        bedroom: 1200,
        kitchen: 2000,
        bathroom: 1800,
        dining: 1300,
        study: 1100
      };
      return total + (room.area * (costPerSqFt[room.type as keyof typeof costPerSqFt] || 1200));
    }, 0);
    
    return furnitureCost + roomCost;
  };

  const deleteFurniture = (id: string) => {
    addToHistory({
      ...designData,
      furniture: designData.furniture.filter(f => f.id !== id)
    });
    setSelectedItem(null);
  };

  const deleteRoom = (id: string) => {
    addToHistory({
      ...designData,
      rooms: designData.rooms.filter(r => r.id !== id)
    });
    setSelectedItem(null);
  };

  // Canvas resize
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const resizeCanvas = () => {
      const container = canvas.parentElement;
      if (container) {
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;
        redrawCanvas();
      }
    };
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, [redrawCanvas]);

  // Redraw canvas when data changes
  useEffect(() => {
    redrawCanvas();
  }, [redrawCanvas]);

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-full px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/my-projects')}
                className="flex items-center text-primary-600 hover:text-primary-700"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Projects
              </button>
              <h1 className="text-2xl font-bold text-secondary-800">2D Home Designer</h1>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={undo}
                disabled={historyIndex === 0}
                className="p-2 text-gray-600 hover:text-gray-800 disabled:opacity-50"
                title="Undo"
              >
                <Undo className="w-5 h-5" />
              </button>
              <button
                onClick={redo}
                disabled={historyIndex === history.length - 1}
                className="p-2 text-gray-600 hover:text-gray-800 disabled:opacity-50"
                title="Redo"
              >
                <Redo className="w-5 h-5" />
              </button>
              <button
                onClick={() => setShowCostPanel(!showCostPanel)}
                className={`p-2 rounded-lg transition-colors ${
                  showCostPanel ? 'bg-primary-100 text-primary-600' : 'text-gray-600 hover:text-gray-800'
                }`}
                title="Cost Estimation"
              >
                <Calculator className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Left Toolbar */}
        <div className="w-64 bg-white shadow-sm border-r p-4 space-y-6">
          {/* Tools */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Tools</h3>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setTool('select')}
                className={`p-3 rounded-lg border transition-colors ${
                  tool === 'select' ? 'bg-primary-100 border-primary-300 text-primary-700' : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                <Move className="w-5 h-5 mx-auto mb-1" />
                <span className="text-xs">Select</span>
              </button>
              <button
                onClick={() => setTool('room')}
                className={`p-3 rounded-lg border transition-colors ${
                  tool === 'room' ? 'bg-primary-100 border-primary-300 text-primary-700' : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                <Square className="w-5 h-5 mx-auto mb-1" />
                <span className="text-xs">Room</span>
              </button>
            </div>
          </div>

          {/* Room Types */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Room Types</h3>
            <div className="space-y-2">
              {roomTypes.map(roomType => (
                <div
                  key={roomType.type}
                  className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-50"
                >
                  <div
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: roomType.color }}
                  />
                  <span className="text-sm">{roomType.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Furniture */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Furniture</h3>
            <div className="space-y-2">
              {furnitureTypes.map(furnitureType => {
                const IconComponent = furnitureType.icon;
                return (
                  <button
                    key={furnitureType.type}
                    onClick={() => setTool('furniture')}
                    className="w-full flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 text-left"
                  >
                    <IconComponent className="w-4 h-4 text-gray-600" />
                    <div className="flex-1">
                      <div className="text-sm font-medium">{furnitureType.name}</div>
                      <div className="text-xs text-gray-500">₹{furnitureType.price.toLocaleString()}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* View Options */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">View</h3>
            <div className="space-y-2">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={showGrid}
                  onChange={(e) => setShowGrid(e.target.checked)}
                  className="rounded border-gray-300"
                />
                <span className="text-sm">Show Grid</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={showRuler}
                  onChange={(e) => setShowRuler(e.target.checked)}
                  className="rounded border-gray-300"
                />
                <span className="text-sm">Show Ruler</span>
              </label>
            </div>
          </div>
        </div>

        {/* Main Canvas Area */}
        <div className="flex-1 relative">
          <canvas
            ref={canvasRef}
            onClick={handleCanvasClick}
            onDoubleClick={handleCanvasDoubleClick}
            className="w-full h-full cursor-crosshair"
            style={{ cursor: tool === 'select' ? 'default' : 'crosshair' }}
          />
          
          {/* Zoom Controls */}
          <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-2 flex items-center space-x-2">
            <button
              onClick={() => setZoom(Math.max(0.5, zoom - 0.1))}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="text-sm font-medium w-12 text-center">{Math.round(zoom * 100)}%</span>
            <button
              onClick={() => setZoom(Math.min(3, zoom + 0.1))}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Instructions */}
          {tool === 'room' && (
            <div className="absolute top-4 left-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-800">
                {isDrawing 
                  ? 'Click to add points. Double-click to finish room.'
                  : 'Click to start drawing a room.'
                }
              </p>
            </div>
          )}
        </div>

        {/* Right Panel - Properties & Cost */}
        <div className="w-80 bg-white shadow-sm border-l">
          {/* Properties Panel */}
          <div className="p-4 border-b">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Properties</h3>
            
            {selectedItem ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Selected Item</span>
                  <button
                    onClick={() => {
                      const furniture = designData.furniture.find(f => f.id === selectedItem);
                      const room = designData.rooms.find(r => r.id === selectedItem);
                      
                      if (furniture) deleteFurniture(selectedItem);
                      if (room) deleteRoom(selectedItem);
                    }}
                    className="p-1 text-red-500 hover:bg-red-50 rounded"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-500">Select an item to edit properties</p>
            )}
          </div>

          {/* Rooms List */}
          <div className="p-4 border-b">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Rooms</h3>
            <div className="space-y-2">
              {designData.rooms.map(room => (
                <div
                  key={room.id}
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center space-x-2">
                    <div
                      className="w-3 h-3 rounded"
                      style={{ backgroundColor: room.color }}
                    />
                    <span className="text-sm font-medium">{room.name}</span>
                  </div>
                  <span className="text-xs text-gray-500">{room.area.toFixed(1)} sq ft</span>
                </div>
              ))}
            </div>
          </div>

          {/* Furniture List */}
          <div className="p-4 border-b">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Furniture</h3>
            <div className="space-y-2">
              {designData.furniture.map(furniture => (
                <div
                  key={furniture.id}
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50"
                >
                  <span className="text-sm font-medium">{furniture.name}</span>
                  <span className="text-xs text-gray-500">₹{furniture.price.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Cost Estimation */}
          <div className="p-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <IndianRupee className="w-5 h-5 mr-2" />
              Cost Estimation
            </h3>
            
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>Furniture Cost:</span>
                <span>₹{designData.furniture.reduce((total, item) => total + item.price, 0).toLocaleString()}</span>
              </div>
              
              <div className="flex justify-between text-sm">
                <span>Room Design Cost:</span>
                <span>₹{designData.rooms.reduce((total, room) => {
                  const costPerSqFt = {
                    living: 1500,
                    bedroom: 1200,
                    kitchen: 2000,
                    bathroom: 1800,
                    dining: 1300,
                    study: 1100
                  };
                  return total + (room.area * (costPerSqFt[room.type as keyof typeof costPerSqFt] || 1200));
                }, 0).toLocaleString()}</span>
              </div>
              
              <div className="border-t pt-3">
                <div className="flex justify-between font-semibold">
                  <span>Total Estimated Cost:</span>
                  <span className="text-primary-600">₹{calculateTotalCost().toLocaleString()}</span>
                </div>
              </div>
              
              <div className="text-xs text-gray-500 mt-2">
                * This is a rough estimation. Actual costs may vary based on materials, labor, and location.
              </div>
              
              <button className="w-full btn-primary mt-4">
                Get Detailed Quote
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DesignTool;