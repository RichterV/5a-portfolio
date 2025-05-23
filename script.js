document.addEventListener("DOMContentLoaded", function () {
    // ========== Controle do menu mobile ==========
    const menuButton = document.getElementById("mobile-menu-button");
    const mobileMenu = document.getElementById("mobile-menu");
    const navLinks = document.querySelectorAll(".nav-link");

    menuButton.addEventListener("click", () => {
        mobileMenu.classList.toggle("hidden");
    });

    // Fecha o menu mobile ao clicar em um link
    navLinks.forEach((link) => {
        link.addEventListener("click", () => {
            if (
                window.innerWidth < 768 &&
                !mobileMenu.classList.contains("hidden")
            ) {
                mobileMenu.classList.add("hidden");
            }
        });
    });

    // Carrega seções e inicia os scripts
    loadSectionsAndInit(() => {
        console.log("Home carregada e scripts iniciados.");
        initModalTriggers();
        initCarousel();
        initNavHighlight(); // destaca com scroll
        initNavClicks();    // destaca ao clicar
    });
});

// Seções a carregar dinamicamente
const sections = [
    { id: "home", file: "home.html" },
    { id: "sobre", file: "sobre.html" },
    { id: "conteudos", file: "conteudos.html" },
    { id: "servicos", file: "servicos.html" },
    { id: "contato", file: "contato.html" },
    { id: "footer", file: "footer.html" }
];

// Carrega as seções e executa o callback
function loadSectionsAndInit(callback) {
    const promises = sections.map(section =>
        fetch(section.file)
            .then(res => res.text())
            .then(html => {
                document.getElementById(section.id).innerHTML = html;
            })
    );

    Promise.all(promises).then(() => {
        callback();
    });
}

// ========== Destaque dinâmico da navbar ==========
function initNavHighlight() {
    const sections = document.querySelectorAll("section");
    const navLinks = document.querySelectorAll(".nav-link");

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    const id = entry.target.id;

                    navLinks.forEach((link) => {
                        if (link.dataset.section === id) {
                            link.classList.add(
                                "text-green-700",
                                "border-b-2",
                                "border-green-700",
                                "bg-green-50"
                            );
                            link.classList.remove("text-gray-700");
                        } else {
                            link.classList.remove(
                                "text-green-700",
                                "border-b-2",
                                "border-green-700",
                                "bg-green-50"
                            );
                            link.classList.add("text-gray-700");
                        }
                    });
                }
            });
        },
        {
            threshold: 0.6,
            rootMargin: "0px 0px -30% 0px"
        }
    );

    sections.forEach((section) => observer.observe(section));
}

// ========== Destaque manual ao clicar ==========
function initNavClicks() {
    const navLinks = document.querySelectorAll(".nav-link");

    navLinks.forEach(link => {
        link.addEventListener("click", () => {
            const target = link.dataset.section;

            navLinks.forEach(l => {
                l.classList.remove("text-green-700", "border-b-2", "border-green-700", "bg-green-50");
                l.classList.add("text-gray-700");
            });

            link.classList.add("text-green-700", "border-b-2", "border-green-700", "bg-green-50");
            link.classList.remove("text-gray-700");
        });
    });
}

// ========== Inicialização dos modais ==========
function initModalTriggers() {
    document.body.addEventListener("click", function (e) {
        const target = e.target.closest('.open-modal');
        if (target) {
            e.preventDefault();
            const file = target.getAttribute("data-file");

            fetch(file)
                .then(res => res.text())
                .then(html => {
                    document.getElementById("conteudo-detalhe-modal").innerHTML = html;
                    document.getElementById("modal").classList.remove("hidden");

                    const voltarBtn = document.querySelector('#conteudo-detalhe-modal a[href*="#conteudos"]');
                    if (voltarBtn) {
                        voltarBtn.addEventListener("click", function (e) {
                            e.preventDefault();
                            document.getElementById("modal").classList.add("hidden");
                        });
                    }
                });
        }
    });

    const closeBtn = document.getElementById("closeModal");
    if (closeBtn) {
        closeBtn.addEventListener("click", () => {
            document.getElementById("modal").classList.add("hidden");
        });
    }

    const modal = document.getElementById("modal");
    modal.addEventListener("click", (event) => {
        const modalContent = modal.querySelector("div.bg-white");
        if (!modalContent.contains(event.target)) {
            modal.classList.add("hidden");
        }
    });
}


