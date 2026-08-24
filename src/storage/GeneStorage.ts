import type { SaveState, TraitModifiers, FamilyTreeNode, MutationChoice } from '../types/game';

const STORAGE_KEY = 'apex_survival_cycle_save_v1';

export const DEFAULT_TRAITS: TraitModifiers = {
  speedMultiplier: 1.0,
  stealthFactor: 1.0,
  scentRange: 22,
  metabolismRate: 1.0,
  staminaRecovery: 1.0,
};

export const INITIAL_SAVE_STATE: SaveState = {
  currentGeneration: 1,
  species: 'Suricato da Savana',
  unlockedAnimals: ['Suricato da Savana', 'Pequena Gazela', 'Chacal Veloz'],
  familyTree: [],
  currentGenes: { ...DEFAULT_TRAITS },
  highScoreGenerations: 1,
  totalTimePlayedSeconds: 0,
};

export class GeneStorage {
  private static cachedState: SaveState | null = null;

  public static loadState(): SaveState {
    if (this.cachedState) return this.cachedState;

    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        const parsed = JSON.parse(data) as SaveState;
        // Merge in case of missing keys
        this.cachedState = {
          ...INITIAL_SAVE_STATE,
          ...parsed,
          currentGenes: { ...DEFAULT_TRAITS, ...(parsed.currentGenes || {}) },
          familyTree: parsed.familyTree || [],
        };
        return this.cachedState;
      }
    } catch (e) {
      console.warn('Failed to parse saved game from localStorage:', e);
    }

    this.cachedState = JSON.parse(JSON.stringify(INITIAL_SAVE_STATE));
    this.saveState(this.cachedState!);
    return this.cachedState!;
  }

  public static saveState(state: SaveState): void {
    this.cachedState = state;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.warn('Failed to write save state to localStorage:', e);
    }
  }

  public static recordGenerationEnd(
    lifespanSeconds: number,
    causeOfDeath: string,
    reproduced: boolean
  ): SaveState {
    const state = this.loadState();
    
    const node: FamilyTreeNode = {
      gen: state.currentGeneration,
      species: state.species,
      lifespanSeconds: Math.round(lifespanSeconds),
      causeOfDeath: reproduced ? 'Reproduziu com Sucesso (Cria Gerada)' : causeOfDeath,
      reproduced,
      traits: { ...state.currentGenes },
      date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    state.familyTree.unshift(node); // newest first
    state.totalTimePlayedSeconds += Math.round(lifespanSeconds);

    if (state.currentGeneration > state.highScoreGenerations) {
      state.highScoreGenerations = state.currentGeneration;
    }

    if (reproduced) {
      state.currentGeneration += 1;
    }

    this.saveState(state);
    return state;
  }

  public static applyMutation(mutation: MutationChoice): SaveState {
    const state = this.loadState();
    const current = { ...state.currentGenes };

    if (mutation.modifier.speedMultiplier) {
      current.speedMultiplier = Number((current.speedMultiplier * mutation.modifier.speedMultiplier).toFixed(2));
    }
    if (mutation.modifier.stealthFactor) {
      current.stealthFactor = Number((current.stealthFactor * mutation.modifier.stealthFactor).toFixed(2));
    }
    if (mutation.modifier.scentRange) {
      current.scentRange = Math.round(current.scentRange + mutation.modifier.scentRange);
    }
    if (mutation.modifier.metabolismRate) {
      current.metabolismRate = Number((current.metabolismRate * mutation.modifier.metabolismRate).toFixed(2));
    }
    if (mutation.modifier.staminaRecovery) {
      current.staminaRecovery = Number((current.staminaRecovery * mutation.modifier.staminaRecovery).toFixed(2));
    }

    state.currentGenes = current;
    this.saveState(state);
    return state;
  }

  public static getRandomMutations(): MutationChoice[] {
    const pool: MutationChoice[] = [
      {
        id: 'fast_reflexes',
        name: 'Reflexos de Guepardo',
        description: '+15% de velocidade de corrida e arrancada.',
        icon: 'Zap',
        modifier: { speedMultiplier: 1.15 },
      },
      {
        id: 'mimetic_fur',
        name: 'Pelagem Mimetizadora',
        description: '+25% de camuflagem (reduz alcance de visão dos predadores).',
        icon: 'EyeOff',
        modifier: { stealthFactor: 1.25 },
      },
      {
        id: 'keen_senses',
        name: 'Olfato Apurado da Savana',
        description: '+10m no raio do mini-radar para detectar comida e predadores.',
        icon: 'Compass',
        modifier: { scentRange: 10 },
      },
      {
        id: 'slow_metabolism',
        name: 'Eficiência Digestiva',
        description: 'Fome e sede decaem 20% mais devagar no calor.',
        icon: 'Heart',
        modifier: { metabolismRate: 0.8 },
      },
      {
        id: 'endurance_lungs',
        name: 'Pulmões Resistentes',
        description: '+30% na velocidade de recuperação de Estamina.',
        icon: 'Wind',
        modifier: { staminaRecovery: 1.3 },
      },
      {
        id: 'silent_paws',
        name: 'Patas Acolchoadas',
        description: 'Gera 30% menos ruído sonoro ao trotar ou correr.',
        icon: 'VolumeX',
        modifier: { stealthFactor: 1.15, speedMultiplier: 1.05 },
      },
    ];

    // Shuffle and pick 3 distinct mutations
    const shuffled = [...pool].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 3);
  }

  public static resetProgress(): SaveState {
    const reset = JSON.parse(JSON.stringify(INITIAL_SAVE_STATE));
    this.saveState(reset);
    return reset;
  }
}
