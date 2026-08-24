import React, { useEffect, useState } from 'react';
import type { SaveState } from '../types/game';
import { GeneStorage } from '../storage/GeneStorage';
import { Skull, RotateCcw, Shield, Clock } from 'lucide-react';

interface GameOverModalProps {
  reason: string;
  lifespanSeconds: number;
  onRestart: () => void;
  onOpenGenealogy: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  reason,
  lifespanSeconds,
  onRestart,
  onOpenGenealogy,
}) => {
  const [saveState, setSaveState] = useState<SaveState | null>(null);

  useEffect(() => {
    const updated = GeneStorage.recordGenerationEnd(lifespanSeconds, reason, false);
    setSaveState(updated);
  }, [lifespanSeconds, reason]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}m ${s}s`;
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content max-w-md text-center">
        <div className="flex justify-center mb-2">
          <div className="p-3 bg-red-500/20 rounded-full border border-red-500/40">
            <Skull className="w-8 h-8 text-red-500" />
          </div>
        </div>

        <h2 className="text-2xl font-black text-red-400 tracking-wide uppercase mb-1">
          Fim do Ciclo de Vida
        </h2>
        <p className="text-stone-300 text-sm mb-4">
          A savana é implacável com os desatentos.
        </p>

        <div className="bg-stone-900/80 border border-stone-800 rounded-xl p-4 mb-5 text-left text-sm space-y-2">
          <div className="flex justify-between border-b border-stone-800 pb-2">
            <span className="text-stone-400">Causa da Morte:</span>
            <span className="text-red-400 font-semibold text-right">{reason}</span>
          </div>
          <div className="flex justify-between border-b border-stone-800 pb-2">
            <span className="text-stone-400">Tempo Sobrevivido:</span>
            <span className="text-amber-300 font-mono flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {formatTime(lifespanSeconds)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-stone-400">Geração Atual:</span>
            <span className="text-stone-100 font-bold">#{saveState?.currentGeneration || 1}</span>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <button
            onClick={onRestart}
            className="btn-primary w-full py-3 flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Renascer Novo Filhote</span>
          </button>

          <button
            onClick={onOpenGenealogy}
            className="btn-glass w-full py-2.5 flex items-center justify-center gap-2 text-stone-300"
          >
            <Shield className="w-4 h-4 text-emerald-400" />
            <span>Ver Árvore Genealógica</span>
          </button>
        </div>
      </div>
    </div>
  );
};
