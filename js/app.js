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
});
 