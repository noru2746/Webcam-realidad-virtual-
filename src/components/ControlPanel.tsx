import React, { useState } from 'react';
import {
  Sparkles,
  Sliders,
  Palette,
  Layers,
  RotateCw,
  Zap,
  Info,
  ChevronRight,
  ChevronLeft,
  Flame,
  Globe2,
  Heart,
  Flower2,
  Sun,
  Activity,
} from 'lucide-react';
import { ShapeType, SimulationConfig, ColorPreset } from '../types';

export const COLOR_PRESETS: ColorPreset[] = [
  {
    id: 'cyber-violet',
    name: 'Cyber Violet',
    colorA: '#8b5cf6',
    colorB: '#06b6d4',
    bgGlow: 'from-violet-950/20 via-cyan-950/20 to-black',
  },
  {
    id: 'solar-flare',
    name: 'Solar Flare',
    colorA: '#f59e0b',
    colorB: '#ef4444',
    bgGlow: 'from-amber-950/20 via-rose-950/20 to-black',
  },
  {
    id: 'mystic-emerald',
    name: 'Mystic Emerald',
    colorA: '#10b981',
    colorB: '#06b6d4',
    bgGlow: 'from-emerald-950/20 via-teal-950/20 to-black',
  },
  {
    id: 'celestial-gold',
    name: 'Celestial Gold',
    colorA: '#fbbf24',
    colorB: '#f43f5e',
    bgGlow: 'from-yellow-950/20 via-rose-950/20 to-black',
  },
  {
    id: 'deep-cosmos',
    name: 'Deep Cosmos',
    colorA: '#3b82f6',
    colorB: '#d946ef',
    bgGlow: 'from-blue-950/20 via-fuchsia-950/20 to-black',
  },
  {
    id: 'supernova-white',
    name: 'Supernova Pure',
    colorA: '#e2e8f0',
    colorB: '#38bdf8',
    bgGlow: 'from-slate-900/30 via-sky-950/20 to-black',
  },
];

