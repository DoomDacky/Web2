/**
 * ESTADO GLOBAL
 */
const state = {
    cardData: {
        name: '',
        bio: '',
        avatarUrl: 'src/assets/Avatar0.jpg', // Avatar por defecto
        avatarPos: 'center center',  // Encuadre del avatar seleccionado
        color: '#3b82f6'
    }
};
 
/**
 * REFERENCIAS AL DOM
 */
const dom = {
    inputName: document.getElementById('input-name'),
    inputBio: document.getElementById('input-bio'),
    inputColor: document.getElementById('input-color'),
    inputSearch: document.getElementById('github-search'),
    btnFetch: document.getElementById('btn-fetch'),
    apiStatus: document.getElementById('api-status'),
    form: document.getElementById('profile-form'),
    avatarSelector: document.getElementById('avatar-selector'),
    previewName: document.getElementById('name-preview'),
    previewBio: document.getElementById('bio-preview'),
    previewAvatar: document.getElementById('avatar-preview'),
    previewHeader: document.getElementById('preview-header'),
    viewCreate: document.getElementById('view-create'),
    // Módulo de Galería y navegación SPA
    viewGallery: document.getElementById('view-gallery'),
    navLinks: document.querySelectorAll('.nav-link'),
    galleryContainer: document.getElementById('gallery-container'),
    btnReloadGallery: document.getElementById('btn-reload-gallery'),
};
 
/**
 * CATÁLOGO DE AVATARES
 * Todos los archivos siguen el patrón AvatarN.jpg (Avatar0 ... Avatar11),
 * así que no hace falta listarlos a mano: los generamos con un for.
 */
const AVATARES = {
    ruta: 'src/assets',
    prefijo: 'Avatar',
    extension: '.jpg',
    total: 12
};

/**
 * ENCUADRE POR AVATAR
 * Las miniaturas y la foto de la tarjeta son cuadradas (aspect-ratio: 1 +
 * object-fit: cover), así que las imágenes rectangulares se recortan.
 * Aquí decimos QUÉ zona de cada imagen debe quedar centrada en ese cuadrado.
 * Sólo se listan las que necesitan corrección; el resto usa el centro.
 */
const ENCUADRES = {
    1: 'center 8%',    // 333x480  - cuerpo entero: subimos el recorte a la cara
    2: 'center top',   // 640x853  - retrato vertical: la cabeza queda arriba
    3: 'center 48%',   // 298x671  - muy alta: el contenido real está al centro
    5: 'center 38%',   // 958x842  - apaisada: la cara está por encima del centro
    7: 'center 45%',   // 750x1000 - la pirámide se centra un poco más arriba
    11: 'center 62%'   // 399x501  - la cara está en la mitad baja del encuadre
};
const ENCUADRE_POR_DEFECTO = 'center center';

/** Devuelve la ruta del avatar número i: src/assets/Avatar3.jpg */
const rutaAvatar = (i) => `${AVATARES.ruta}/${AVATARES.prefijo}${i}${AVATARES.extension}`;

/** Devuelve el encuadre del avatar número i */
const encuadreAvatar = (i) => ENCUADRES[i] || ENCUADRE_POR_DEFECTO;

/**
 * GENERADOR DEL SELECTOR DE AVATARES
 * Crea los elementos <img> dinámicamente recorriendo el rango 0..total-1.
 */
const initAvatarSelector = () => {
    for (let i = 0; i < AVATARES.total; i++) {
        const rutaImagen = rutaAvatar(i);
        const encuadre = encuadreAvatar(i);

        const img = document.createElement('img');
        img.src = rutaImagen;
        img.alt = `Avatar ${i}`;
        img.className = 'avatar-option';
        // Guardamos la ruta y el encuadre en atributos de datos
        img.dataset.url = rutaImagen;
        img.dataset.encuadre = encuadre;
        // Ajuste del recorte: así las imágenes rectangulares "caben" bien
        img.style.objectPosition = encuadre;

        // Si el archivo no existe, quitamos la miniatura en vez de dejar el ícono roto
        img.addEventListener('error', () => img.remove());

        // Evento: Al hacer clic en una miniatura, actualizamos el estado global
        img.addEventListener('click', () => {
            state.cardData.avatarUrl = rutaImagen;
            state.cardData.avatarPos = encuadre;
            renderCard(); // Forzamos la actualización de la UI
        });

        dom.avatarSelector.appendChild(img); // Insertar la imagen en el contenedor
    }
};
 
/**
 * FUNCIÓN DE RENDERIZADO (Reactividad)
 */
