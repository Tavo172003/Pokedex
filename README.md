# 🎮 Pokédex Interactiva

¡Bienvenido a la **Pokédex Interactiva**! Un proyecto web dinámico que consume la API oficial de Pokémon (**PokeAPI**) para listar, buscar y filtrar información detallada de más de 1000 Pokémon, envuelto en una interfaz de usuario retro inspirada en los juegos clásicos de la franquicia.

Desarrollado por **Gustavo Correia**.

---

## 🚀 Características Principales

*   **Carga Optimizada por Bloques (Chunks):** Maneja la descarga paralela de datos en bloques de 50 Pokémon para no saturar el navegador ni la API, garantizando una carga fluida y un rendimiento óptimo.
*   **Filtros Avanzados:** 
    *   Búsqueda en tiempo real por nombre o ID numérico (con sanitización de caracteres).
    *   Filtrado selectivo por **Generación** (desde Kanto hasta Paldea, Gen 1 a Gen 9).
    *   Filtrado por **Tipo** (Fuego, Agua, Planta, etc.) con traducción automática al español.
*   **Modal de Detalles Completo:** Al hacer clic en cualquier Pokémon se despliega una ventana interactiva con:
    *   Estadísticas base representadas con barras de progreso visuales.
    *   Descripción oficial en español, altura, peso y habilidades.
    *   **Cadena de Evolución Dinámica:** Genera de forma gráfica la línea evolutiva usando modelos en alta definición e indicando el método exacto (nivel, objetos, intercambio, felicidad, etc.).
    *   **Zonas de Ubicación:** Muestra en qué áreas y versiones de los juegos se puede capturar dicho Pokémon.
*   **Sistema de Audio Integrado:** Incluye un botón para reproducir el **grito real** del Pokémon directamente desde los archivos oficiales.
*   **Navegación Fluida:** Botones de navegación interna (`<` y `>`) dentro del modal para explorar Pokémon adyacentes sin cerrar la ventana.
*   **Resiliencia a Errores:** Pantalla de error personalizada en caso de que el usuario no disponga de conexión a Internet o la API se encuentre caída, permitiendo reintentar la carga de forma segura.
*   **Diseño Totalmente Responsivo:** Interfaz adaptada minuciosamente para dispositivos móviles, tabletas y pantallas de escritorio mediante CSS Grid y Media Queries.

---

## 🛠️ Tecnologías Utilizadas

*   **HTML5:** Estructuración semántica del catálogo, filtros y estructuras modales.
*   **CSS3 Avanzado:**
    *   Diseño retro con estéticas *pixel-art* basadas en fuentes externas como `Pokemon GB` y `Press Start 2P`.
    *   Uso de variables nativas CSS (`:root`) para la gestión dinámica de colores por tipo de Pokémon.
    *   Efectos de elevación, transformaciones 3D sutiles en estados `:hover` y `:active`.
    *   Animaciones personalizadas de carga (`spinPokeball`, `fadeInScale`).
*   **JavaScript (Vanilla JS):**
    *   Asincronía pura mediante `Fetch API`, `Async/Await` y `Promise.all` para operaciones concurrentes.
    *   Manipulación dinámica del DOM y arquitectura orientada a eventos.
    *   Uso de `MutationObserver` para garantizar la inyección correcta de estilos en nodos renderizados en tiempo de ejecución.
*   **PokeAPI:** Fuente externa de datos de donde se extraen todas las estadísticas, sprites de alta calidad (Official Artwork) y metadatos.

---

## 📂 Estructura del Proyecto

```text
├── CSS/
│   └── PokeEstilos.css       # Estilos generales, animaciones y diseño responsivo
├── JS/
│   └── PokeApi.js            # Lógica de peticiones, filtros, paginación y modal
└── HTML/
    └── index.html            # Estructura principal de la aplicación
