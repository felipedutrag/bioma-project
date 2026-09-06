# 🌿 Bioma Project — Simulador de Ecossistema & Sobrevivência Evolutiva 3D

<p align="center">
  <img src="https://img.shields.io/badge/Three.js-000000?style=for-the-badge&logo=three.js&logoColor=white" alt="Three.js" />
  <img src="https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React 19" />
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Vite_6-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/Web_Audio_API-FF6F00?style=for-the-badge&logoColor=white" alt="Web Audio API" />
  <img src="https://img.shields.io/badge/LocalStorage_Persistence-00C7B7?style=for-the-badge&logoColor=white" alt="Persistência Genética" />
</p>

---

## 🌍 Visão Geral

O **Bioma Project** é um simulador de ecossistema 3D imersivo e jogo de sobrevivência genética desenvolvido no navegador. O jogador assume o controle de um organismo vivo em uma savana dinâmica com ciclo de predadores, recursos escassos, sistema de stealth/ruído e árvore genealógica multigeracional.

Ao sobreviver até a maturidade e encontrar um parceiro reprodutivo, o jogador passa adiante mutações genéticas adaptativas (velocidade, camuflagem, alcance olfativo de radar, metabolismo e recuperação de estamina), criando uma linhagem contínua de evolução darwiniana.

---

## 🎮 Mecânicas do Jogo

- 🦁 **IA de Predadores com Máquina de Estados Finita:**
  - Predadores transitam organicamente entre **Vagar (`WANDER`)**, **Investigar Barulho (`INVESTIGATE`)**, **Perseguição (`CHASE`)** e **Ataque (`ATTACK`)**.
  - O jogador emite ondas sonoras ao correr ou se alimentar, alertando carnívoros no perímetro.
- 🌾 **Camuflagem e Stealth Dinâmico:**
  - Esconda-se em arbustos e vegetação para aumentar seu índice de camuflagem (`isHiding`), reduzindo drasticamente o campo de visão dos predadores.
- 💧 **Gestão de Sobrevivência Biológica:**
  - Barras vitais de **Fome**, **Sede**, **Estamina** e **Idade**.
  - Frutas, melões e cupins oferecem diferentes taxas nutricionais; rios e lagoas saciam a sede.
- 🧬 **Acasalamento & Mutações Genéticas (Gerações):**
  - Ao atingir a idade reprodutiva, encontre um par compatível para selecionar mutações genéticas hereditárias.
  - Árvore genealógica completa registrada localmente com causas de morte, tempo de vida e histórico da linhagem.
- 🔊 **Sound System Procedural:**
  - Sintetizador de áudio nativo construído com Web Audio API gerando efeitos sonoros de passos, mastigação, alerta de perigo e batimentos cardíacos sem carregar assets externos pesados.

---

## 🛠️ Stack Tecnológica

| Camada | Tecnologia |
|---|---|
| **Renderização 3D** | [Three.js](https://threejs.org/) (Iluminação dinâmica, sombras, materiais PBR e procedural world) |
| **Interface do Usuário (HUD)** | [React 19](https://react.dev/) + [Lucide React](https://lucide.dev/) |
| **Linguagem** | [TypeScript](https://www.typescriptlang.org/) |
| **Build & Bundler** | [Vite 6](https://vitejs.dev/) |
| **Áudio** | Web Audio API nativa procedural |
| **Celebrações visuais** | `canvas-confetti` |
| **Persistência** | `GeneStorage` via Browser LocalStorage |

---

## 📁 Arquitetura do Projeto

```bash
bioma-project/
├── public/                 # Favicons e manifestos
├── src/
│   ├── audio/              # SoundSystem.ts (efeitos sonoros sintetizados via Web Audio)
│   ├── entities/           # Entidades 3D autônomas
│   │   ├── Player.ts       # Física do jogador, movimentação e estados
│   │   ├── Predator.ts     # IA e máquina de estados dos carnívoros
│   │   ├── FoodSystem.ts   # Spawner de bagas, melões e cupinzeiros
│   │   └── Mate.ts         # Comportamento do parceiro reprodutivo
│   ├── storage/            # GeneStorage.ts (árvore genealógica e genes salvos)
│   ├── systems/            # GameEngine.ts (loop principal de física, render e câmera)
│   ├── types/              # Definições de tipos TypeScript (genes, stats, estados)
│   ├── ui/                 # HUD em React (Radar de sentidos, modais de acasalamento e morte)
│   ├── world/              # SavannaWorld.ts (terreno procedural, vegetação e corpos d'água)
│   ├── App.tsx             # Integração entre GameEngine e componentes React
│   └── main.tsx
└── package.json
```

---

## 🕹️ Controles

- **W, A, S, D** ou **Setas**: Movimentação
- **Shift**: Correr (consome estamina e eleva ruído acústico)
- **E**: Interagir (beber água, colher alimentos, acasalar)
- **Espaço / Radar**: Visualização de sentidos olfativos
- **M**: Mutar / Desmutar áudio do ecossistema

---

## 🚀 Como Executar Localmente

### Pré-requisitos
- Node.js `>= 18.0.0`
- Navegador moderno com suporte a WebGL

```bash
# Clone o repositório
git clone https://github.com/felipedutrag/bioma-project.git

# Acesse o diretório
cd bioma-project

# Instale as dependências
npm install

# Inicie o servidor local
npm run dev
```

Abra o endereço gerado pelo Vite (normalmente `http://localhost:5173`) e teste sua capacidade de sobreviver e perpetuar sua espécie!

---

## 👤 Autor

Desenvolvido por **Felipe Dutra**  
- **GitHub:** [@felipedutrag](https://github.com/felipedutrag)  
- **E-mail:** [felipedutra@outlook.com](mailto:felipedutra@outlook.com)
