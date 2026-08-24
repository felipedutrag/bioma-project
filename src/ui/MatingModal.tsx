import React, { useEffect, useState } from 'react';
import type { MutationChoice, SaveState } from '../types/game';
import { GeneStorage } from '../storage/GeneStorage';
import confetti from 'canvas-confetti';
import { Dna, ArrowRight, Zap, EyeOff, Compass, Heart, Wind, VolumeX } from 'lucide-react';

interface MatingModalProps {
  onNextGeneration: () => void;
  lifespanSeconds: number;
}

export const MatingModal: React.FC<MatingModalProps> = ({ onNextGeneration, lifespanSeconds }) => {
  const [mutations, setMutations] = useState<MutationChoice[]>([]);
  const [selectedMutation, setSelectedMutation] = useState<MutationChoice | null>(null);
  const [saveState, setSaveState] = useState<SaveState | null>(null);

  useEffect(() => {
    // Fire celebratory confetti!
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch {
      // ignore
    }

    const randomMuts = GeneStorage.getRandomMutations();
    setMutations(randomMuts);
    setSelectedMutation(randomMuts[0]);

    // Save success to genealogy
    const updatedState = GeneStorage.recordGenerationEnd(lifespanSeconds, '', true);
    setSaveState(updatedState);
  }, [lifespanSeconds]);

  const handleConfirm = () => {
    if (selectedMutation) {
      GeneStorage.applyMutation(selectedMutation);
    }
    onNextGeneration();
  };

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Zap': return <Zap className="w-6 h-6 text-amber-400" />;
      case 'EyeOff': return <EyeOff className="w-6 h-6 text-emerald-400" />;
      case 'Compass': return <Compass className="w-6 h-6 text-sky-400" />;
      case 'Heart': return <Heart className="w-6 h-6 text-rose-400" />;
      case 'Wind': return <Wind className="w-6 h-6 text-cyan-400" />;
      case 'VolumeX': return <VolumeX className="w-6 h-6 text-indigo-400" />;
      default: return <Dna className="w-6 h-6 text-purple-400" />;
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content max-w-xl text-center">
        <div className="flex justify-center mb-2">
          <div className="p-3 bg-pink-500/20 rounded-full border border-pink-400/40 animate-pulse">
            <Heart className="w-8 h-8 text-pink-400 fill-pink-400" />
          </div>
        </div>

        <h2 className="text-2xl font-black text-amber-300 tracking-wide uppercase mb-1">
          Ciclo Reprodutivo Concluído!
        </h2>
        <p className="text-stone-300 text-sm mb-4">
          Você sobreviveu às agruras da savana e gerou uma nova ninhada saudável. A linhagem avança para a{' '}
          <strong className="text-amber-400">Geração #{saveState?.currentGeneration || 2}</strong>!
        </p>

        <div className="my-4 text-left">
          <h3 className="text-xs uppercase tracking-wider text-stone-400 font-semibold mb-2 flex items-center gap-1.5">
            <Dna className="w-4 h-4 text-purple-400" /> Escolha a Mutação Genética Herdada:
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {mutations.map((m) => {
              const isSelected = selectedMutation?.id === m.id;
              return (
                <div
                  key={m.id}
                  onClick={() => setSelectedMutation(m)}
                  className={`mutation-card ${isSelected ? 'selected' : ''}`}
                >
                  <div className="mb-2">{getIcon(m.icon)}</div>
                  <h4 className="font-bold text-stone-100 text-sm mb-1">{m.name}</h4>
                  <p className="text-[12px] text-stone-300 leading-snug">{m.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Current Gene Summary */}
        {saveState && (
          <div className="bg-stone-900/60 border border-stone-800 rounded-lg p-3 mb-4 text-xs text-stone-300 flex justify-around">
            <div>Velocidade: <span className="text-amber-400 font-mono">x{saveState.currentGenes.speedMultiplier}</span></div>
            <div>Camuflagem: <span className="text-emerald-400 font-mono">x{saveState.currentGenes.stealthFactor}</span></div>
            <div>Alcance Faro: <span className="text-sky-400 font-mono">{saveState.currentGenes.scentRange}m</span></div>
          </div>
        )}

        <button onClick={handleConfirm} className="btn-primary w-full py-3 text-base flex items-center justify-center gap-2">
          <span>Assumir Controle do Filhote</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
