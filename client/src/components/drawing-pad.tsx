import { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { X, Check, RotateCcw } from "lucide-react";

interface DrawingPadProps {
  onComplete: (drawingData: string) => void;
  onCancel: () => void;
}

export default function DrawingPad({ onComplete, onCancel }: DrawingPadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [context, setContext] = useState<CanvasRenderingContext2D | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.strokeStyle = "#000000";
        ctx.lineWidth = 2;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        setContext(ctx);
        
        // Set canvas size
        canvas.width = 600;
        canvas.height = 400;
        
        // Fill with white background
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
    }
  }, []);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!context) return;
    
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      context.beginPath();
      context.moveTo(x, y);
      setIsDrawing(true);
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !context) return;
    
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      context.lineTo(x, y);
      context.stroke();
    }
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    if (context && canvasRef.current) {
      context.fillStyle = "white";
      context.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }
  };

  const handleComplete = () => {
    if (canvasRef.current) {
      const dataURL = canvasRef.current.toDataURL();
      onComplete(dataURL);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-4xl mx-4">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Draw your math problem</CardTitle>
          <Button variant="ghost" size="sm" onClick={onCancel}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <canvas
              ref={canvasRef}
              className="border border-gray-300 rounded-lg w-full cursor-crosshair"
              style={{ maxWidth: "100%", height: "auto" }}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
            />
          </div>
          <div className="flex justify-between">
            <Button variant="outline" onClick={clearCanvas}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Clear
            </Button>
            <div className="space-x-2">
              <Button variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <Button onClick={handleComplete} className="bg-omegalab-blue hover:bg-blue-700">
                <Check className="h-4 w-4 mr-2" />
                Done
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
