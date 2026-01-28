# ⚡ Neon Survivors ⚡

Um jogo estilo Vampire Survivors feito em HTML/CSS/JavaScript puro. Sobreviva às hordas de inimigos, colete XP, evolua seus poderes e derrote os bosses!

## 🎮 Como Jogar

- **Jogar online:** <a href="https://dliedke.github.io/NeonSurvivors/neon-survivors.html" target="_blank" rel="noopener noreferrer">Abrir Neon Survivors</a>

Abra o arquivo `neon-survivors.html` em qualquer navegador moderno. Não requer instalação!

### 🎯 Melhor Experiência

**💡 RECOMENDADO:** Jogue no PC com controle (Xbox/PlayStation) para a melhor experiência de gameplay!

O jogo entra automaticamente em **tela cheia** ao iniciar (pressione ESC ou F11 para sair).

### Controles

| Ação | Teclado | Controle | Mobile |
|------|---------|----------|--------|
| Mover | `WASD` ou `Setas` | Analógico esquerdo | 🕹️ Joystick virtual |
| Pausar | `P` ou `ESC` | - | Botão ⏸️ |
| Tela cheia | `F` ou `F11` | - | Automático |
| Ajustar inimigos | `+` / `-` | 🔼 / 🟥 | Toque na barra SPAWN |
| Selecionar/Confirmar | - | 🅰️ Botão A | Toque nos botões |
| Navegar upgrades | - | ⬅️ ➡️ D-pad | Toque no upgrade |

### 📱 Suporte Mobile

O jogo detecta automaticamente dispositivos touch e exibe:
- **Joystick virtual** no canto inferior esquerdo para movimento
- **Barra de spawn touch-friendly** - toque diretamente na posição desejada
- **Controles otimizados** - velocidade reduzida para melhor controle
- **Tela cheia automática** ao iniciar e retomar

## ✨ Features

### 🎯 Sistema de Combate
- **Ataque automático** - Mira nos inimigos mais próximos
- **Sistema de crítico** - Chance de causar dano 2x
- **Vampirismo** - Recupere vida ao matar inimigos
- **Explosão** - Inimigos explodem ao morrer, causando dano em área

### ⬆️ Upgrades Permanentes (14 tipos)
- ⚔️ **Dano** - Mais dano por disparo
- 🔫 **Cadência** - Atira mais rápido
- 🎯 **Projétil** - Mais projéteis simultâneos
- 💨 **Velocidade** - Move mais rápido (desabilitado em mobile)
- ❤️ **Vida** - Aumenta vida máxima
- 🧲 **Ímã** - Coleta XP de mais longe
- 🚀 **Proj. Rápido** - Projéteis mais velozes
- 💚 **Regeneração** - Recupera vida ao longo do tempo
- 🔥 **Penetração** - Projéteis atravessam inimigos
- 🧛 **Vampirismo** - +3 HP por kill
- ⚡ **Multi-Hit** - Projéteis ricocheteiam
- 💥 **Explosão** - Inimigos explodem ao morrer
- 🎯 **Crítico** - 15% chance de dano 2x
- 🧲 **XP++** - Orbs valem 20% mais XP

### 👹 Inimigos e Bosses
- **6 tipos de inimigos** com características únicas:
  - 🔴 Pequeno rápido (2 XP)
  - 🟠 Médio resistente (4 XP)
  - 🟡 Veloz frágil (2 XP)
  - 🔵 Tanque lento (5 XP)
  - 🟣 Veloz elite (2 XP)
  - 🔷 Médio balanceado (2 XP)
- **Bosses** - Aparecem a cada 45 segundos
  - Tamanho limitado a 90px (não ficam gigantes demais!)
  - Dano e vida aumentam progressivamente

### 💎 Power-ups

**Tesouros Grandes** (aparecem a cada 15-25s):
- 💣 **Explosão** - Mata todos os inimigos na tela
- 🛡️ **Escudo** - Invencibilidade por 8s
- 💖 **Cura Total** - Restaura 100% da vida
- 🔥 **Fúria** - Dano x3 por 10s
- 🌀 **Projéteis** - +5 projéteis por 15s

**Mini Power-ups** (aparecem a cada 8-12s):
- 💎 **+XP** - Ganho instantâneo de 30 XP
- ⚡ **Tiro Rápido** - Cadência aumentada por 5s
- 🌟 **Estrela** - Reduz vida de todos inimigos pela metade
- 💰 **Moedas** - Spawna 5 orbs de XP

### 🔥 Sistema de Combo (ILIMITADO!)
- Mate inimigos de perto (< 350px) para aumentar o combo
- Timer de 3.2s para manter o combo ativo
- **Multiplicador ilimitado**: 1.5x → 2x → 2.5x → 3x → ...
- Progressão: +0.5x a cada 3 kills consecutivos
- **Sem limite máximo!** Consiga combos épicos para XP massivo

### 🌊 Sistema de Waves
- Complete waves matando inimigos
- Ganhe +15 HP ao completar cada wave
- **Eventos especiais a cada 3 waves**:
  - ⚡ **HORDA!** - 15 inimigos spawnam rapidamente
  - ⚡ **ELITE!** - 3 inimigos fortes aparecem
  - ⚡ **CHUVA DE XP!** - 30 orbs de XP pela tela

### 🎛️ Recursos Adicionais
- **Dificuldade ajustável** - Controle a quantidade de inimigos em tempo real
- **Progressão de níveis balanceada** - Multiplicador reduzido (1.35x) e XP dos inimigos aumentado
- **Sons procedurais** - Efeitos sonoros gerados com Web Audio API
- **Screen shake** - Feedback visual ao tomar dano
- **Tela cheia automática** - Entra em fullscreen ao iniciar

## 🏆 Dicas

1. **Jogue no PC com controle** - Melhor experiência de gameplay!
2. **Fique em movimento** - Parar é morrer!
3. **Mantenha o combo** - Mate de perto para multiplicador ILIMITADO de XP
4. **Priorize upgrades de projétil** - Mais projéteis = mais kills
5. **Pegue os mini power-ups** - Aparecem frequentemente e ajudam muito
6. **Cuidado com os bosses** - Eles dão muito mais dano!
7. **Aproveite os eventos especiais** - Ondas a cada 3 waves trazem oportunidades únicas
8. **Vampirismo + Explosão** - Combo poderoso para sobrevivência
9. **XP++ + Combo alto** - Maximize seu ganho de experiência

## 🛠️ Tecnologias

- **HTML5 Canvas** - Renderização do jogo
- **CSS3** - Interface e efeitos visuais
- **JavaScript Vanilla** - Lógica do jogo (um único arquivo!)
- **Web Audio API** - Sons procedurais
- **Gamepad API** - Suporte a controles
- **Fullscreen API** - Tela cheia automática

## 📁 Estrutura

```
neon-survivors.html  # Arquivo único com todo o jogo
README.md            # Este arquivo
```

## 🎨 Créditos

Desenvolvido com 💜 usando Claude (Anthropic)

---

**Divirta-se! 🎮**
