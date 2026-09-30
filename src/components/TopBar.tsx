import React from 'react';
import { Camera, HelpCircle, Sparkles, Video, Volume2 } from 'lucide-react';
import { ShapeType } from '../types';

interface TopBarProps {
  currentShape: ShapeType;
  onSelectShape: (shape: ShapeType) => void;
  onOpenGuide: () => void;
  onToggleWebcam: () => void;
  isWebcamActive: boolean;
}

export const TopBar: React.FC<TopBarProps> = ({
  currentShape,
  onSelectShape,
  onOpenGuide,
  onToggleWebcam,
  isWebcamActive,
}) => {
  const shapes: Array<{ id: ShapeType; label: string }> = [
    { id: 'heart', label: 'Corazón' },
    { id: 'flower', label: 'Loto' },
    { id: 'saturn', label: 'Saturno' },
    { id: 'buddha', label: 'Buda' },
    { id: 'fireworks', label: 'Fuegos' },
    { id: 'galaxy', label: 'Galaxia' },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-30 flex items-center justify-between px-6 py-3.5 border-b border-white/10 bg-slate-950/70 backdrop-blur-xl">
      {/* Zone 1: Single text element wordmark */}
      <div className="flex items-center gap-3">
        <a href="/" className="text-lg font-bold tracking-tight text-white font-sans flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse shadow-sm shadow-cyan-400" />
          <span>Aetheria</span>
        </a>
        <span className="hidden sm:inline text-xs text-slate-500 font-mono">
          / 3D Particle Vision
        </span>
      </div>

      {/* Zone 2: Clean single-line quick shape navigation links */}
      <nav className="hidden md:flex items-center gap-1.5 p-1 bg-white/[0.04] border border-white/10 rounded-xl">
        {shapes.map((item) => (
          <button
            key={item.id}
            onClick={() => onSelectShape(item.id)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
              currentShape === item.id
                ? 'bg-cyan-500/20 text-cyan-300 shadow-sm border border-cyan-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent'
            }`}
          >
            {item.label}
          </button>
        ))}
      </nav>

      {/* Zone 3: 1-2 primary actions */}
      <div className="flex items-center gap-2.5">
        <button
          onClick={onOpenGuide}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-colors whitespace-nowrap"
          title="Ver gestos y atajos"
        >
          <HelpCircle className="w-3.5 h-3.5 text-cyan-400" />
          <span className="hidden sm:inline">Guía de Gestos</span>
        </button>

        <button
          onClick={onToggleWebcam}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-all shadow-lg whitespace-nowrap ${
            isWebcamActive
              ? 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-cyan-950/60'
              : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-950/60'
          }`}
        >
          <Camera className="w-3.5 h-3.5" />
          <span>{isWebcamActive ? 'Cámara Activa' : 'Encender Visión'}</span>
        </button>
      </div>
    </header>
  );
};