const renderCard = () => {
    dom.previewName.textContent = state.cardData.name || 'Nombre Apellido';
    dom.previewBio.textContent = state.cardData.bio || 'La biografía aparecerá aquí...';
    dom.previewAvatar.src = state.cardData.avatarUrl;
    dom.previewAvatar.style.objectPosition = state.cardData.avatarPos;
    dom.previewHeader.style.backgroundColor = state.cardData.color;
    dom.inputName.value = state.cardData.name;
    dom.inputBio.value = state.cardData.bio;
    dom.inputColor.value = state.cardData.color;
    // Actualizar visualmente qué avatar está seleccionado en la cuadrícula
    const avatares = dom.avatarSelector.querySelectorAll('.avatar-option');
    avatares.forEach(img => {
        if (img.dataset.url === state.cardData.avatarUrl) {
            img.classList.add('selected');
        } else {
            img.classList.remove('selected');
        }
    });
};
 
/**
 * Consumo DE API Github
 */
const fetchGitHubData = async (username) => {
    if (!username) return;

    dom.apiStatus.textContent = 'Buscando usuario en GitHub...';
    dom.apiStatus.className = 'status-msg status-loading';
    dom.btnFetch.disabled = true;

    try {
        const response = await fetch(`https://api.github.com/users/${username}`);

        if (!response.ok) throw new Error('Usuario no encontrado');

        const data = await response.json();

        state.cardData.name = data.name || data.login;
        state.cardData.bio = data.bio || 'Este usuario no tiene biografia publica.';
        state.cardData.avatarUrl = data.avatar_url;
        // El avatar de GitHub ya viene cuadrado: usamos el encuadre por defecto
        state.cardData.avatarPos = ENCUADRE_POR_DEFECTO;

        renderCard();

        dom.apiStatus.textContent = '¡Datos cargados correctamente!';
        dom.apiStatus.className = 'status-msg status-success';

    } catch (error) {
        dom.apiStatus.textContent = error.message;
        dom.apiStatus.className = 'status-msg status-error';
    } finally {
        dom.btnFetch.disabled = false;
        setTimeout(() => dom.apiStatus.textContent = '', 3000);
    }
};

/**
 * RESPALDO LOCAL (localStorage) — NUEVO (SP2-1)
 * El guardado "de verdad" lo hace `api/guardar-tarjeta.php`, pero la página
 * también se publica en un hosting estático (Vercel) que NO ejecuta PHP.
 * Cuando no hay servidor que responda, la tarjeta se queda en el navegador
 * bajo esta clave y la Galería la lee de ahí.
 */
const CLAVE_RESPALDO = 'tarjetas-usuarios';

const leerRespaldoLocal = () => {
    try {
        const guardado = JSON.parse(localStorage.getItem(CLAVE_RESPALDO));
        return Array.isArray(guardado) ? guardado : [];
    } catch (error) {
        console.error('No se pudo leer el respaldo local:', error);
        return [];
    }
};

const guardarRespaldoLocal = (tarjeta) => {
    // Misma forma de `id` y `createdAt` que usa el PHP, para que la Galería
    // pueda mezclar las tarjetas del servidor con las del navegador sin notar diferencia
    const ahora = new Date();
    const fecha = ahora.toLocaleString('sv-SE'); // 'sv-SE' da el formato YYYY-MM-DD HH:MM:SS

    const tarjetas = leerRespaldoLocal();
    tarjetas.push({
        ...tarjeta,
        id: 'user_' + ahora.getTime().toString(16),
        createdAt: fecha,
        origen: 'local'
    });

    localStorage.setItem(CLAVE_RESPALDO, JSON.stringify(tarjetas));
};

/**
 * CONSUMO DE API INTERNA (Guardar en el servidor)
 * Envía state.cardData al PHP, que lo agrega a api/tarjetas-usuarios.json.
 */
const saveCardToServer = async () => {
    // Validación: no guardamos si no hay al menos un nombre
    if (!state.cardData.name.trim()) {
        alert('Por favor, ingresa un nombre para la tarjeta.');
        return;
    }

    const btnSubmit = dom.form.querySelector('button[type="submit"]');
    const textoOriginal = btnSubmit.textContent;

    btnSubmit.textContent = 'Guardando en servidor...';
    btnSubmit.disabled = true;

    try {
        const formData = new FormData();
        formData.append('datos_tarjeta', JSON.stringify(state.cardData));

        // MODIFICADO (SP2-1): la petición puede fallar por red o caer en un
        // hosting sin PHP, así que la aislamos para poder distinguir los casos.
        let response = null;
        try {
            response = await fetch('api/guardar-tarjeta.php', {
                method: 'POST',
                body: formData
            });
        } catch (errorDeRed) {
            console.error('No hubo respuesta del servidor:', errorDeRed);
        }

        // Sin PHP detrás, el .php se sirve como texto plano o responde 404:
        // en ningún caso llega JSON. Ahí guardamos en el navegador.
        const tipo = response ? (response.headers.get('content-type') || '') : '';
        if (!tipo.includes('application/json')) {
            guardarRespaldoLocal(state.cardData);
            alert('Este servidor no ejecuta PHP; la tarjeta se guardó en este navegador.');
            return;
        }

        // El PHP siempre responde JSON (éxito o error), así que lo parseamos directo
        const result = await response.json();

        if (!response.ok) {
            // Lanzamos el error específico que nos mandó PHP
            throw new Error(result.error || 'El servidor rechazó la petición.');
        }

        alert(result.message || '¡Tarjeta guardada con éxito!');
    } catch (error) {
        alert('Error: ' + error.message);
        console.error('Error al guardar la tarjeta:', error);
    } finally {
        btnSubmit.textContent = textoOriginal;
        btnSubmit.disabled = false;
    }
};

