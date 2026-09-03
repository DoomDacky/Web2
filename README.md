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

## Estructura

```
.
├── index.html          Estructura de la SPA
├── css/estilos.css     Estilos
├── js/app.js           Estado, render y eventos
└── src/assets/         Avatares (Avatar0–Avatar11) y documento del curso
```

## Ejecutar en local

Al consumir una API por `fetch`, conviene servir los archivos por HTTP en lugar
de abrir `index.html` directamente:

```bash
python3 -m http.server 8000
```

Luego abrir <http://localhost:8000>.

## Tecnologías

HTML5, CSS3 y JavaScript ES6+ — sin frameworks ni dependencias.
