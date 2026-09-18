document.addEventListener("DOMContentLoaded", () => {
    // 1. Setup Intersection Observer for Reveal animations
    const revealElements = document.querySelectorAll('.reveal');
    
    // Check for prefers-reduced-motion to avoid unnecessary observers
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!prefersReducedMotion && 'IntersectionObserver' in window) {
        const revealObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                    // Stop observing once animated
                    observer.unobserve(entry.target);
                }
            });
        }, {
            root: null,
            rootMargin: '0px 0px -50px 0px', // Trigger slightly before it comes into view
            threshold: 0.1
        });

        revealElements.forEach(el => {
            revealObserver.observe(el);
        });
    } else {
        // Fallback for older browsers or reduced motion
        revealElements.forEach(el => {
            el.classList.add('active');
        });
    }

    // 2. Video Sequence Scroll Animation (Nexus Skill Pattern)
    const seqBg = document.getElementById("sequence-bg-img");
    const seqTrack = document.getElementById("sequence-track");
    const seqPin = document.getElementById("sequence-pin");
    const seqOverlay = document.getElementById("sequence-overlay");

    if (seqBg && seqTrack && seqPin) {
        const frameCount = 240; // 16 segundos a 15fps do natacao_dois.mp4
        const images = [];
        const currentFrame = index => `assets/sequence/frame_${index.toString().padStart(4, '0')}.jpg`;

        // Carregamento Inteligente e Progressivo dos Frames
        const loadFrame = index => {
            if (index < 1 || index > frameCount || images[index]) return;
            const img = new Image();
            img.src = currentFrame(index);
            images[index] = img;
        };

        // 1. Buffer inicial: frame 1 é carregado estaticamente no HTML síncrono (LCP)
        images[1] = seqBg;
        let currentFrameIndex = 1;

        const INITIAL_BUFFER = 15;
        for (let i = 2; i <= INITIAL_BUFFER; i++) {
            loadFrame(i);
        }

        // 2. Pré-carregamento progressivo em background quando o navegador estiver ocioso
        const runWhenIdle = window.requestIdleCallback 
            ? window.requestIdleCallback 
            : cb => setTimeout(cb, 80);

        let nextIdleFrame = INITIAL_BUFFER + 1;
        const BATCH_SIZE = 6;

        const scheduleIdlePreload = () => {
            if (nextIdleFrame > frameCount) return;
            runWhenIdle(deadline => {
                let count = 0;
                while (nextIdleFrame <= frameCount && count < BATCH_SIZE && (!deadline || deadline.timeRemaining() > 1)) {
                    loadFrame(nextIdleFrame);
                    nextIdleFrame++;
                    count++;
                }
                if (nextIdleFrame <= frameCount) {
                    scheduleIdlePreload();
                }
            });
        };

        if (document.readyState === 'complete') {
            scheduleIdlePreload();
        } else {
            window.addEventListener('load', scheduleIdlePreload, { once: true });
        }

        let animationFrameId;

        // Pontos de referência do rosto na sequência original (fração da largura).
        // Apenas o celular acompanha esses pontos; o desktop mantém seu recorte.
        const telaMobile = window.matchMedia('(max-width: 760px)');
        const pontosDeFoco = [[1, 0.745], [20, 0.69], [40, 0.57], [60, 0.51], [80, 0.5], [240, 0.5]];
        let enquadramentoPendente = true;
        window.addEventListener('resize', () => { enquadramentoPendente = true; }, { passive: true });

        const atualizarEnquadramentoMobile = indice => {
            if (!telaMobile.matches) {
                seqBg.style.removeProperty('--enquadramento-mobile');
                return;
            }

            let trecho = 1;
            while (trecho < pontosDeFoco.length - 1 && indice > pontosDeFoco[trecho][0]) trecho++;
            const [inicio, focoInicial] = pontosDeFoco[trecho - 1];
            const [fim, focoFinal] = pontosDeFoco[trecho];
            const progresso = Math.max(0, Math.min(1, (indice - inicio) / (fim - inicio)));
            const foco = focoInicial + (focoFinal - focoInicial) * progresso;

            // Compensa o corte de object-fit: cover em diferentes proporções de tela.
            const largura = seqPin.clientWidth;
            const altura = seqPin.clientHeight;
            const proporcao = seqBg.naturalWidth && seqBg.naturalHeight
                ? seqBg.naturalWidth / seqBg.naturalHeight : 16 / 9;
            const larguraImagem = Math.max(largura, altura * proporcao);
            const corte = larguraImagem - largura;
            const posicao = corte > 0 ? (foco * larguraImagem - largura / 2) / corte : 0.5;
            seqBg.style.setProperty('--enquadramento-mobile', `${(Math.max(0, Math.min(1, posicao)) * 100).toFixed(3)}%`);
        };

        const render = () => {
            // progresso = quanto da "pista" já foi percorrido
            const travel = seqTrack.offsetHeight - seqPin.offsetHeight;
            let scrollFraction = travel > 0 ? -seqTrack.getBoundingClientRect().top / travel : 0;
            scrollFraction = Math.max(0, Math.min(scrollFraction, 1)); // clamp(0, 1)

            // Fade out the white overlay based on absolute pixels scrolled, so it doesn't break if the page grows
            if (seqOverlay) {
                const pixelsScrolled = scrollFraction * travel;
                const fadeDistance = window.innerHeight * 1.2; // Fades out completely after scrolling 1.2x screen height
                const overlayOpacity = Math.max(0, 1 - (pixelsScrolled / fadeDistance));
                seqOverlay.style.opacity = overlayOpacity.toFixed(3);
            }

            let frameIndex = Math.floor(scrollFraction * (frameCount - 1)) + 1;
            frameIndex = Math.max(1, Math.min(frameIndex, frameCount)); // clamp(1, frameCount)

            if (frameIndex !== currentFrameIndex || enquadramentoPendente) {
                atualizarEnquadramentoMobile(frameIndex);
                enquadramentoPendente = false;
            }

            // Buffer sob demanda: prioriza o carregamento dos frames próximos ao ponto atual de scroll
            for (let offset = 0; offset <= 10; offset++) {
                loadFrame(frameIndex + offset);
                if (offset <= 4) loadFrame(frameIndex - offset);
            }

            if (frameIndex !== currentFrameIndex) {
                const img = images[frameIndex];
                seqBg.src = (img && img.complete) ? img.src : currentFrame(frameIndex);
                currentFrameIndex = frameIndex;
            }
            
            animationFrameId = requestAnimationFrame(render);
        };

        animationFrameId = requestAnimationFrame(render);
    }
});
