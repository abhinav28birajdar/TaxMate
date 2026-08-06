'use client';

import React, { useRef, useState } from 'react';
import { Edit3, RotateCcw, CheckCircle2, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

interface DigitalSignatureProps {
  onSave?: (signatureDataUrl: string) => void;
  title?: string;
}

export default function DigitalSignature({ onSave, title = 'Digital E-Signature' }: DigitalSignatureProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSigned, setHasSigned] = useState(false);

  const getCanvasCoordinates = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    const scaleX = canvas.width / (rect.width || 1);
    const scaleY = canvas.height / (rect.height || 1);

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCanvasCoordinates(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCanvasCoordinates(e);
    ctx.lineTo(x, y);
    ctx.strokeStyle = '#84cc16'; // vibrant lime-500 stroke
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();

    setHasSigned(true);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSigned(false);
  };

  const handleSaveSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');
    if (onSave) {
      onSave(dataUrl);
    }
  };

  return (
    <Card className="bg-slate-900/60 border-slate-800">
      <CardHeader>
        <CardTitle className="text-slate-100 flex items-center gap-2">
          <Edit3 className="w-5 h-5 text-lime-400" /> {title}
        </CardTitle>
        <CardDescription className="text-slate-400 text-xs">Draw your digital signature below to sign tax filings or contracts.</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="relative rounded-xl border border-slate-800 bg-slate-950 p-2 overflow-hidden">
          <canvas
            ref={canvasRef}
            width={480}
            height={160}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
            className="w-full h-40 cursor-crosshair touch-none rounded-lg"
          />
          {!hasSigned && (
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center text-xs text-slate-600 font-mono">
              Sign above inside the box
            </div>
          )}
        </div>

        <div className="flex justify-between">
          <Button variant="outline" size="sm" onClick={handleClear} className="border-slate-800 text-slate-400 hover:bg-slate-800">
            <RotateCcw className="w-3.5 h-3.5 mr-1.5" /> Clear
          </Button>
          <Button
            size="sm"
            onClick={handleSaveSignature}
            disabled={!hasSigned}
            className="bg-lime-600 hover:bg-lime-500 text-slate-950 font-bold shadow-sm shadow-lime-600/20"
          >
            <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" /> Save Signature
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
