# 🌍 Bioma Project — 3D Savanna Ecosystem & Evolutionary Survival Simulator

[![Three.js](https://img.shields.io/badge/Three.js-0.174-black?style=for-the-badge&logo=three.js&logoColor=white)](https://threejs.org/)
[![React](https://img.shields.io/badge/React-19.2.8-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8.2-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Web Audio API](https://img.shields.io/badge/Web_Audio_API-Synthesized-orange?style=for-the-badge)](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
[![License](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)](LICENSE)

An interactive, browser-based **3D artificial life simulation and evolutionary survival game** built with **Three.js**, **React 19**, and **TypeScript**. Players control an evolving savanna animal navigating predation, hunger, dehydration, stealth camouflage, and generational reproduction. Every successful reproductive cycle passes down mutated traits, shaping the lineage across generations.

---

## 🎮 Gameplay Overview & Mechanics

In **Bioma**, you step into the role of a creature striving to survive in an unpredictable low-poly savanna biome. The simulation balances real-time biological imperatives with genetic progression:

```
               +-------------------------------------------+
               |              SURVIVAL CYCLE               |
               +-------------------------------------------+
                                     |
               +---------------------v---------------------+
               |       Vital Signs Management              |
               |  • Hunger (Berries, Termites, Melons)     |
               |  • Hydration (Oasis / Water sources)      |
               |  • Stamina & Noise Emission               |
               +-------------------------------------------+
                                     |
                                     v
               +-------------------------------------------+
               |       Predator Evasion (FSM AI)           |
               |  • WANDER -> INVESTIGATE -> CHASE -> BITE |
               |  • Tall Grass Hiding (Stealth Factor)     |
               |  • Scent & Noise Radius Radar             |
               +-------------------------------------------+
                                     |
                                     v
               +-------------------------------------------+
               |       Maturity & Reproduction             |
               |  • Reach Age 100 with Stable Vitals       |
               |  • Seek Compatible Mate in Ecosystem      |
               |  • Choose Mutation & Spawn Next Gen       |
               +-------------------------------------------+
```

### Core Gameplay Loops:
1. **Dynamic Needs Simulation**: Hunger, Thirst, and Stamina decay in real time based on movement speeds and metabolic rates.
2. **Stealth & Olfactory Radar**: Moving through tall grass elevates your stealth coefficient (`isHiding`), breaking predator lines of sight. Running generates auditory ripples (`noiseRadius`) that alert predators.
3. **Predator Finite State Machine (FSM)**: Autonomous savanna carnivores patrol territories, investigate auditory disturbances, pursue prey with acceleration physics, and pounce when within attack range.
4. **Natural Selection & Genetic Inheritance**: Reaching adulthood allows the creature to court a mate and unlock randomized evolutionary mutations (e.g., higher sprint velocity, enhanced scent radar, lower basal metabolic consumption, accelerated stamina regeneration).
5. **Genealogy Tree Tracking**: Persistent family tree tracking captures generation number, lifespan, traits, cause of death, and reproduction records saved to `localStorage`.

---

## 🔬 System Architecture

```
bioma-project/
├── public/                 # Favicons and SVG vector assets
├── src/
│   ├── audio/
│   │   └── SoundSystem.ts  # Procedural sound effects using Web Audio API synthesis
│   ├── entities/
│   │   ├── FoodSystem.ts   # Forageable spawning (Berries, Melons, Carcasses, Water)
│   │   ├── Mate.ts         # Courtship candidate AI with attraction radiuses
│   │   ├── Player.ts       # Player entity, movement physics, stealth & vital mechanics
│   │   └── Predator.ts     # Carnivore AI with sensory cones & state transitions
│   ├── storage/
│   │   └── GeneStorage.ts  # LocalStorage persistence for family trees & high scores
│   ├── systems/
│   │   └── GameEngine.ts   # Three.js animation loop, camera rigging, raycasting & collisions
│   ├── types/
│   │   └── game.ts         # Data contracts for genes, stats, mutations, and save states
│   ├── ui/
│   │   ├── FamilyTreeModal.tsx # Generational lineage viewer & cause of death log
│   │   ├── GameOverModal.tsx   # Extinction screen with lifespan statistics
│   │   ├── HUD.tsx             # Real-time bio-radar, stat gauges, and alerts
│   │   ├── MatingModal.tsx     # Genetic mutation picker on reproduction
│   │   └── StartModal.tsx      # Welcome screen, control scheme & species intro
│   ├── world/
│   │   └── SavannaWorld.ts # Procedural low-poly terrain, water oasis, acacia trees & bushes
│   ├── App.tsx             # HUD overlay and GameEngine lifecycle synchronization
│   ├── App.css             # Glassmorphism HUD styling and pulse animations
│   ├── main.tsx            # React 19 root
│   └── index.css           # Global typography & reset
├── package.json            # Three.js 0.174, React 19.2, Vite 8.2 configurations
└── tsconfig.json           # Modern TypeScript compiler settings
```

---

## 🌟 Technical Highlights

- **Custom Procedural Audio (`SoundSystem.ts`)**: Generates real-time soundscapes, footstep rustles, heartbeats, predator alerts, and eating effects purely through mathematical waveforms using the native **Web Audio API** — zero external audio files required.
- **Three.js Low-Poly Mesh Generation**: Procedurally assembled savanna landscape featuring custom lighting, dynamic shadows, swaying acacia foliage, and responsive camera following.
- **Spatial Radar**: Custom circular heads-up display projecting predators, water holes, foraging resources, and mating targets relative to player heading.
- **Micro-State React 19 Integration**: Zero overhead bridging between the 60fps Three.js requestAnimationFrame game loop and React state management through decoupled callbacks.

---

## 🛠️ Tech Stack

| Layer | Technology | Details |
| :--- | :--- | :--- |
| **Graphics & 3D Engine** | [Three.js 0.174](https://threejs.org/) | WebGL renderer, perspective cameras, mesh hierarchies, raycasting |
| **UI Framework** | [React 19.2](https://react.dev/) | High-performance overlay HUD, modals, and genealogy views |
| **Language** | [TypeScript 6.0](https://www.typescriptlang.org/) | Strict biological interfaces, genetic modifiers, and FSM typing |
| **Bundler & Tooling** | [Vite 8.2](https://vitejs.dev/) | Instant hot module replacement and optimized tree-shaking |
| **Audio Engine** | Native Web Audio API | Procedural oscillators, gain envelopes, and audio filtering |
| **Visual Effects** | Canvas Confetti & Lucide React | Milestone celebration effects and crisp sensory iconography |

---

## ⌨️ Controls

| Action | Key / Input |
| :--- | :--- |
| **Move / Navigate** | `W, A, S, D` or `Arrow Keys` |
| **Sprint / Dash** | `Shift` (Consumes stamina rapidly, elevates noise) |
| **Drink Water** | `E` (Near water oasis or springs) |
| **Eat Foraged Food** | `Spacebar` (Near berries, fruits, or nutrients) |
| **Inspect Family Tree**| `T` |
| **Pause Simulation** | `Esc` |

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm** or **pnpm**

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/felipedutrag/bioma-project.git
   cd bioma-project
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the simulation:**
   ```bash
   npm run dev
   ```
   Open your browser at `http://localhost:5173`.

4. **Production Build:**
   ```bash
   npm run build
   npm run preview
   ```

---

## 👨‍💻 Author

**Felipe Dutra**
- **GitHub**: [@felipedutrag](https://github.com/felipedutrag)
- **Email**: [felipedutra@outlook.com](mailto:felipedutra@outlook.com)

---

## 📄 License

Distributed under the [MIT License](LICENSE).
