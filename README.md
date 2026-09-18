<div align="center">
  <h1>🥽 Lucent Goggles | Série 01</h1>
  <p>Uma Landing Page premium de alto desempenho construída do zero, com background em vídeo cinematográfico rolável.</p>
</div>

<br>

## 🎬 A Experiência (Scroll Scrubbing)

O maior destaque deste projeto é a técnica de **Video Scroll Scrubbing**. Em vez de carregar um arquivo `.mp4` massivo que pesa o navegador, o vídeo de background foi fatiado matematicamente em 240 quadros estáticos (`.jpg`) extraídos via **FFmpeg**.

O Javascript foi então desenhado nativamente usando a API de `requestAnimationFrame` para amarrar a posição de rolagem (`scrollFraction`) à matriz de imagens.

**O resultado?** Uma experiência audiovisual de 60fps onde a natação acompanha o ritmo de leitura do usuário, fluindo do topo do site até o rodapé, sem depender de frameworks pesados.

---

## 🚀 Tecnologias e Performance

- **HTML5 Semântico:** Estruturação arquitetônica limpa, seguindo rigorosos padrões de acessibilidade.
- **CSS3 Vanilla (Premium):** Sem bibliotecas (como Tailwind ou Bootstrap). Sistema de design próprio com *glassmorphism*, contraste invertido no scroll e botões com transições cúbicas (`cubic-bezier`).
- **Javascript Vanilla:** Responsável apenas pelo motor de renderização das imagens via scroll e pelo sistema de *Intersecting Observer* que revela o texto (fade-up).

## 🗂 Estrutura do Projeto

```text
/
├── assets/
│   ├── natacao.mp4             # Vídeo original
│   ├── sequence/               # +240 frames JPG utilizados no Scrubbing
├── index.html                  # O corpo da aplicação
├── style.css                   # Sistema de design
├── script.js                   # Motor de renderização e animações
├── .env.example                # Configurações de ambiente (template)
└── README.md                   # Documentação (você está aqui!)
```

## 🛠️ Como Rodar Localmente

O projeto não precisa de processo de `build` ou `npm run`. Ele foi pensado para rodar leve, como um canhão na Vercel ou na sua máquina.

1. Clone o repositório:
   ```bash
   git clone https://github.com/Alavanca-Ai/lucent-goggles.git
   ```
2. Abra a pasta do projeto:
   ```bash
   cd lucent-goggles
   ```
3. Abra o arquivo `index.html` em seu navegador favorito ou rode através do *Live Server* do VSCode.

---

<div align="center">
  <i>"A água que se torna transparente. O design que corta a água antes mesmo de você perceber."</i>
</div>