interface ControlPanelProps {
  config: SimulationConfig;
  onChangeConfig: (newConfig: Partial<SimulationConfig>) => void;
  onNextShape: () => void;
  onTriggerDispersion: () => void;
  fps: number;
  onOpenGuide: () => void;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  config,
  onChangeConfig,
  onNextShape,
  onTriggerDispersion,
  fps,
  onOpenGuide,
}) => {
  const [isOpen, setIsOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<'shapes' | 'physics' | 'palette'>('shapes');

  const shapes: Array<{ id: ShapeType; label: string; icon: React.ReactNode; desc: string }> = [
    { id: 'heart', label: 'Corazón 3D', icon: <Heart className="w-4 h-4 text-rose-400" />, desc: 'Cardioide volumétrico' },
    { id: 'flower', label: 'Espiral / Flor', icon: <Flower2 className="w-4 h-4 text-emerald-400" />, desc: 'Filotaxis sagrada' },
    { id: 'saturn', label: 'Saturno', icon: <Globe2 className="w-4 h-4 text-amber-400" />, desc: 'Esfera y división Cassini' },
    { id: 'buddha', label: 'Estatua de Buda', icon: <Sun className="w-4 h-4 text-yellow-400" />, desc: 'Meditación y halo aureola' },
    { id: 'fireworks', label: 'Fuegos Artificiales', icon: <Sparkles className="w-4 h-4 text-cyan-400" />, desc: 'Estallido radial con estelas' },
    { id: 'galaxy', label: 'Galaxia Espiral', icon: <Flame className="w-4 h-4 text-purple-400" />, desc: 'Brazos cósmicos logarítmicos' },
  ];

  return (
    <div className={`fixed top-20 left-6 z-20 transition-all duration-300 ${isOpen ? 'w-84' : 'w-12'}`}>
      {/* Toggle button when closed */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center justify-center w-12 h-12 rounded-2xl bg-slate-950/80 hover:bg-slate-900 border border-white/10 text-slate-300 hover:text-white backdrop-blur-xl shadow-2xl transition-colors"
          title="Abrir panel de control"
        >
          <Sliders className="w-5 h-5 text-cyan-400" />
        </button>
      )}

      {/* Expanded Glass Panel */}
      {isOpen && (
        <div className="bg-slate-950/85 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[calc(100vh-6.5rem)]">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-white/[0.02]">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-cyan-400" />
              <h2 className="text-sm font-semibold tracking-wide text-slate-100 font-sans">
                Parámetros de Síntesis
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={onOpenGuide}
                className="p-1.5 text-slate-400 hover:text-cyan-300 rounded-lg hover:bg-white/5 transition-colors"
                title="Guía de gestos"
              >
                <Info className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-white/5 transition-colors"
                title="Minimizar panel"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Action Trigger Buttons */}
          <div className="grid grid-cols-2 gap-2 p-3 bg-white/[0.01] border-b border-white/5">
            <button
              onClick={onTriggerDispersion}
              className="flex items-center justify-center gap-1.5 px-3 py-2 bg-gradient-to-r from-amber-500/20 to-rose-500/20 hover:from-amber-500/30 hover:to-rose-500/30 border border-amber-500/30 rounded-xl text-amber-200 text-xs font-medium transition-all group"
              title="Disparar onda expansiva (Equivalente al gesto de Palma Abierta)"
            >
              <Zap className="w-3.5 h-3.5 text-amber-400 group-hover:scale-110 transition-transform" />
              <span>Regenerar (Palma)</span>
            </button>
            <button
              onClick={onNextShape}
              className="flex items-center justify-center gap-1.5 px-3 py-2 bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 hover:from-emerald-500/30 hover:to-cyan-500/30 border border-emerald-500/30 rounded-xl text-emerald-200 text-xs font-medium transition-all group"
              title="Conmutar a la siguiente figura (Equivalente al gesto V - Paz)"
            >
              <ChevronRight className="w-3.5 h-3.5 text-emerald-400 group-hover:translate-x-0.5 transition-transform" />
              <span>Siguiente (Gesto V)</span>
            </button>
          </div>

          {/* Subtabs Navigation */}
          <div className="flex border-b border-white/10 px-3 pt-2 gap-1 bg-black/20">
            <button
              onClick={() => setActiveTab('shapes')}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-t-lg transition-colors border-b-2 ${
                activeTab === 'shapes'
                  ? 'text-cyan-300 border-cyan-400 bg-white/5'
                  : 'text-slate-400 hover:text-slate-200 border-transparent'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Plantillas</span>
            </button>
            <button
              onClick={() => setActiveTab('physics')}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-t-lg transition-colors border-b-2 ${
                activeTab === 'physics'
                  ? 'text-cyan-300 border-cyan-400 bg-white/5'
                  : 'text-slate-400 hover:text-slate-200 border-transparent'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Física & GPU</span>
            </button>
            <button
              onClick={() => setActiveTab('palette')}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-t-lg transition-colors border-b-2 ${
                activeTab === 'palette'
                  ? 'text-cyan-300 border-cyan-400 bg-white/5'
                  : 'text-slate-400 hover:text-slate-200 border-transparent'
              }`}
            >
              <Palette className="w-3.5 h-3.5" />
              <span>Color</span>
            </button>
          </div>

          {/* Tab Content Body */}
          <div className="p-4 space-y-4 overflow-y-auto flex-1 custom-scrollbar text-xs">
            {/* 1. Shapes Tab */}
            {activeTab === 'shapes' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-slate-400 pb-1">
                  <span>Malla Activa</span>
                  <span className="text-[11px] text-cyan-400 font-mono">
                    {shapes.findIndex((s) => s.id === config.shape) + 1} / {shapes.length}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {shapes.map((item) => {
                    const isSelected = config.shape === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => onChangeConfig({ shape: item.id })}
                        className={`flex flex-col items-start p-2.5 rounded-xl border text-left transition-all ${
                          isSelected
                            ? 'bg-cyan-500/15 border-cyan-400 text-white shadow-lg shadow-cyan-950/50'
                            : 'bg-white/[0.02] border-white/10 text-slate-300 hover:bg-white/5 hover:border-white/20'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 mb-1">
                          {item.icon}
                          <span className="font-semibold text-xs">{item.label}</span>
                        </div>
                        <span className="text-[10px] text-slate-400 line-clamp-1">{item.desc}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Particle Count Scaling Presets */}
                <div className="pt-3 border-t border-white/10 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-300 font-medium">Partículas en GPU:</span>
                    <span className="text-cyan-400 font-mono tabular-nums font-semibold">
                      {config.particleCount.toLocaleString()}
                    </span>
                  </div>
                  <div className="grid grid-cols-4 gap-1.5">
                    {[25000, 50000, 75000, 100000].map((count) => (
                      <button
                        key={count}
                        onClick={() => onChangeConfig({ particleCount: count })}
                        className={`py-1.5 rounded-lg font-mono text-[11px] border transition-colors ${
                          config.particleCount === count
                            ? 'bg-cyan-600 text-white border-cyan-400'
                            : 'bg-slate-900 border-white/10 text-slate-400 hover:text-white'
                        }`}
                      >
                        {count / 1000}k
                      </button>
                    ))}
                  </div>
                  <p className="text-[10px] text-slate-500">
                    Ajustado dinámicamente según la capacidad de tu GPU.
                  </p>
                </div>
              </div>
            )}

            {/* 2. Physics & GPU Tab */}
            {activeTab === 'physics' && (
              <div className="space-y-3.5">
                {/* Turbulence Slider */}
                <div className="space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-slate-300">Turbulencia de Fluido:</span>
                    <span className="font-mono text-cyan-400 tabular-nums">
                      {config.turbulence.toFixed(2)}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1.5"
                    step="0.05"
                    value={config.turbulence}
                    onChange={(e) => onChangeConfig({ turbulence: parseFloat(e.target.value) })}
                    className="w-full accent-cyan-400 bg-slate-800 h-1.5 rounded-lg cursor-pointer"
                  />
                </div>

                {/* Cosmic Scale Slider */}
                <div className="space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-slate-300">Escala Espacial:</span>
                    <span className="font-mono text-cyan-400 tabular-nums">
                      {config.scale.toFixed(2)}x
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.4"
                    max="1.8"
                    step="0.05"
                    value={config.scale}
                    onChange={(e) => onChangeConfig({ scale: parseFloat(e.target.value) })}
                    className="w-full accent-cyan-400 bg-slate-800 h-1.5 rounded-lg cursor-pointer"
                  />
                </div>

                {/* Particle Size */}
                <div className="space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-slate-300">Tamaño / Brillo:</span>
                    <span className="font-mono text-cyan-400 tabular-nums">
                      {config.pointSize.toFixed(1)}px
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.8"
                    max="4.0"
                    step="0.2"
                    value={config.pointSize}
                    onChange={(e) => onChangeConfig({ pointSize: parseFloat(e.target.value) })}
                    className="w-full accent-cyan-400 bg-slate-800 h-1.5 rounded-lg cursor-pointer"
                  />
                </div>

                {/* Hand Magnetic Attraction */}
                <div className="flex items-center justify-between pt-2 border-t border-white/10">
                  <span className="text-slate-300">Atracción Magnética de Mano:</span>
                  <button
                    onClick={() => onChangeConfig({ handAttraction: !config.handAttraction })}
                    className={`px-2.5 py-1 rounded-lg border text-[11px] font-medium transition-colors ${
                      config.handAttraction
                        ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                        : 'bg-slate-900 border-white/10 text-slate-400'
                    }`}
                  >
                    {config.handAttraction ? 'Activado' : 'Desactivado'}
                  </button>
                </div>

                {/* Auto Rotate */}
                <div className="flex items-center justify-between pt-1">
                  <span className="text-slate-300">Rotación Automática:</span>
                  <button
                    onClick={() => onChangeConfig({ autoRotate: !config.autoRotate })}
                    className={`px-2.5 py-1 rounded-lg border text-[11px] font-medium transition-colors ${
                      config.autoRotate
                        ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
                        : 'bg-slate-900 border-white/10 text-slate-400'
                    }`}
                  >
                    {config.autoRotate ? 'En Giro' : 'Fijo'}
                  </button>
                </div>
              </div>
            )}

            {/* 3. Palette & Color Tab */}
            {activeTab === 'palette' && (
              <div className="space-y-3">
                <span className="text-slate-300 block">Espectros Cromáticos:</span>
                <div className="grid grid-cols-2 gap-2">
                  {COLOR_PRESETS.map((preset) => {
                    const isSelected = config.activePresetId === preset.id;
                    return (
                      <button
                        key={preset.id}
                        onClick={() =>
                          onChangeConfig({
                            activePresetId: preset.id,
                            colorA: preset.colorA,
                            colorB: preset.colorB,
                          })
                        }
                        className={`flex items-center gap-2 p-2 rounded-xl border text-left transition-all ${
                          isSelected
                            ? 'bg-white/10 border-cyan-400 shadow-md'
                            : 'bg-slate-900/60 border-white/5 hover:border-white/20'
                        }`}
                      >
                        <div className="flex items-center -space-x-1 shrink-0">
                          <span
                            className="w-3.5 h-3.5 rounded-full border border-black/40 shadow-sm"
                            style={{ backgroundColor: preset.colorA }}
                          />
                          <span
                            className="w-3.5 h-3.5 rounded-full border border-black/40 shadow-sm"
                            style={{ backgroundColor: preset.colorB }}
                          />
                        </div>
                        <span className="text-xs font-medium text-slate-200 truncate">
                          {preset.name}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Custom dual color picker */}
                <div className="pt-3 border-t border-white/10 space-y-2">
                  <span className="text-slate-300 block">Personalizar Gradiente GPU:</span>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={config.colorA}
                        onChange={(e) =>
                          onChangeConfig({ colorA: e.target.value, activePresetId: 'custom' })
                        }
                        className="w-7 h-7 rounded-lg cursor-pointer bg-transparent border-0"
                      />
                      <span className="text-[11px] font-mono text-slate-400 uppercase">
                        {config.colorA}
                      </span>
                    </div>
                    <span className="text-slate-600">→</span>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={config.colorB}
                        onChange={(e) =>
                          onChangeConfig({ colorB: e.target.value, activePresetId: 'custom' })
                        }
                        className="w-7 h-7 rounded-lg cursor-pointer bg-transparent border-0"
                      />
                      <span className="text-[11px] font-mono text-slate-400 uppercase">
                        {config.colorB}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer Status Bar */}
          <div className="px-4 py-2.5 bg-black/40 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
              <span>Motor WebGL</span>
            </div>
            <div className="flex items-center gap-2 font-mono tabular-nums">
              <span className={fps >= 55 ? 'text-emerald-400' : 'text-amber-400'}>
                {fps} FPS
              </span>
              <span>·</span>
              <span className="text-slate-500">Draw Call: 1</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
