document.addEventListener("DOMContentLoaded", function () {
    // ========== Menu dinâmico com destaque ==========
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
            threshold: 0.3,
        }
    );

    sections.forEach((section) => observer.observe(section));

    // ========== Controle do menu mobile ==========
    const menuButton = document.getElementById("mobile-menu-button");
    const mobileMenu = document.getElementById("mobile-menu");

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

    // Carregar as sections
    loadSectionsAndInit(() => {
        console.log("Home carregada e scripts iniciados.");
        initModalTriggers(); // esta linha é essencial
        initCarousel(); // agora chamado após as seções serem carregadas
    });
});

const sections = [
    { id: "home", file: "home.html" },
    { id: "sobre", file: "sobre.html" },
    { id: "conteudos", file: "conteudos.html" }
];

// Função para carregar os HTMLs e iniciar
function loadSectionsAndInit(callback) {
    const promises = sections.map(section =>
        fetch(section.file)
            .then(res => res.text())
            .then(html => {
                document.getElementById(section.id).innerHTML = html;
            })
    );

    Promise.all(promises).then(() => {
        backToTopButton = document.querySelector('.back-to-top');
        callback();
    });
}

// ========== Inicialização dos modais ==========
function initModalTriggers() {
    // Seleciona todos os botões "Saiba mais" carregados dinamicamente
    document.querySelectorAll('.open-modal').forEach(link => {
        link.addEventListener("click", function (e) {
            e.preventDefault();
            const file = this.getAttribute("data-file");

            fetch(file)
                .then(res => res.text())
                .then(html => {
                    document.getElementById("conteudo-detalhe-modal").innerHTML = html;
                    document.getElementById("modal").classList.remove("hidden");

                    // Botão "voltar" dentro do conteúdo injetado
                    const voltarBtn = document.querySelector('#conteudo-detalhe-modal a[href*="#conteudos"]');
                    if (voltarBtn) {
                        voltarBtn.addEventListener("click", function (e) {
                            e.preventDefault();
                            document.getElementById("modal").classList.add("hidden");
                        });
                    }
                });
        });
    });

    // Botão "X" fecha o modal
    const closeBtn = document.getElementById("closeModal");
    if (closeBtn) {
        closeBtn.addEventListener("click", () => {
            document.getElementById("modal").classList.add("hidden");
        });
    }

    // Fecha o modal ao clicar fora do conteúdo
    const modal = document.getElementById("modal");
    modal.addEventListener("click", (event) => {
        // Fecha somente se o clique for no fundo, e não no conteúdo
        if (event.target === modal) {
            modal.classList.add("hidden");
        }
    });
}


// ========== Inicialização do carrossel ==========
function initCarousel() {
    const carousel = document.getElementById("carousel");
    if (!carousel) return;

    let isDown = false;
    let startX;
    let scrollLeft;

    const carouselContent = carousel.querySelector('.flex');
    if (carouselContent) {
        const clone = carouselContent.cloneNode(true);
        carouselContent.appendChild(clone);
    }

    carousel.addEventListener("mousedown", (e) => {
        isDown = true;
        startX = e.pageX - carousel.offsetLeft;
        scrollLeft = carousel.scrollLeft;
    });

    carousel.addEventListener("mouseleave", () => {
        isDown = false;
        clearInterval(carouselScroll);
    });

    carousel.addEventListener("mouseup", () => {
        isDown = false;
    });

    carousel.addEventListener("mousemove", (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - carousel.offsetLeft;
        const walk = (x - startX) * 2;
        carousel.scrollLeft = scrollLeft - walk;
    });

    let carouselScroll;
    carousel.addEventListener("mouseleave", () => {
        carouselScroll = setInterval(function () {
            carousel.scrollLeft += 1;

            if (carousel.scrollLeft >= carousel.scrollWidth / 2) {
                carousel.scrollLeft = 0;
            }
        }, 10);
    });

    carousel.addEventListener("mouseenter", () => {
        clearInterval(carouselScroll);
    });
}
