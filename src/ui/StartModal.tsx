import React from 'react';
import { Play, Footprints, EyeOff, Utensils, Heart } from 'lucide-react';
import { SoundSystem } from '../audio/SoundSystem';

interface StartModalProps {
  onStart: () => void;
  generation: number;
}

export const StartModal: React.FC<StartModalProps> = ({ onStart, generation }) => {
  const handlePlay = () => {
    SoundSystem.init();
    SoundSystem.resume();
    onStart();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content max-w-lg text-center">
        <div className="mb-2">
          <span className="badge-gen">Savanna Stealth & Survival 3D</span>
        </div>

        <h1 className="text-3xl font-black text-amber-400 tracking-wider uppercase mb-1">
          Apex: Ciclo de Sobrevivência
        </h1>
        <p className="text-stone-300 text-xs mb-5 leading-relaxed">
          Você controla um jovem espécime na savana africana. Sobreviva aos predadores de topo,
          alimente-se, gerencie sua estamina e garanta o futuro da sua linhagem genética.
        </p>

        <div className="grid grid-cols-2 gap-3 text-left mb-6">
          <div className="p-3 bg-stone-900/80 border border-stone-800 rounded-xl flex items-start gap-2.5">
            <Utensils className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-stone-100 text-xs">Fome & Sede</h4>
              <p className="text-[11px] text-stone-400">Coma frutas e beba no oásis para atingir a maturidade.</p>
            </div>
          </div>

          <div className="p-3 bg-stone-900/80 border border-stone-800 rounded-xl flex items-start gap-2.5">
            <EyeOff className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-stone-100 text-xs">Furtividade 80%</h4>
              <p className="text-[11px] text-stone-400">Esconda-se nos arbustos para escapar do cone de visão dos predadores.</p>
            </div>
          </div>

          <div className="p-3 bg-stone-900/80 border border-stone-800 rounded-xl flex items-start gap-2.5">
            <Footprints className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-stone-100 text-xs">Ruído Sonoro</h4>
              <p className="text-[11px] text-stone-400">Correr gera ondas de som que atraem e alertam leopardos próximos.</p>
            </div>
          </div>

          <div className="p-3 bg-stone-900/80 border border-stone-800 rounded-xl flex items-start gap-2.5">
            <Heart className="w-5 h-5 text-pink-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-stone-100 text-xs">Linhagem & Genes</h4>
              <p className="text-[11px] text-stone-400">Ao se tornar adulto, encontre um parceiro para transmitir mutações à próxima geração.</p>
            </div>
          </div>
        </div>

        <button
          onClick={handlePlay}
          className="btn-primary w-full py-3.5 text-base flex items-center justify-center gap-2 text-stone-900 font-bold"
        >
          <Play className="w-5 h-5 fill-current" />
          <span>Iniciar Sobrevivência (Geração #{generation})</span>
        </button>
      </div>
    </div>
  );
};
