import React, { useState, useEffect } from 'react';
import type { SaveState } from '../types/game';
import { GeneStorage } from '../storage/GeneStorage';
import { X, Shield, Dna, Clock, Trophy, RotateCcw } from 'lucide-react';

interface FamilyTreeModalProps {
  onClose: () => void;
}

export const FamilyTreeModal: React.FC<FamilyTreeModalProps> = ({ onClose }) => {
  const [state, setState] = useState<SaveState | null>(null);

  useEffect(() => {
    setState(GeneStorage.loadState());
  }, []);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}m ${s}s`;
  };

  const handleReset = () => {
    if (window.confirm('Tem certeza de que deseja resetar todo o progresso de linhagem?')) {
      const reset = GeneStorage.resetProgress();
      setState(reset);
    }
  };

  if (!state) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content max-w-2xl text-left">
        <div className="flex items-center justify-between border-b border-stone-800 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-emerald-400" />
            <h2 className="text-xl font-bold text-stone-100">Árvore Genealógica & Genética</h2>
          </div>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-100 p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Genetics Overview */}
        <div className="bg-stone-900/90 border border-stone-800 rounded-xl p-4 mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs uppercase font-bold tracking-wider text-amber-400 flex items-center gap-1.5">
              <Dna className="w-4 h-4 text-purple-400" /> Genótipo Ativo (Geração #{state.currentGeneration})
            </span>
            <span className="text-xs text-stone-400">{state.species}</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
            <div className="p-2 bg-stone-800/50 rounded-lg">
              <div className="text-stone-400 text-[10px]">Velocidade</div>
              <div className="font-mono text-amber-400 font-bold">x{state.currentGenes.speedMultiplier}</div>
            </div>
            <div className="p-2 bg-stone-800/50 rounded-lg">
              <div className="text-stone-400 text-[10px]">Camuflagem</div>
              <div className="font-mono text-emerald-400 font-bold">x{state.currentGenes.stealthFactor}</div>
            </div>
            <div className="p-2 bg-stone-800/50 rounded-lg">
              <div className="text-stone-400 text-[10px]">Alcance Faro</div>
              <div className="font-mono text-sky-400 font-bold">{state.currentGenes.scentRange}m</div>
            </div>
            <div className="p-2 bg-stone-800/50 rounded-lg">
              <div className="text-stone-400 text-[10px]">Metabolismo</div>
              <div className="font-mono text-rose-400 font-bold">x{state.currentGenes.metabolismRate}</div>
            </div>
          </div>
        </div>

        {/* Ancestry Log */}
        <h3 className="text-xs uppercase font-semibold text-stone-400 mb-2 flex items-center gap-1">
          <Trophy className="w-3.5 h-3.5 text-amber-400" /> Registro de Gerações Passadas:
        </h3>

        <div className="max-h-60 overflow-y-auto space-y-2 pr-1 custom-scroll">
          {state.familyTree.length === 0 ? (
            <div className="text-center py-6 text-stone-500 text-xs">
              Nenhuma geração registrada ainda. Esta é a primeira linhagem da espécie!
            </div>
          ) : (
            state.familyTree.map((item, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-lg border text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${
                  item.reproduced
                    ? 'bg-emerald-950/20 border-emerald-800/40 text-emerald-300'
                    : 'bg-stone-900/50 border-stone-800 text-stone-300'
                }`}
              >
                <div>
                  <div className="font-bold flex items-center gap-1.5">
                    <span>Geração #{item.gen}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-stone-800 text-stone-300">
                      {item.species}
                    </span>
                  </div>
                  <div className="text-stone-400 text-[11px] mt-0.5">{item.causeOfDeath}</div>
                </div>

                <div className="flex items-center gap-3 text-right">
                  <div className="text-stone-400 text-[11px] flex items-center gap-1">
                    <Clock className="w-3 h-3 text-amber-400" />
                    {formatTime(item.lifespanSeconds)}
                  </div>
                  <div className="text-[11px] font-mono text-stone-400">
                    Vel: x{item.traits.speedMultiplier} | Cam: x{item.traits.stealthFactor}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="flex items-center justify-between mt-4 pt-3 border-t border-stone-800">
          <button onClick={handleReset} className="text-stone-500 hover:text-red-400 text-xs flex items-center gap-1">
            <RotateCcw className="w-3 h-3" /> Resetar Dados
          </button>
          <button onClick={onClose} className="btn-primary py-2 px-5 text-xs">
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