/**
 * GALERÍA (Consumo y Renderizado)
 * Lee el JSON con todas las tarjetas guardadas y las pinta en la vista de Galería.
 */
const loadGalleryData = async () => {
    dom.galleryContainer.innerHTML = '<p class="status-msg status-loading">Cargando tarjetas...</p>';

    // MODIFICADO (SP2-1): la galería junta lo que haya en el servidor con el
    // respaldo del navegador, así se ve igual en Apache local y en Vercel.
    let tarjetas = [];

    try {
        // ?t=Date.now() evita que el navegador sirva una copia en caché del JSON
        const response = await fetch(`api/tarjetas-usuarios.json?t=${Date.now()}`);

        // Si no hay JSON (404 en el hosting estático) seguimos con el respaldo
        if (response.ok) {
            const datos = await response.json();
            if (Array.isArray(datos)) tarjetas = datos;
        }
    } catch (error) {
        console.error('No se pudo leer el JSON del servidor:', error);
    }

    tarjetas = tarjetas.concat(leerRespaldoLocal());

    if (tarjetas.length === 0) {
        dom.galleryContainer.innerHTML =
            '<p class="status-msg status-error">Aún no hay tarjetas guardadas.</p>';
        return;
    }

    dom.galleryContainer.innerHTML = '';

    // De la más reciente a la más antigua
    tarjetas.reverse().forEach(tarjeta => {
        const card = document.createElement('article');
        card.className = 'card';

        const header = document.createElement('div');
        header.className = 'card-header';
        header.style.backgroundColor = tarjeta.color;

        const avatar = document.createElement('img');
        avatar.className = 'avatar';
        avatar.src = tarjeta.avatarUrl;
        avatar.alt = `Avatar de ${tarjeta.name}`;
        // Respetamos el encuadre con el que se guardó la tarjeta
        avatar.style.objectPosition = tarjeta.avatarPos || ENCUADRE_POR_DEFECTO;

        const body = document.createElement('div');
        body.className = 'card-body';
        const name = document.createElement('h3');
        name.textContent = tarjeta.name;
        const bio = document.createElement('p');
        bio.className = 'card-bio';
        bio.textContent = tarjeta.bio;
        body.append(name, bio);

        card.append(header, avatar, body);
        dom.galleryContainer.appendChild(card);
    });
};

/**
 * ENRUTADOR BASADO EN HASH (SPA)
 * Cambia entre #/crear y #/galeria sin recargar la página.
 */
const handleRouting = () => {
    const currentHash = window.location.hash || '#/crear';
    const enGaleria = currentHash === '#/galeria';

    // Resalta el enlace activo del menú
    dom.navLinks.forEach(link => {
        link.classList.toggle('active', link.getAttribute('href') === currentHash);
    });

    // Sólo la vista con .active se muestra (ver .view-module en el CSS)
    dom.viewCreate.classList.toggle('active', !enGaleria);
    dom.viewGallery.classList.toggle('active', enGaleria);

    if (enGaleria) loadGalleryData();
};

/**
 * EVENTOS MANUALES
 */
const setupManualEvents = () => {
    dom.inputName.addEventListener('input', (e) => {
        state.cardData.name = e.target.value; // Guardar nombre
        renderCard(); // Actualizar tarjeta
    });
 
    dom.inputBio.addEventListener('input', (e) => {
        state.cardData.bio = e.target.value;
        renderCard();
    });
 
    dom.inputColor.addEventListener('input', (e) => {
        state.cardData.color = e.target.value; // Guardar color
        renderCard();
    });
 
    dom.form.addEventListener('submit', (e) => {
        e.preventDefault(); // Evitar recargar la página al enviar el formulario
        saveCardToServer();
    });
};
 
/**
 * INICIALIZACIÓN DE LA APLICACIÓN
 */
document.addEventListener('DOMContentLoaded', () => {
    initAvatarSelector(); // Inicializamos la cuadrícula de imágenes
    setupManualEvents(); // Configurar eventos del formulario
    dom.btnFetch.addEventListener('click', ()=>{
        const username = dom.inputSearch.value.trim();
        fetchGitHubData(username);
    })
    dom.inputSearch.addEventListener('keypress', (e) => {
        if(e.key === 'Enter'){
            e.preventDefault();
            dom.btnFetch.click();
        }
    })
    renderCard(); // Renderizar la tarjeta inicial

    // Enrutamiento SPA y botón "Actualizar Galería"
    window.addEventListener('hashchange', handleRouting);
    dom.btnReloadGallery.addEventListener('click', loadGalleryData);
    handleRouting(); // Mostrar la vista que corresponde al hash actual
});
 