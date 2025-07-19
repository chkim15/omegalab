import { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { X, Check, RotateCcw, Loader2 } from "lucide-react";

interface DrawingPadProps {
  onComplete: (mathNotation: string) => void;
  onCancel: () => void;
}

export default function DrawingPad({ onComplete, onCancel }: DrawingPadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [context, setContext] = useState<CanvasRenderingContext2D | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.strokeStyle = "#000000";
        ctx.lineWidth = 3;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        setContext(ctx);
        
        // Set canvas size - match the display size for better coordinate mapping
        canvas.width = 800;
        canvas.height = 400;
        
        // Fill with white background
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
    }
  }, []);

  const getCoordinates = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    let clientX, clientY;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!context) return;
    
    const coords = getCoordinates(e);
    if (coords) {
      context.beginPath();
      context.moveTo(coords.x, coords.y);
      setIsDrawing(true);
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !context) return;
    
    const coords = getCoordinates(e);
    if (coords) {
      context.lineTo(coords.x, coords.y);
      context.stroke();
    }
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  // Touch event handlers
  const startDrawingTouch = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    if (!context) return;
    
    const coords = getCoordinates(e);
    if (coords) {
      context.beginPath();
      context.moveTo(coords.x, coords.y);
      setIsDrawing(true);
    }
  };

  const drawTouch = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    if (!isDrawing || !context) return;
    
    const coords = getCoordinates(e);
    if (coords) {
      context.lineTo(coords.x, coords.y);
      context.stroke();
    }
  };

  const stopDrawingTouch = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    if (context && canvasRef.current) {
      context.fillStyle = "white";
      context.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }
  };

  const extractMathNotation = async (imageData: string): Promise<string> => {
    try {
      const response = await fetch('/api/analyze-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: imageData.split(',')[1] // Remove data:image/png;base64, prefix
        })
      });

      if (!response.ok) {
        throw new Error('Failed to analyze drawing');
      }

      const result = await response.json();
      return result.extractedText || "Unable to extract math notation from drawing";
    } catch (error) {
      console.error('Error extracting math notation:', error);
      return "Error processing drawing - please try typing the equation instead";
    }
  };

  const handleComplete = async () => {
    if (canvasRef.current) {
      setIsProcessing(true);
      const dataURL = canvasRef.current.toDataURL('image/png');
      
      try {
        const mathNotation = await extractMathNotation(dataURL);
        onComplete(mathNotation);
      } catch (error) {
        console.error('Error processing drawing:', error);
        onComplete("Error processing drawing - please try again");
      } finally {
        setIsProcessing(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[85vh] overflow-hidden flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between flex-shrink-0">
          <CardTitle>Draw your math problem</CardTitle>
          <Button variant="ghost" size="sm" onClick={onCancel}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col min-h-0">
          <div className="flex-1 mb-4 min-h-0">
            <canvas
              ref={canvasRef}
              className="border border-gray-300 rounded-lg w-full cursor-crosshair bg-white"
              style={{ 
                width: "100%", 
                height: "400px",
                maxHeight: "50vh"
              }}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawingTouch}
              onTouchMove={drawTouch}
              onTouchEnd={stopDrawingTouch}
            />
          </div>
          <div className="flex-shrink-0">
            <div className="flex justify-between items-center">
              <Button variant="outline" onClick={clearCanvas} disabled={isProcessing}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Clear
              </Button>
              <div className="space-x-2">
                <Button variant="outline" onClick={onCancel} disabled={isProcessing}>
                  Cancel
                </Button>
                <Button onClick={handleComplete} className="bg-omegalab-blue hover:bg-blue-700" disabled={isProcessing}>
                  {isProcessing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Converting...
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Convert to Math
                    </>
                  )}
                </Button>
              </div>
            </div>
            <div className="text-xs text-gray-500 mt-2">
              Draw your math equation and we'll convert it to text notation
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
