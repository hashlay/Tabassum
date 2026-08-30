import React, { useEffect, useRef, useState } from 'react';
import { renderPosterToCanvas } from '../utils/posterRenderer';
import { useFestival } from '../context/FestivalContext';

interface PosterImageProps {
  competitionId: string;
  eventName: string;
  category: string;
  compIndex: number;
  results: any[];
  className?: string;
  onLoadUrl?: (url: string) => void;
}

export const PosterImage: React.FC<PosterImageProps> = ({ 
  eventName, category, compIndex, results, className = '', onLoadUrl 
}) => {
  const { eventSettings } = useFestival();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dataUrl, setDataUrl] = useState<string>('');

  const onLoadRef = useRef(onLoadUrl);
  onLoadRef.current = onLoadUrl;

  useEffect(() => {
    let active = true;
    const generate = async () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      try {
        await renderPosterToCanvas(
          canvas,
          results,
          eventSettings,
          eventName,
          category,
          compIndex
        );
        
        if (!active) return;
        // Use compressed WebP format for grid preview images (80% bandwidth reduction)
        const url = canvas.toDataURL('image/webp', 0.78) || canvas.toDataURL('image/jpeg', 0.80);
        setDataUrl(url);
        if (onLoadRef.current) onLoadRef.current(url);
      } catch (err) {
        console.error("Failed to render poster", err);
      }
    };
    
    generate();

    return () => {
      active = false;
    };
  }, [results, eventSettings, eventName, category, compIndex]);

  return (
    <>
      <canvas ref={canvasRef} style={{ display: 'none' }} />
      {dataUrl ? (
        <img src={dataUrl} alt={`${eventName} Poster`} className={className} loading="lazy" />
      ) : (
        <div className={`flex items-center justify-center bg-[#1A1A1E] text-zinc-600 font-mono text-xs animate-pulse ${className}`}>
          Generating...
        </div>
      )}
    </>
  );
};
