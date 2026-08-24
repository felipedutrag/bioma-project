import { useEffect, useRef, useState, useCallback } from 'react';
import './App.css';
import { GameEngine } from './systems/GameEngine';
import type { RadarEntity } from './systems/GameEngine';
import type { PlayerStats, TraitModifiers, GameState } from './types/game';
import { GeneStorage, DEFAULT_TRAITS } from './storage/GeneStorage';
import { SoundSystem } from './audio/SoundSystem';
import { HUD } from './ui/HUD';
import { StartModal } from './ui/StartModal';
import { MatingModal } from './ui/MatingModal';
import { GameOverModal } from './ui/GameOverModal';
import { FamilyTreeModal } from './ui/FamilyTreeModal';

export function App() {
  const containerRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<GameEngine | null>(null);

  const [hasStarted, setHasStarted] = useState(false);
  const [gameState, setGameState] = useState<GameState>('START');
  const [traits, setTraits] = useState<TraitModifiers>(DEFAULT_TRAITS);
  const [radarEntities, setRadarEntities] = useState<RadarEntity[]>([]);
  const [showGenealogy, setShowGenealogy] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  const [deathInfo, setDeathInfo] = useState<{ reason: string; lifespan: number }>({
    reason: '',
    lifespan: 0,
  });

  const [stats, setStats] = useState<PlayerStats>({
    hunger: 90,
    stamina: 100,
    thirst: 90,
    age: 10,
    isHiding: 0,
    noiseLevel: 0,
    noiseRadius: 0,
    isRunning: false,
    isDrinking: false,
    isEating: false,
    canReproduce: false,
    generation: 1,
  });

  const refreshStateFromStorage = useCallback(() => {
    const save = GeneStorage.loadState();
    setTraits(save.currentGenes);
    setStats((prev) => ({ ...prev, generation: save.currentGeneration }));
  }, []);

  const handleStatsUpdate = useCallback((newStats: PlayerStats, radar: RadarEntity[]) => {
    setStats(newStats);
    setRadarEntities(radar);
  }, []);

  const handleGameOver = useCallback((reason: string, lifespan: number) => {
    setDeathInfo({ reason, lifespan });
    setGameState('DEAD');
  }, []);

  const handleMatingReady = useCallback(() => {
    setGameState('MATING_SELECT');
  }, []);

  const initEngine = useCallback(() => {
    if (!containerRef.current) return;

    if (engineRef.current) {
      engineRef.current.destroy();
    }

    refreshStateFromStorage();
    const engine = new GameEngine(containerRef.current);
    engine.onStatsUpdate = handleStatsUpdate;
    engine.onGameOver = handleGameOver;
    engine.onMatingReady = handleMatingReady;
    engineRef.current = engine;
    setGameState('PLAYING');
  }, [refreshStateFromStorage, handleStatsUpdate, handleGameOver, handleMatingReady]);

  const handleStartGame = () => {
    setHasStarted(true);
    initEngine();
  };

  const handleRestart = () => {
    initEngine();
  };

  const handleNextGeneration = () => {
    initEngine();
  };

  const handleToggleMute = () => {
    const muted = SoundSystem.toggleMute();
    setIsMuted(muted);
  };

  useEffect(() => {
    refreshStateFromStorage();
    return () => {
      if (engineRef.current) {
        engineRef.current.destroy();
      }
    };
  }, [refreshStateFromStorage]);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-stone-950 font-sans">
      {/* 3D Canvas Mount Point */}
      <div ref={containerRef} id="canvas-container" />

      {/* Intro / Start Screen */}
      {!hasStarted && (
        <StartModal onStart={handleStartGame} generation={stats.generation} />
      )}

      {/* Main Gameplay HUD */}
      {hasStarted && (
        <HUD
          stats={stats}
          traits={traits}
          radarEntities={radarEntities}
          onOpenGenealogy={() => setShowGenealogy(true)}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
        />
      )}

      {/* Mating / Next Generation Modal */}
      {gameState === 'MATING_SELECT' && engineRef.current && (
        <MatingModal
          onNextGeneration={handleNextGeneration}
          lifespanSeconds={engineRef.current.player.lifespanSeconds}
        />
      )}

      {/* Game Over Modal */}
      {gameState === 'DEAD' && (
        <GameOverModal
          reason={deathInfo.reason}
          lifespanSeconds={deathInfo.lifespan}
          onRestart={handleRestart}
          onOpenGenealogy={() => setShowGenealogy(true)}
        />
      )}

      {/* Family Tree / Genealogy Modal */}
      {showGenealogy && (
        <FamilyTreeModal onClose={() => setShowGenealogy(false)} />
      )}
    </div>
  );
}

export default App;
