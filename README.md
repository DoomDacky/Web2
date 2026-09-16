# Web2 — Generador de Perfiles

Interfaz web reactiva (SPA en JavaScript vanilla) que permite construir una
tarjeta de perfil y ver los cambios reflejados en tiempo real.

## Funcionalidad

- **Previsualización en vivo**: nombre, biografía y color de acento se
  actualizan en la tarjeta conforme se escribe, sin recargar la página.
- **Selector de avatares**: catálogo de 12 imágenes locales generado
  dinámicamente, con corrección de encuadre por imagen para que el recorte
  cuadrado no corte las caras.
- **Consumo de API**: autocompletado desde la API pública de GitHub
  (`https://api.github.com/users/:usuario`) para rellenar nombre, biografía y
  avatar a partir de un usuario existente.
- **Estado centralizado**: un único objeto `state` es la fuente de verdad; la
  vista se renderiza a partir de él.
- **Guardar tarjetas**: el botón *Guardar Tarjeta* envía el estado por `POST`
  a `api/guardar-tarjeta.php`, que le asigna `id` y `createdAt` y lo anexa a
  `api/tarjetas-usuarios.json`.
- **Galería**: la vista `#/galeria` lee ese JSON y muestra todas las tarjetas
  guardadas (de la más reciente a la más antigua), con botón para recargar.
- **Enrutador por hash**: `#/crear` y `#/galeria` cambian de vista sin recargar
  la página.
- **Respaldo local**: si la respuesta de `api/guardar-tarjeta.php` no es JSON
  (porque el hosting no ejecuta PHP), la tarjeta se guarda en `localStorage`
  bajo la clave `tarjetas-usuarios` y la Galería la muestra junto con las del
  servidor.

## Estructura

```
.
├── index.html                 Estructura de la SPA (vistas Crear y Galería)
├── css/estilos.css            Estilos
├── js/app.js                  Estado, render, eventos, guardado, galería y enrutador
├── api/guardar-tarjeta.php    Endpoint que guarda la tarjeta en el JSON
├── api/tarjetas-usuarios.json Generado en tiempo de ejecución (no se versiona)
└── src/assets/                Avatares (Avatar0–Avatar11) y documento del curso
```

## Ejecutar en local

El guardado usa PHP, así que hay que servir el proyecto con un servidor que lo
ejecute (Apache/XAMPP o el servidor embebido de PHP):

```bash
php -S localhost:8000
```

Luego abrir <http://localhost:8000>.

PHP necesita permiso de escritura en la carpeta `api/` para crear
`tarjetas-usuarios.json`; si no lo tiene, el guardado responde
`Error de permisos`.

## Publicación en Vercel

El repositorio está conectado a Vercel (<https://web2-sfg7.vercel.app>), que
publica la rama `main` como sitio estático. Vercel **no ejecuta PHP**, así que
ahí `api/guardar-tarjeta.php` nunca responde: el guardado y la Galería caen al
respaldo en `localStorage` descrito arriba. Con Apache/XAMPP en local sí se usa
el PHP y el JSON del servidor.

## Tecnologías

HTML5, CSS3 y JavaScript ES6+ en el cliente; PHP (sin frameworks) para el
guardado en servidor, con respaldo en `localStorage` del navegador.
