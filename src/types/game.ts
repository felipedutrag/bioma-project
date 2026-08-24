export type GameState = 'START' | 'PLAYING' | 'PAUSED' | 'MATING_SELECT' | 'DEAD';

export interface TraitModifiers {
  speedMultiplier: number;     // e.g. 1.0 -> 1.15
  stealthFactor: number;       // e.g. 1.0 -> 1.25 (better camo)
  scentRange: number;          // e.g. 20 -> 35 (radar range)
  metabolismRate: number;      // e.g. 1.0 -> 0.75 (lower = burns food slower)
  staminaRecovery: number;     // e.g. 1.0 -> 1.3
}

export interface FamilyTreeNode {
  gen: number;
  species: string;
  lifespanSeconds: number;
  causeOfDeath: string;
  reproduced: boolean;
  traits: TraitModifiers;
  date: string;
}

export interface SaveState {
  currentGeneration: number;
  species: string;
  unlockedAnimals: string[];
  familyTree: FamilyTreeNode[];
  currentGenes: TraitModifiers;
  highScoreGenerations: number;
  totalTimePlayedSeconds: number;
}

export interface MutationChoice {
  id: string;
  name: string;
  description: string;
  icon: string;
  modifier: Partial<TraitModifiers>;
}

export type PredatorState = 'WANDER' | 'INVESTIGATE' | 'CHASE' | 'ATTACK';

export interface FoodItemData {
  id: string;
  type: 'BERRY' | 'MELON' | 'TERMITE' | 'CARCASS' | 'WATER';
  position: [number, number, number];
  nutrition: number;
  hydration: number;
  active: boolean;
  respawnTimer: number;
}

export interface PlayerStats {
  hunger: number;          // 0 to 100
  stamina: number;         // 0 to 100
  thirst: number;          // 0 to 100
  age: number;             // 0 to 100 (maturity)
  isHiding: number;        // 0 to 1 stealth factor (0 = out in open, 1 = deep in bush)
  noiseLevel: number;      // 0 to 1 noise intensity
  noiseRadius: number;     // world units
  isRunning: boolean;
  isDrinking: boolean;
  isEating: boolean;
  canReproduce: boolean;
  generation: number;
}
