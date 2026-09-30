import React from 'react';
import { X, Hand, Sparkles, Orbit, Compass, MousePointer } from 'lucide-react';

interface GestureGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GestureGuideModal: React.FC<GestureGuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-slate-950/95 border border-white/10 rounded-3xl shadow-2xl p-6 text-slate-200 overflow-hidden">
        {/* Ambient glow accent */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-violet-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div>
            <h2 className="text-lg font-bold text-white font-sans tracking-wide">
              Control Gestual por Visión Artificial
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Rastreo en tiempo real a ~30 FPS desacoplado del motor WebGL a 60 FPS
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Gestures List */}
        <div className="py-4 space-y-3.5 text-xs">
          <div className="flex items-start gap-3.5 p-3 rounded-2xl bg-white/[0.03] border border-white/5">
            <span className="text-2xl select-none">🖐️</span>
            <div>
              <div className="font-semibold text-slate-100 text-sm">
                Palma de la Mano Abierta
              </div>
              <p className="text-slate-400 mt-0.5 leading-relaxed">
                Extiende completamente los 5 dedos respecto a la palma. Dispara una onda
                expansiva de dispersión y regenera la dinámica procedural de la figura actual.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5 p-3 rounded-2xl bg-white/[0.03] border border-white/5">
            <span className="text-2xl select-none">✌️</span>
            <div>
              <div className="font-semibold text-slate-100 text-sm">
                Signo de la Paz (Gesto "V")
              </div>
              <p className="text-slate-400 mt-0.5 leading-relaxed">
                Extiende los dedos índice y medio mientras anular y meñique permanecen
                contraídos. Conmuta suavemente en la GPU (morphing con función mix()) hacia la
                siguiente plantilla 3D.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5 p-3 rounded-2xl bg-white/[0.03] border border-white/5">
            <span className="text-2xl select-none">👐</span>
            <div>
              <div className="font-semibold text-slate-100 text-sm">
                Tensión / Separación de Ambas Manos
              </div>
              <p className="text-slate-400 mt-0.5 leading-relaxed">
                Separa o junta las muñecas (o extiende ampliamente los dedos de una mano).
                Mapea en tiempo real la escala global cósmica, expansión y turbulencia del fluido.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5 p-3 rounded-2xl bg-white/[0.03] border border-white/5">
            <span className="text-2xl select-none">✊</span>
            <div>
              <div className="font-semibold text-slate-100 text-sm">
                Puño Cerrado (Colapso Cósmico)
              </div>
              <p className="text-slate-400 mt-0.5 leading-relaxed">
                Cierra todos los dedos formando un puño. Atrae gravitacionalmente y condensa
                todas las partículas hacia el núcleo.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5 p-3 rounded-2xl bg-white/[0.03] border border-white/5">
            <MousePointer className="w-6 h-6 text-cyan-400 shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold text-slate-100 text-sm">
                Control Manual Alternativo (Sin Cámara)
              </div>
              <p className="text-slate-400 mt-0.5 leading-relaxed">
                Arrastra con el ratón o dedo para rotar la figura en 3D. Usa la rueda para hacer
                zoom, y haz doble clic para activar la onda expansiva de dispersión.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-white/10 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">
            Puedes abrir esta guía en cualquier momento desde el panel.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-medium rounded-xl text-xs transition-colors"
          >
            Comenzar Experiencia
          </button>
        </div>
      </div>
    </div>
  );
};
