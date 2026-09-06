# 🌿 Bioma Project — 3D Evolutionary Ecosystem & Survival Simulation

<p align="center">
  <img src="https://img.shields.io/badge/Three.js-000000?style=for-the-badge&logo=three.js&logoColor=white" alt="Three.js" />
  <img src="https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React 19" />
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Vite_6-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/Web_Audio_API-FF6F00?style=for-the-badge&logoColor=white" alt="Web Audio API" />
  <img src="https://img.shields.io/badge/Gene_Persistence-00C7B7?style=for-the-badge&logoColor=white" alt="Gene Persistence" />
</p>

---

## 🌍 Overview

**Bioma Project** is a browser-based 3D ecosystem simulator and evolutionary survival game. Players control an evolving organism in a dynamic savanna terrain featuring autonomous predator AI, scarce food resources, acoustic stealth mechanics, and multi-generational family trees.

By surviving to reproductive age and selecting compatible mates, players pass down adaptive genetic mutations (speed, camouflage, olfactory radar range, metabolism rate, and stamina recovery)—creating an uninterrupted lineage of Darwinian evolution.

---

## 🎮 Game Mechanics

- 🦁 **Finite State Machine Predator AI:** Carnivores naturally transition between **Wandering (`WANDER`)**, **Investigating Noise (`INVESTIGATE`)**, **Pursuit (`CHASE`)**, and **Attacking (`ATTACK`)**.
- 🌾 **Acoustic & Camouflage Stealth:** Hiding in bushes elevates camouflage (`isHiding`), while sprinting or drinking emits sound waves that alert nearby predators.
- 💧 **Biological Survival Metrics:** Real-time monitoring of Hunger, Thirst, Stamina, and Maturation Age.
- 🧬 **Generational Mating & Genetics:** Reach sexual maturity, court compatible mates, and pick hereditary trait mutations stored across generations.
- 🔊 **Procedural Web Audio Engine:** Custom synthesizer generating footsteps, drinking effects, danger alerts, and heartbeats with zero external audio assets.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **3D Graphics Engine** | Three.js (dynamic shadows, PBR materials, procedural terrain) |
| **HUD & Interface** | React 19 + Lucide React |
| **Language** | TypeScript |
| **Build Tool** | Vite 6 |
| **Audio** | Procedural Web Audio API |
| **Data Persistence** | LocalStorage (`GeneStorage`) |

---

## 🕹️ Controls

- **W, A, S, D** or **Arrows**: Move
- **Shift**: Sprint (burns stamina, raises acoustic noise)
- **E**: Interact (forage, drink water, mate)
- **Space / Radar**: Activate sensory radar
- **M**: Mute / Unmute audio

---

## 🚀 Getting Started

```bash
# Clone repository
git clone https://github.com/felipedutrag/bioma-project.git
cd bioma-project

# Install dependencies
npm install

# Run local simulation
npm run dev
```

---

## 👤 Author

Developed by **Felipe Dutra**  
- **GitHub:** [@felipedutrag](https://github.com/felipedutrag)  
- **Email:** [felipedutra@outlook.com](mailto:felipedutra@outlook.com)
