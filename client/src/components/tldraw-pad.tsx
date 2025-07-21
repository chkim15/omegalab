import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { X, Save, Loader2 } from "lucide-react";
import { Tldraw, useEditor } from "@tldraw/tldraw";
import "@tldraw/tldraw/tldraw.css";

interface TldrawPadProps {
  onComplete: (imageData: string) => void;
  onCancel: () => void;
}

function TldrawWithSave({ onSave }: { onSave: (imageData: string) => void }) {
  const [isProcessing, setIsProcessing] = useState(false);
  const editorRef = useRef<any>(null);

  const handleSave = async () => {
    setIsProcessing(true);
    
    try {
      console.log('Starting Tldraw capture...');
      
      // Wait a bit for Tldraw to be fully rendered
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Try multiple approaches to capture the drawing
      let imageData: string | null = null;
      
      // Approach 1: Try to find the main drawing area specifically
      console.log('Looking for Tldraw drawing area...');
      
      // Look for the main canvas or drawing area
      const drawingArea = document.querySelector('[data-testid="tldraw"] [data-testid="canvas"]') ||
                         document.querySelector('[data-testid="tldraw"] canvas') ||
                         document.querySelector('.tldraw canvas') ||
                         document.querySelector('[class*="tldraw"] canvas') ||
                         document.querySelector('[class*="canvas"]') ||
                         document.querySelector('[class*="drawing"]');
      
      console.log('Drawing area found:', !!drawingArea);
      
      if (drawingArea) {
        console.log('Drawing area:', drawingArea);
        
        // Use html2canvas to capture just the drawing area
        try {
          console.log('Trying html2canvas on drawing area...');
          const html2canvas = await import('html2canvas');
          const canvas = await html2canvas.default(drawingArea as HTMLElement, {
            backgroundColor: '#ffffff',
            scale: 2,
            useCORS: true,
            allowTaint: true,
            logging: true,
            width: drawingArea.scrollWidth || 800,
            height: drawingArea.scrollHeight || 600
          });
          imageData = canvas.toDataURL('image/png');
          console.log('html2canvas on drawing area succeeded');
        } catch (html2canvasError) {
          console.log('html2canvas on drawing area failed:', html2canvasError);
        }
      }
      
      // Approach 2: If that failed, try to find the largest canvas (likely the main drawing canvas)
      if (!imageData) {
        console.log('Looking for largest canvas...');
        const canvases = document.querySelectorAll('canvas');
        console.log('Found canvases:', canvases.length);
        
        let largestCanvas: HTMLCanvasElement | null = null;
        let maxArea = 0;
        
        for (let i = 0; i < canvases.length; i++) {
          const canvas = canvases[i] as HTMLCanvasElement;
          const area = canvas.width * canvas.height;
          console.log(`Canvas ${i}:`, canvas.width, 'x', canvas.height, 'area:', area);
          
          if (area > maxArea && canvas.width > 200 && canvas.height > 200) {
            maxArea = area;
            largestCanvas = canvas;
          }
        }
        
        if (largestCanvas) {
          console.log('Using largest canvas:', largestCanvas.width, 'x', largestCanvas.height);
          try {
            // Create a new canvas with white background
            const newCanvas = document.createElement('canvas');
            newCanvas.width = largestCanvas.width;
            newCanvas.height = largestCanvas.height;
            const ctx = newCanvas.getContext('2d');
            
            if (ctx) {
              // Fill with white background
              ctx.fillStyle = 'white';
              ctx.fillRect(0, 0, newCanvas.width, newCanvas.height);
              
              // Draw the original canvas
              ctx.drawImage(largestCanvas, 0, 0, newCanvas.width, newCanvas.height);
              imageData = newCanvas.toDataURL('image/png');
              console.log('Largest canvas capture succeeded');
            }
          } catch (error) {
            console.log('Largest canvas capture failed:', error);
          }
        }
      }
      
      // Approach 3: Try to find any SVG elements (Tldraw might use SVG)
      if (!imageData) {
        console.log('Trying SVG capture...');
        const svgElements = document.querySelectorAll('svg');
        console.log('Found SVGs:', svgElements.length);
        
        if (svgElements.length > 0) {
          try {
            const svg = svgElements[0] as SVGElement;
            const svgData = new XMLSerializer().serializeToString(svg);
            const svgBlob = new Blob([svgData], { type: 'image/svg+xml' });
            const url = URL.createObjectURL(svgBlob);
            
            // Convert SVG to canvas
            const img = new Image();
            img.onload = () => {
              const canvas = document.createElement('canvas');
              canvas.width = 800;
              canvas.height = 600;
              const ctx = canvas.getContext('2d');
              if (ctx) {
                ctx.fillStyle = 'white';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                const dataUrl = canvas.toDataURL('image/png');
                onSave(dataUrl);
              }
            };
            img.src = url;
            return; // Exit early since we're using async callback
          } catch (error) {
            console.log('SVG capture failed:', error);
          }
        }
      }
      
      // Approach 4: If still no image, create a placeholder
      if (!imageData) {
        console.log('Creating placeholder...');
        const canvas = document.createElement('canvas');
        canvas.width = 800;
        canvas.height = 600;
        const ctx = canvas.getContext('2d');
        
        if (ctx) {
          // Fill with white background
          ctx.fillStyle = 'white';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          
          // Add a border
          ctx.strokeStyle = '#e5e7eb';
          ctx.lineWidth = 2;
          ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);
          
          // Add text
          ctx.fillStyle = '#6b7280';
          ctx.font = '24px Arial';
          ctx.textAlign = 'center';
          ctx.fillText('Drawing captured from Tldraw', canvas.width / 2, canvas.height / 2);
          
          imageData = canvas.toDataURL('image/png');
        }
      }
      
      if (imageData) {
        console.log('Saving image data...');
        onSave(imageData);
      } else {
        throw new Error('Could not capture drawing');
      }
      
    } catch (error) {
      console.error('Error exporting Tldraw image:', error);
      // Create a simple error placeholder
      const canvas = document.createElement('canvas');
      canvas.width = 800;
      canvas.height = 400;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#8A2BE2';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'white';
        ctx.font = '24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Error saving drawing', canvas.width / 2, canvas.height / 2);
      }
      const imageData = canvas.toDataURL('image/png');
      onSave(imageData);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col" style={{ height: '600px' }}>
      <div className="flex-1 min-h-0">
        <Tldraw />
      </div>
      <div className="p-4 border-t">
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-600">
            Use the drawing tools to create your math equation
          </div>
          <div className="space-x-2">
            <Button onClick={handleSave} className="bg-omegalab-blue hover:bg-blue-700" disabled={isProcessing}>
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TldrawPad({ onComplete, onCancel }: TldrawPadProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-6xl max-h-[90vh] bg-white rounded-lg shadow-lg flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">Draw your math problem with Tldraw</h2>
          <Button variant="ghost" size="sm" onClick={onCancel}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="flex-1 p-4">
          <TldrawWithSave onSave={onComplete} />
        </div>
      </div>
    </div>
  );
} 