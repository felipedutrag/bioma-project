import React from 'react';
import type { PlayerStats, TraitModifiers } from '../types/game';
import type { RadarEntity } from '../systems/GameEngine';
import { Eye, EyeOff, Volume2, VolumeX, Heart, Shield, Compass, Sparkles, Droplet, Utensils, Zap } from 'lucide-react';
import { SoundSystem } from '../audio/SoundSystem';

interface HUDProps {
  stats: PlayerStats;
  traits: TraitModifiers;
  radarEntities: RadarEntity[];
  onOpenGenealogy: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const HUD: React.FC<HUDProps> = ({
  stats,
  traits,
  radarEntities,
  onOpenGenealogy,
  isMuted,
  onToggleMute,
}) => {
  const isHidden = stats.isHiding > 0.2;

  return (
    <div className="hud-container pointer-events-none select-none">
      {/* Top Left: Vital Stats (Fome, Sede, Estamina, Maturidade) */}
      <div className="hud-panel top-left pointer-events-auto">
        <div className="flex items-center justify-between gap-3 mb-2">
          <div className="badge-gen">
            <Sparkles className="w-3.5 h-3.5 text-amber-300 inline mr-1" />
            <span>Geração #{stats.generation}</span>
          </div>
          <button
            onClick={onOpenGenealogy}
            className="btn-glass text-xs"
            title="Ver Linhagem e Genes"
          >
            <Shield className="w-3.5 h-3.5 inline mr-1 text-emerald-400" />
            Linhagem
          </button>
        </div>

        {/* Fome (Hunger) Bar */}
        <div className="stat-row">
          <div className="stat-label">
            <Utensils className="w-3.5 h-3.5 text-amber-400" />
            <span>Fome</span>
            <span className="stat-val">{Math.round(stats.hunger)}%</span>
          </div>
          <div className="bar-bg">
            <div
              className={`bar-fill ${stats.hunger < 25 ? 'bar-critical' : 'bar-hunger'}`}
              style={{ width: `${stats.hunger}%` }}
            />
          </div>
        </div>

        {/* Sede (Thirst) Bar */}
        <div className="stat-row">
          <div className="stat-label">
            <Droplet className="w-3.5 h-3.5 text-cyan-400" />
            <span>Sede</span>
            <span className="stat-val">{Math.round(stats.thirst)}%</span>
          </div>
          <div className="bar-bg">
            <div
              className={`bar-fill ${stats.thirst < 25 ? 'bar-critical' : 'bar-thirst'}`}
              style={{ width: `${stats.thirst}%` }}
            />
          </div>
        </div>

        {/* Estamina Bar */}
        <div className="stat-row">
          <div className="stat-label">
            <Zap className="w-3.5 h-3.5 text-emerald-400" />
            <span>Estamina</span>
            <span className="stat-val">{Math.round(stats.stamina)}%</span>
          </div>
          <div className="bar-bg">
            <div
              className="bar-fill bar-stamina"
              style={{ width: `${stats.stamina}%` }}
            />
          </div>
        </div>

        {/* Maturidade / Idade Bar */}
        <div className="stat-row">
          <div className="stat-label">
            <Heart className="w-3.5 h-3.5 text-rose-400" />
            <span>Maturidade</span>
            <span className="stat-val">
              {stats.canReproduce ? 'ADULTO REPRODUTOR' : `${Math.round(stats.age)}%`}
            </span>
          </div>
          <div className="bar-bg">
            <div
              className={`bar-fill ${stats.canReproduce ? 'bar-mature' : 'bar-age'}`}
              style={{ width: `${stats.age}%` }}
            />
          </div>
        </div>
      </div>

      {/* Top Center: Tactical Status Alert */}
      <div className="hud-center pointer-events-none">
        {stats.canReproduce && (
          <div className="pill-alert pill-mating animate-bounce">
            <Heart className="w-4 h-4 text-pink-400 fill-pink-400" />
            <span>Você atingiu a idade reprodutiva! Encontre um parceiro perto do oásis.</span>
          </div>
        )}

        {isHidden && !stats.canReproduce && (
          <div className="pill-alert pill-stealth">
            <EyeOff className="w-4 h-4 text-emerald-400" />
            <span>Oculto no arbusto &bull; Visibilidade -80%</span>
          </div>
        )}

        {stats.isRunning && (
          <div className="pill-alert pill-noise">
            <Volume2 className="w-4 h-4 text-rose-400" />
            <span>Emitindo Ruído de Corrida (Predadores podem ouvir!)</span>
          </div>
        )}
      </div>

      {/* Top Right: Audio Mute & Stealth/Noise Gauge */}
      <div className="hud-panel top-right pointer-events-auto flex flex-col gap-2">
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={() => {
              SoundSystem.init();
              onToggleMute();
            }}
            className="btn-glass p-2 rounded-full"
            title={isMuted ? 'Desmutar Som' : 'Mutar Som'}
          >
            {isMuted ? (
              <VolumeX className="w-4 h-4 text-rose-400" />
            ) : (
              <Volume2 className="w-4 h-4 text-emerald-400" />
            )}
          </button>
        </div>

        {/* Stealth & Noise Sensor Panel */}
        <div className="sensor-card">
          <div className="flex items-center justify-between text-xs text-stone-300 mb-1">
            <span className="flex items-center gap-1">
              {isHidden ? (
                <EyeOff className="w-4 h-4 text-emerald-400" />
              ) : (
                <Eye className="w-4 h-4 text-amber-400" />
              )}
              {isHidden ? 'Furtivo' : 'Exposto'}
            </span>
            <span className="text-[10px] text-stone-400">
              Camo: x{traits.stealthFactor.toFixed(2)}
            </span>
          </div>

          <div className="noise-meter">
            <span className="text-[10px] text-stone-400">Ruído Acústico:</span>
            <div className="noise-bars">
              <span className={`bar ${stats.noiseLevel > 0.1 ? 'active' : ''}`} />
              <span className={`bar ${stats.noiseLevel > 0.3 ? 'active' : ''}`} />
              <span className={`bar ${stats.noiseLevel > 0.6 ? 'active alert' : ''}`} />
              <span className={`bar ${stats.noiseLevel > 0.8 ? 'active alert' : ''}`} />
            </div>
          </div>
        </div>

        {/* Mini Radar / Scent Sense */}
        <div className="radar-container">
          <div className="radar-header">
            <Compass className="w-3.5 h-3.5 text-amber-300" />
            <span>Sentidos da Savana ({traits.scentRange}m)</span>
          </div>
          <div className="radar-circle">
            <div className="radar-crosshair-h" />
            <div className="radar-crosshair-v" />
            <div className="radar-center-dot" />

            {/* Radar Blips */}
            {radarEntities.map((ent, i) => {
              const maxDist = traits.scentRange;
              // Map relative x, z (-maxDist to maxDist) to % (0% to 100%)
              const leftPercent = 50 + (ent.x / maxDist) * 45;
              const topPercent = 50 + (ent.z / maxDist) * 45;

              let dotClass = 'blip-food';
              if (ent.type === 'PREDATOR') {
                dotClass =
                  ent.state === 'CHASE'
                    ? 'blip-predator-chase'
                    : ent.state === 'INVESTIGATE'
                    ? 'blip-predator-investigate'
                    : 'blip-predator';
              } else if (ent.type === 'WATER') {
                dotClass = 'blip-water';
              } else if (ent.type === 'MATE') {
                dotClass = 'blip-mate';
              }

              return (
                <div
                  key={i}
                  className={`radar-blip ${dotClass}`}
                  style={{
                    left: `${Math.max(5, Math.min(95, leftPercent))}%`,
                    top: `${Math.max(5, Math.min(95, topPercent))}%`,
                  }}
                  title={`${ent.type} (${Math.round(ent.distance)}m)`}
                />
              );
            })}
          </div>
          <div className="radar-legend">
            <span className="legend-item"><span className="dot dot-food" /> Comida</span>
            <span className="legend-item"><span className="dot dot-water" /> Água</span>
            <span className="legend-item"><span className="dot dot-pred" /> Predador</span>
          </div>
        </div>
      </div>

      {/* Bottom Controls Legend */}
      <div className="hud-bottom-bar pointer-events-none">
        <div className="controls-hint">
          <span className="key-badge">WASD / Setas</span> Mover
          <span className="key-badge">Shift</span> Correr (Ruído Alto)
          <span className="key-badge">Arbustos</span> Furtividade
          <span className="key-badge">Lago</span> Beber Água
        </div>
      </div>
    </div>
  );
};
