import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Trash2, Edit3 } from 'lucide-react';

interface SignaturePadProps {
  onSignatureChange: (signature: string) => void;
  value?: string;
  width?: number;
  height?: number;
  placeholder?: string;
}

export function SignaturePad({
  onSignatureChange,
  value = '',
  width = 400,
  height = 150,
  placeholder = "Sign here"
}: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  const [lastPoint, setLastPoint] = useState<{ x: number; y: number } | null>(null);
  const [allStrokes, setAllStrokes] = useState<{ x: number; y: number }[][]>([]);
  const [currentStroke, setCurrentStroke] = useState<{ x: number; y: number }[]>([]);

  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas (use logical dimensions, not physical)
    ctx.clearRect(0, 0, width, height);

    // Add white background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    // Add placeholder text if no signature
    if (!hasSignature) {
      ctx.fillStyle = '#9ca3af';
      ctx.font = '14px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(placeholder, width / 2, height / 2);
    }

    // Add border
    ctx.strokeStyle = '#d1d5db';
    ctx.lineWidth = 1;
    ctx.strokeRect(0, 0, width, height);

    // Reset drawing styles
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }, [width, height, hasSignature, placeholder]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Get device pixel ratio for high DPI displays
    const devicePixelRatio = window.devicePixelRatio || 1;

    // Set canvas size with high resolution
    canvas.width = width * devicePixelRatio;
    canvas.height = height * devicePixelRatio;

    // Scale the drawing context so everything draws at the higher resolution
    ctx.scale(devicePixelRatio, devicePixelRatio);

    // Set drawing styles for smooth curves
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // Clear canvas and add placeholder
    clearCanvas();

    // Load existing signature if provided
    if (value) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, width, height);
        setHasSignature(true);
      };
      img.src = value;
    }
  }, [width, height, value, clearCanvas]);

  const getEventPos = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();

    // Use logical dimensions for scaling (not physical canvas dimensions)
    const scaleX = width / rect.width;
    const scaleY = height / rect.height;

    if ('touches' in e) {
      // Touch event
      const touch = e.touches[0] || e.changedTouches[0];
      return {
        x: (touch.clientX - rect.left) * scaleX,
        y: (touch.clientY - rect.top) * scaleY
      };
    } else {
      // Mouse event
      return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY
      };
    }
  };

  const redrawAllStrokes = (ctx: CanvasRenderingContext2D, strokes: { x: number; y: number }[][]) => {
    // Clear canvas first
    ctx.clearRect(0, 0, width, height);

    // Add white background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    // Set drawing styles
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Draw each stroke
    strokes.forEach(stroke => {
      if (stroke.length < 2) return;

      ctx.beginPath();
      ctx.moveTo(stroke[0].x, stroke[0].y);

      if (stroke.length === 2) {
        // For just two points, draw a simple line
        ctx.lineTo(stroke[1].x, stroke[1].y);
      } else {
        // For multiple points, use quadratic curves for smoothness
        for (let i = 1; i < stroke.length - 1; i++) {
          const currentPoint = stroke[i];
          const nextPoint = stroke[i + 1];

          // Calculate control point (midpoint between current and next)
          const controlX = (currentPoint.x + nextPoint.x) / 2;
          const controlY = (currentPoint.y + nextPoint.y) / 2;

          ctx.quadraticCurveTo(currentPoint.x, currentPoint.y, controlX, controlY);
        }

        // Draw to the last point
        const lastPoint = stroke[stroke.length - 1];
        const secondLastPoint = stroke[stroke.length - 2];
        ctx.quadraticCurveTo(secondLastPoint.x, secondLastPoint.y, lastPoint.x, lastPoint.y);
      }

      ctx.stroke();
    });
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear placeholder on first draw
    if (!hasSignature) {
      setHasSignature(true);
    }

    setIsDrawing(true);
    const pos = getEventPos(e);
    setLastPoint(pos);
    setCurrentStroke([pos]);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    if (!isDrawing || !lastPoint) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const pos = getEventPos(e);

    // Only draw if we have moved a minimum distance (reduces jitter)
    const distance = Math.sqrt(
      Math.pow(pos.x - lastPoint.x, 2) + Math.pow(pos.y - lastPoint.y, 2)
    );

    if (distance > 1.5) {
      // Add point to current stroke
      const newStroke = [...currentStroke, pos];
      setCurrentStroke(newStroke);

      // Redraw all strokes including the current one
      const allCurrentStrokes = [...allStrokes, newStroke];
      redrawAllStrokes(ctx, allCurrentStrokes);

      setLastPoint(pos);
    }
  };

  const stopDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    if (!isDrawing) return;

    setIsDrawing(false);
    setLastPoint(null);

    // Add completed stroke to all strokes
    if (currentStroke.length > 0) {
      setAllStrokes(prev => [...prev, currentStroke]);
    }
    setCurrentStroke([]);

    // Save signature as base64
    const canvas = canvasRef.current;
    if (canvas) {
      const signature = canvas.toDataURL('image/png');
      onSignatureChange(signature);
    }
  };

  const clearSignature = () => {
    setHasSignature(false);
    setAllStrokes([]);
    setCurrentStroke([]);
    setLastPoint(null);
    clearCanvas();
    onSignatureChange('');
  };

  return (
    <div className="space-y-2">
      <div className="relative">
        <canvas
          ref={canvasRef}
          className="border border-gray-300 rounded-xl cursor-crosshair touch-none w-full bg-white"
          style={{
            maxWidth: `${width}px`,
            height: 'auto',
            aspectRatio: `${width}/${height}`
          }}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
        />
      </div>

      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={clearSignature}
          className="flex items-center gap-1"
        >
          <Trash2 className="h-3 w-3" />
          Clear
        </Button>
        <div className="flex items-center gap-1 text-xs text-gray-500">
          <Edit3 className="h-3 w-3" />
          Draw your signature above
        </div>
      </div>
    </div>
  );
}
