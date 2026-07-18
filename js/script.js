const body = document.body;
const menuButton = document.getElementById('mobileMenu');
const sidebarBackdrop = document.getElementById('sidebarBackdrop');
const sideLinks = [...document.querySelectorAll('.side-link')];
const observedSections = sideLinks
    .map(link => document.getElementById(link.dataset.section))
    .filter(Boolean);
const revealElements = [...document.querySelectorAll('.reveal')];
const projectModal = document.getElementById('projectModal');
const modalClose = document.getElementById('modalClose');
let scrollAnimationFrame = null;
let scrollBehaviorBeforeAnimation = '';
let isProgrammaticScrolling = false;

const projectData = {
    modalidades: {
        label: 'Análisis de sistemas · Proyecto universitario',
        title: 'Sistema de Gestión de Modalidades de Egreso',
        summary: 'Diseño de una solución digital para organizar el registro, la revisión documental y las aprobaciones involucradas en las modalidades de egreso universitarias.',
        objective: 'Reducir tareas manuales, centralizar la documentación y dar visibilidad al estado de cada solicitud.',
        role: 'Análisis del proceso, definición de actores y casos de uso, elaboración de flujos y diseño de interfaces de alta fidelidad.',
        highlights: [
            'Casos de uso para estudiante, profesor asesor, secretaría, jefe de departamento y autoridades académicas.',
            'Pantallas coherentes para registro, revisión, validación y seguimiento.',
            'Modelado de información y relaciones para soportar el proceso académico.'
        ],
        tags: ['UML', 'Casos de uso', 'UI/UX', 'MySQL', 'Documentación']
    },
    pediatria: {
        label: 'Python · Aprendizaje automático · Investigación',
        title: 'Predicción Pediátrica Respiratoria',
        summary: 'Proyecto que combina programación, análisis de datos y comunicación científica para explorar la clasificación de condiciones respiratorias pediátricas.',
        objective: 'Construir una aplicación comprensible que apoye el análisis de variables clínicas y presente los resultados de manera clara.',
        role: 'Preparación del código, integración del modelo, diseño de una interfaz en Streamlit y apoyo en el banner y artículo científico.',
        highlights: [
            'Procesamiento de datos con Python y pandas.',
            'Modelos de clasificación y evaluación de resultados.',
            'Presentación del proyecto mediante aplicación, banner y artículo científico.'
        ],
        tags: ['Python', 'pandas', 'scikit-learn', 'XGBoost', 'Streamlit']
    },
    fashion: {
        label: 'Proyecto personal · En planificación',
        title: 'Fashion Retail Analytics',
        summary: 'Dashboard en línea para analizar ventas, inventario, clientes y rentabilidad de una tienda de moda con una experiencia visual elegante y coherente.',
        objective: 'Crear un proyecto integral que demuestre análisis de datos, diseño de dashboards, consultas SQL y publicación web.',
        role: 'Conceptualización, modelado de la base de datos, construcción del dashboard y definición de indicadores de negocio.',
        highlights: [
            'Resumen ejecutivo con ingresos, beneficio, pedidos y ticket promedio.',
            'Análisis de inventario, tallas, colores, categorías y devoluciones.',
            'Segmentación de clientes y rendimiento de campañas promocionales.'
        ],
        tags: ['Python', 'Plotly', 'Streamlit', 'SQLAlchemy', 'MySQL']
    }
};

function setMenu(open) {
    body.classList.toggle('menu-open', open);
    menuButton?.setAttribute('aria-expanded', String(open));
    menuButton?.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
}

menuButton?.addEventListener('click', () => setMenu(!body.classList.contains('menu-open')));
sidebarBackdrop?.addEventListener('click', () => setMenu(false));
const sectionNavigationLinks = [...document.querySelectorAll('a[href^="#"]')]
    .filter(link => !link.classList.contains('skip-link') && document.getElementById(link.getAttribute('href').slice(1)));
sectionNavigationLinks.forEach(link => link.addEventListener('click', handleSectionNavigation));

document.addEventListener('keydown', event => {
    if (event.key === 'Escape') setMenu(false);

    if (['PageUp', 'PageDown', 'Home', 'End', 'ArrowUp', 'ArrowDown', ' '].includes(event.key)) {
        cancelDocumentScroll();
    }
});

function setActiveSideLink(sectionId) {
    sideLinks.forEach(link => {
        link.classList.toggle('is-active', link.dataset.section === sectionId);
    });
}

function easeInOutSine(progress) {
    return -(Math.cos(Math.PI * progress) - 1) / 2;
}