// ========== Inicialização do carrossel ==========
function initCarousel() {
    const carousel = document.getElementById("carousel");
    if (!carousel) return;

    const carouselInnerContainer = carousel.querySelector(".flex.space-x-6"); // O container real dos itens
    if (!carouselInnerContainer) {
        console.warn("Carousel inner container not found.");
        return;
    }

    const originalItems = Array.from(carouselInnerContainer.querySelectorAll(".carousel-item"));
    if (originalItems.length === 0) return;

    // 1. Clonar itens para o loop infinito
    originalItems.forEach(item => {
        const clone = item.cloneNode(true);
        carouselInnerContainer.appendChild(clone);
    });

    // 2. Calcular o ponto de reset
    // Este é o scrollLeft onde o primeiro item clonado começa a ser o principal.
    // É essencialmente a largura total dos itens originais mais os espaçamentos entre eles.
    let resetScrollPosition;
    if (originalItems.length > 0) {
        const firstClonedItem = carouselInnerContainer.children[originalItems.length];
        if (firstClonedItem) {
            resetScrollPosition = firstClonedItem.offsetLeft;
             // Subtrai o padding-left do container interno se houver, 
             // pois offsetLeft é relativo ao offsetParent, que pode ser o próprio carouselInnerContainer.
             // Neste caso, o carousel (pai) é o elemento de scroll, e o carouselInnerContainer é o filho que se move.
             // O offsetLeft do primeiro clone já é o ponto correto dentro do carouselInnerContainer.
        } else {
            // Fallback se algo der errado com a seleção do clone (improvável)
            resetScrollPosition = carouselInnerContainer.scrollWidth / 2;
        }
    }


    let isDown = false;
    let startX;
    let scrollLeftCarousel; // Renomeado para evitar conflito com window.scrollLeft
    let isDragging = false;
    let carouselScrollInterval;

    // Arraste com o mouse
    carousel.addEventListener("mousedown", (e) => {
        isDown = true;
        isDragging = false; // Reseta o estado de arrastar
        startX = e.pageX - carousel.offsetLeft;
        scrollLeftCarousel = carousel.scrollLeft;
        carousel.classList.add("cursor-grabbing");
        stopScroll(); // Para a rolagem automática ao iniciar o arraste
    });

    carousel.addEventListener("mouseleave", () => {
        if (isDown) { // Se o mouse saiu enquanto ainda estava pressionado
            isDown = false;
            carousel.classList.remove("cursor-grabbing");
            // Pequeno delay para diferenciar de um clique rápido que saiu da área
            setTimeout(() => startScroll(), 50);
        } else {
            startScroll(); // Se saiu sem estar pressionado, apenas reinicia
        }
    });

    carousel.addEventListener("mouseup", (e) => {
        const wasDragging = isDragging; // Captura o estado antes de resetar
        
        isDown = false;
        carousel.classList.remove("cursor-grabbing");
        
        // Reseta isDragging APÓS o evento de clique ser processado,
        // para que o listener de clique possa verificar seu valor.
        setTimeout(() => {
            isDragging = false;
        }, 0); // Próximo tick da event loop

        // Se não estava arrastando (foi um clique) ou se o mouse ainda está sobre o carrossel
        // E não é um clique que abre modal (que seria tratado pelo listener de clique)
        // Melhor sempre reiniciar o scroll a menos que um modal esteja para abrir.
        // A lógica de startScroll/stopScroll no mouseenter/mouseleave já cuida disso se o mouse estiver fora.
        // Se o mouse ainda está dentro do carrossel, o mouseenter não vai disparar.
        // Portanto, precisamos reiniciar aqui se o mouse está DENTRO do carrossel.
        const rect = carousel.getBoundingClientRect();
        const isMouseOverCarousel = e.clientX >= rect.left && e.clientX <= rect.right &&
                                   e.clientY >= rect.top && e.clientY <= rect.bottom;

        if (isMouseOverCarousel) {
            // Se o mouse ainda está sobre o carrossel, a rolagem automática deve permanecer parada
            // (devido ao mouseenter ter chamado stopScroll). Apenas reinicia se o mouse sair.
            // No entanto, se não houve drag, e foi um clique, o comportamento padrão de clique acontece.
            // O stopScroll já foi chamado pelo mouseenter/mousedown.
        } else {
            startScroll(); // Se o mouse foi solto FORA, reinicia
        }
    });

    carousel.addEventListener("mousemove", (e) => {
        if (!isDown) return;
        e.preventDefault(); // Previne seleção de texto
        const x = e.pageX - carousel.offsetLeft;
        const walk = (x - startX) * 2; // Multiplicador para acelerar o arraste

        if (Math.abs(walk) > 5) { // Limiar para considerar como arrastar
            isDragging = true;
        }
        carousel.scrollLeft = scrollLeftCarousel - walk;

        // Lógica de loop durante o arraste manual
        if (carousel.scrollLeft >= resetScrollPosition) {
            carousel.scrollLeft -= resetScrollPosition;
            scrollLeftCarousel -= resetScrollPosition; // Ajusta a referência para o próximo movimento
        } else if (carousel.scrollLeft <= 0 && scrollLeftCarousel > 0) { // Se arrastou para a esquerda além do início
            // Esta parte é mais complexa para loop bidirecional perfeito no drag.
            // Para um loop unidirecional simples, basta o reset ao atingir o fim.
            // Se arrastou muito para a esquerda, e temos clones à direita, poderíamos pular para o final dos clones.
            // No nosso caso, a duplicação é [A,B,C] -> [A,B,C,A,B,C].
            // Se scrollLeft se torna < 0, significa que estamos no "primeiro A".
            // Poderíamos pular para o "segundo A" se quiséssemos um loop para a esquerda.
            // Por ora, o navegador impede scrollLeft < 0 por padrão.
        }
    });

    // Impede a abertura do modal se foi um arraste (delegado ao carrossel)
    carousel.addEventListener("click", (e) => {
        if (isDragging) {
            // Verifica se o clique foi em um item que poderia abrir modal
            if (e.target.closest('.open-modal')) {
                e.preventDefault();
                e.stopPropagation(); // Impede outros listeners de clique, como o do body para modais
            }
        }
    }, true); // Use capture para rodar antes do listener de modal no body

    // Rolagem automática
    function startScroll() {
        if (carouselScrollInterval) clearInterval(carouselScrollInterval); // Limpa intervalo existente

        // Só inicia se o mouse não estiver pressionado E se o carrossel estiver visível/ativo
        if (isDown || !document.contains(carousel)) return;

        carouselScrollInterval = setInterval(() => {
            carousel.scrollLeft += 1; // Ajuste a velocidade conforme necessário
            
            // 3. Lógica de loop na rolagem automática
            if (carousel.scrollLeft >= resetScrollPosition) {
                carousel.scrollLeft -= resetScrollPosition;
            }
        }, 10); // Intervalo de rolagem (ms), menor = mais rápido e suave
    }

    function stopScroll() {
        clearInterval(carouselScrollInterval);
    }

    carousel.addEventListener("mouseenter", stopScroll);
    // mouseleave já está coberto acima para reiniciar o scroll
    // se o botão do mouse não estiver pressionado

    // Verifica se a aba está visível para pausar/retomar a animação
    document.addEventListener("visibilitychange", () => {
        if (document.hidden) {
            stopScroll();
        } else {
            // Apenas reinicia se o mouse não estiver sobre o carrossel (que já pararia)
            // e se o botão não estiver pressionado
            if (!carousel.matches(':hover') && !isDown) {
                startScroll();
            }
        }
    });

    startScroll();
}