function destinationScrollPosition(target) {
    const absoluteTop = target.getBoundingClientRect().top + window.scrollY;
    const maximumScroll = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
    return Math.max(0, Math.min(Math.round(absoluteTop), maximumScroll));
}

function finishDocumentScroll() {
    if (scrollAnimationFrame !== null) {
        cancelAnimationFrame(scrollAnimationFrame);
        scrollAnimationFrame = null;
    }

    document.documentElement.style.scrollBehavior = scrollBehaviorBeforeAnimation;
    isProgrammaticScrolling = false;
}

function cancelDocumentScroll() {
    if (scrollAnimationFrame === null) return;
    finishDocumentScroll();
}

function animateDocumentScroll(target, destinationId) {
    cancelDocumentScroll();

    const startY = window.scrollY;
    const targetY = destinationScrollPosition(target);
    const distance = targetY - startY;

    setActiveSideLink(destinationId);

    if (Math.abs(distance) < 2) {
        history.replaceState(null, '', `#${destinationId}`);
        return;
    }

    const root = document.documentElement;
    scrollBehaviorBeforeAnimation = root.style.scrollBehavior;
    root.style.scrollBehavior = 'auto';
    isProgrammaticScrolling = true;

    // La duración depende del recorrido para que las secciones intermedias
    // permanezcan visibles al saltar entre destinos alejados.
    const viewportCount = Math.abs(distance) / Math.max(window.innerHeight, 1);
    const duration = Math.min(4200, Math.max(900, 700 + viewportCount * 430));
    const startedAt = performance.now();

    function step(now) {
        const progress = Math.min((now - startedAt) / duration, 1);
        const easedProgress = easeInOutSine(progress);
        window.scrollTo(0, startY + distance * easedProgress);

        if (progress < 1) {
            scrollAnimationFrame = requestAnimationFrame(step);
            return;
        }

        window.scrollTo(0, targetY);
        scrollAnimationFrame = null;
        root.style.scrollBehavior = scrollBehaviorBeforeAnimation;
        isProgrammaticScrolling = false;
        setActiveSideLink(destinationId);
        history.replaceState(null, '', `#${destinationId}`);
    }

    scrollAnimationFrame = requestAnimationFrame(step);
}

function handleSectionNavigation(event) {
    event.preventDefault();

    const link = event.currentTarget;
    const destinationId = link.dataset.section || link.getAttribute('href').slice(1);
    const target = document.getElementById(destinationId);

    setMenu(false);
    if (!target) return;

    link.classList.remove('section-link-pressed');
    void link.offsetWidth;
    link.classList.add('section-link-pressed');
    window.setTimeout(() => link.classList.remove('section-link-pressed'), 420);

    animateDocumentScroll(target, destinationId);
}

window.addEventListener('wheel', cancelDocumentScroll, { passive: true });
window.addEventListener('touchstart', cancelDocumentScroll, { passive: true });

const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            revealObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.12 });
revealElements.forEach(element => revealObserver.observe(element));

const sectionObserver = new IntersectionObserver(entries => {
    if (isProgrammaticScrolling) return;

    const visible = entries
        .filter(entry => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (!visible) return;
    setActiveSideLink(visible.target.id);
}, { rootMargin: '-25% 0px -60% 0px', threshold: [0.05, 0.2, 0.5] });
observedSections.forEach(section => sectionObserver.observe(section));

function openProject(projectKey) {
    const project = projectData[projectKey];
    if (!project || !projectModal) return;

    document.getElementById('modalLabel').textContent = project.label;
    document.getElementById('modalTitle').textContent = project.title;
    document.getElementById('modalSummary').textContent = project.summary;
    document.getElementById('modalObjective').textContent = project.objective;
    document.getElementById('modalRole').textContent = project.role;

    const highlights = document.getElementById('modalHighlights');
    highlights.replaceChildren(...project.highlights.map(item => {
        const li = document.createElement('li');
        li.textContent = item;
        return li;
    }));

    const tags = document.getElementById('modalTags');
    tags.replaceChildren(...project.tags.map(item => {
        const span = document.createElement('span');
        span.textContent = item;
        return span;
    }));

    projectModal.showModal();
}

document.querySelectorAll('[data-project]').forEach(button => {
    button.addEventListener('click', () => openProject(button.dataset.project));
});
modalClose?.addEventListener('click', () => projectModal.close());
projectModal?.addEventListener('click', event => {
    if (event.target === projectModal) projectModal.close();
});

document.getElementById('year').textContent = new Date().getFullYear();
