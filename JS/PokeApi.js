// Creado por : Gustavo Correia // 

function showCreatorInfo() {
    alert("Creado por : Gustavo Correia\n\n" +
        "Este proyecto es una Pokédex interactiva que utiliza la PokeAPI para mostrar información sobre Pokémon de diferentes generaciones y tipos.\n\n" +
        "Puedes buscar Pokémon por nombre, filtrar por generación y tipo, y ver detalles de cada Pokémon al hacer clic en su tarjeta.");
}


// Codigo para obtener los datos de cada pokemon mediante la API de de PokeApi
// Este bloque de código es solo un ejemplo inicial para probar la API,
// la lógica principal de carga de datos está más abajo.

fetch('https://pokeapi.co/api/v2/pokemon?limit=1025')
    .then(response => response.json())
    .then(data => {

        // 1. Cargar TODOS los Pokémon en una sola petición paralela

        return Promise.all(
            data.results.map(pokemon =>
                fetch(pokemon.url).then(res => res.json())
            )
        );
    })
    .then(allPokemonData => {

        // 2. Procesar datos y guardar en el array global

        todosLosPokemones = allPokemonData.map(info => ({
            name: info.name,
            id: info.id,
            img: info.sprites.other['official-artwork'].front_default, // Artwork Oficial
            types: info.types.map(t => t.type.name),
            height: info.height,
            weight: info.weight,
            abilities: info.abilities.map(a => a.ability.name),
            stats: info.stats.map(s => ({ name: s.stat.name, value: s.base_stat })),
            cry: `https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/latest/${info.id}.ogg`,
            speciesUrl: info.species.url,
            evolutionChainUrl: info.species.evolution_chain.url

        }));

        // 3. Extraer tipos únicos para el filtro

        allPokemonData.forEach(info => {
            info.types.forEach(t => tiposSet.add(t.type.name));
        });

        // 4. Rellenar filtro de tipos y renderizar

        [...tiposSet].sort().forEach(tipo => {
            const option = document.createElement('option');
            option.value = tipo;
            option.textContent = tipoTraducido[tipo] || tipo.charAt(0).toUpperCase() + tipo.slice(1);
            tipoSelect.appendChild(option);
        });
        renderPokemones(); // Renderizado inicial
    })


// --- Variables Globales y Referencias al DOM --- //

let todosLosPokemones = []; // Array que almacenará todos los datos de los Pokémon cargados.
const tiposSet = new Set(); // Conjunto para almacenar los tipos de Pokémon únicos y evitar duplicados.
const contenedoresDiv = document.getElementById('contenedores'); // Referencia al div donde se mostrarán las tarjetas de Pokémon.
const busquedaInput = document.getElementById('busqueda'); // Referencia al input de búsqueda por nombre/ID.
const generacionSelect = document.getElementById('generacion'); // Referencia al select de filtro por generación.
const tipoSelect = document.getElementById('tipo'); // Referencia al select de filtro por tipo.
const pokemonModal = document.getElementById('pokemon-modal'); // Referencia al elemento del modal (la ventana emergente).
const closeModalButton = document.querySelector('.close-button'); // Referencia al botón de cerrar el modal.
const modalPokemonDetails = document.getElementById('modal-pokemon-details'); // Referencia al div dentro del modal donde se cargarán los detalles del Pokémon.
const paginationControls = document.getElementById('pagination-controls'); // Referencia al contenedor de controles de paginación.
let itemsAMostrar = 50; // Cantidad de Pokémon que se mostrarán inicialmente y con cada "Cargar más".

// Objeto para traducir los nombres de los tipos de Pokémon de inglés a español.

const tipoTraducido = {
    normal: "Normal",
    fire: "Fuego",
    water: "Agua",
    electric: "Eléctrico",
    grass: "Planta",
    ice: "Hielo",
    fighting: "Lucha",
    poison: "Veneno",
    ground: "Tierra",
    flying: "Volador",
    psychic: "Psíquico",
    bug: "Bicho",
    rock: "Roca",
    ghost: "Fantasma",
    dragon: "Dragón",
    dark: "Siniestro",
    steel: "Acero",
    fairy: "Hada"
};

// Objeto que mapea los tipos de Pokémon a sus respectivos colores (útil si los colores se manejan también en JS).
// Aunque en el CSS ya se definen con variables, esto podría ser un fallback o para manipulación directa en JS.
const typeColores = {
    normal: "#A8A878", fire: "#F08030", water: "#6890F0", electric: "#F8D030",
    grass: "#78C850", ice: "#98D8D8", fighting: "#C03028", poison: "#A040A0",
    ground: "#E0C068", flying: "#A890F0", psychic: "#F85888", bug: "#A8B820",
    rock: "#B8A038", ghost: "#705898", dragon: "#7038F8", dark: "#705848",
    steel: "#B8B8D0", fairy: "#EE99AC"
};

// --- Carga Inicial de Datos de Pokémon ---
// Este bloque realiza la solicitud a la PokeAPI para obtener una lista de todos los Pokémon
// y luego, en bloques, busca los detalles de cada uno.

fetch('https://pokeapi.co/api/v2/pokemon?limit=1025') // Aumentado el límite para obtener más Pokémon (hasta la Gen 9).
    .then(response => response.json()) // Convierte la respuesta a JSON.
    .then(data => {
        const chunkSize = 50; // Define el tamaño de los bloques para procesar los Pokémon.
        const chunks = []; // Array para almacenar los bloques de Pokémon.
        // Divide la lista total de Pokémon en bloques más pequeños para procesarlos por partes.
        for (let i = 0; i < data.results.length; i += chunkSize) {
            chunks.push(data.results.slice(i, i + chunkSize));
        }

        // Función recursiva para procesar cada bloque de Pokémon.
        function processChunk(index) {
            // Si ya se procesaron todos los bloques, se rellena el filtro de tipos y se renderizan los Pokémon.
            if (index >= chunks.length) {
                // Rellena el select de "tipo" con los tipos únicos encontrados, ordenados alfabéticamente.
                [...tiposSet].sort().forEach(tipo => {
                    const option = document.createElement('option');
                    option.value = tipo;
                    // Asigna el texto traducido o el nombre del tipo capitalizado.
                    option.textContent = tipoTraducido[tipo] || tipo.charAt(0).toUpperCase() + tipo.slice(1);
                    tipoSelect.appendChild(option);
                });
                renderPokemones(); // Realiza el renderizado inicial de los Pokémon en la página.
                return; // Termina la ejecución de la función.
            }

            // Para el bloque actual, se realizan todas las solicitudes de detalles de Pokémon en paralelo.
            Promise.all(
                chunks[index].map(pokemon =>
                    fetch(pokemon.url) // Obtiene los detalles de cada Pokémon.
                        .then(res => res.json()) // Convierte la respuesta a JSON.
                        .then(info => {
                            // Selecciona el sprite (imagen) a mostrar: Artwork Oficial por defecto, fallback al sprite frontal estándar.
                            const spriteImg = info.sprites.other['official-artwork'].front_default || info.sprites.front_default;
                            // Construye la URL para el "grito" del Pokémon.
                            const crySound = `https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/latest/${info.id}.ogg`;

                            // Obtiene datos adicionales de la especie del Pokémon para la descripción y la cadena de evolución.
                            return fetch(info.species.url)
                                .then(res => res.json())
                                .then(speciesInfo => {
                                    // Busca la descripción en español.
                                    const descriptionEntry = speciesInfo.flavor_text_entries.find(entry => entry.language.name === 'es');
                                    // Limpia la descripción de caracteres de salto de línea.
                                    const description = descriptionEntry ? descriptionEntry.flavor_text.replace(/[\n\f]/g, ' ') : 'No hay descripción disponible en español.';

                                    // Retorna un objeto con todos los datos relevantes del Pokémon.
                                    return {
                                        name: info.name,
                                        id: info.id,
                                        img: spriteImg,
                                        types: info.types.map(t => t.type.name), // Extrae solo los nombres de los tipos.
                                        height: info.height,
                                        weight: info.weight,
                                        abilities: info.abilities.map(a => a.ability.name), // Extrae solo los nombres de las habilidades.
                                        stats: info.stats.map(s => ({ name: s.stat.name, value: s.base_stat })), // Extrae nombre y valor de las estadísticas.
                                        cry: crySound,
                                        description: description,
                                        speciesUrl: info.species.url, // Almacena la URL de la especie para uso posterior.
                                        evolutionChainUrl: speciesInfo.evolution_chain.url // Almacena la URL de la cadena de evolución.
                                    };
                                });
                        })
                )
            ).then(pokemones => {
                // Añade los Pokémon procesados al array global y sus tipos al conjunto.
                pokemones.forEach(info => {
                    todosLosPokemones.push(info);
                    info.types.forEach(t => tiposSet.add(t));
                });
                processChunk(index + 1); // Llama a la función recursivamente para procesar el siguiente bloque.
            });
        }
        processChunk(0); // Inicia el procesamiento del primer bloque.
    })
    .catch(error => {
        // Manejo de errores en caso de que la carga inicial falle (falta de internet o API caída).
        console.error('Error al cargar los pokemones:', error);

        // Limpiamos todo el contenido y mostramos solo el mensaje de error centrado.
        const filtros = document.getElementById('filtros');
        if (filtros) filtros.style.display = 'none'; // Ocultamos los filtros si falló todo.

        contenedoresDiv.innerHTML = `
            <div class="error-conexion">
                <h1>No tienes conexión a internet o la API no responde.</h1>
                <p>Por favor, revisa tu conexión y recarga la página.</p>
                <button onclick="location.reload()" class="play-cry-button">Recargar Página</button>
            </div>
        `;
    });

// --- Funciones de Renderizado y Filtrado ---

// Función para renderizar las tarjetas de Pokémon en el DOM, aplicando los filtros y limitando la cantidad inicial.
function renderPokemones(resetCount = true) {
    if (resetCount) itemsAMostrar = 50; // Al cambiar filtros, vuelve al inicio.

    const gen = generacionSelect.value;
    const tipo = tipoSelect.value;
    const busqueda = busquedaInput.value.trim().toLowerCase();

    // Filtramos primero toda la lista para saber cuántos hay en total que coinciden.
    const pokemonFiltrados = todosLosPokemones.filter(info => {
        if (busqueda && !(info.name.toLowerCase().includes(busqueda) || String(info.id) === busqueda)) return false;

        if (gen !== 'all') {
            const id = info.id;
            const genRanges = {
                '1': [1, 151], '2': [152, 251], '3': [252, 386],
                '4': [387, 493], '5': [494, 649], '6': [650, 721],
                '7': [722, 809], '8': [810, 905], '9': [906, 1025]
            };
            if (genRanges[gen] && !(id >= genRanges[gen][0] && id <= genRanges[gen][1])) return false;
        }

        if (tipo !== 'all' && !info.types.includes(tipo)) return false;

        return true;
    });

    // Limpiamos y renderizamos solo el fragmento actual.
    contenedoresDiv.innerHTML = '';
    const itemsActuales = pokemonFiltrados.slice(0, itemsAMostrar);

    itemsActuales.forEach(info => {
        const div = document.createElement('div');
        div.className = 'contenedor';
        div.setAttribute('data-pokemon-id', info.id);

        div.innerHTML = `
            <span class="pokemon-id">#${info.id.toString().padStart(3, '0')}</span>
            <h2>${info.name.charAt(0).toUpperCase() + info.name.slice(1)}</h2>
            <img src="${info.img}" alt="${info.name}" class="pokemon-sprite" loading="lazy">
            <div class="pokemon-types">
                ${info.types.map(t => `<span class="tipo-pokemon" data-type="${t}">${tipoTraducido[t] || t}</span>`).join('')}
            </div>
        `;
        contenedoresDiv.appendChild(div);
    });

    renderPaginationControls(pokemonFiltrados.length);
    applyTypeColors();
}

// Función para manejar los controles de carga (botón Cargar más)
function renderPaginationControls(totalFiltrados) {
    paginationControls.innerHTML = '';

    if (itemsAMostrar < totalFiltrados) {
        const btnCargarMas = document.createElement('button');
        btnCargarMas.textContent = 'Cargar más Pokémon';
        btnCargarMas.onclick = () => {
            itemsAMostrar += 50;
            renderPokemones(false); // Mantener el scroll y solo añadir más items
        };
        paginationControls.appendChild(btnCargarMas);
    }
}

// --- Event Listeners para Filtros ---

// Asigna la función renderPokemones para que se ejecute cada vez que cambie el filtro de generación.
generacionSelect.addEventListener('change', renderPokemones);
// Asigna la función renderPokemones para que se ejecute cada vez que cambie el filtro de tipo.
tipoSelect.addEventListener('change', renderPokemones);
// Asigna la función renderPokemones para que se ejecute cada vez que el usuario escriba en el input de búsqueda.
busquedaInput.addEventListener('input', renderPokemones);

// --- Funcionalidad del Modal (Ventana Emergente de Detalles) ---

// Escucha clics en el contenedor principal de Pokémon para detectar si se hizo clic en una tarjeta.
contenedoresDiv.addEventListener('click', function (event) {
    // Busca el elemento más cercano con la clase 'contenedor' (la tarjeta de Pokémon).
    const card = event.target.closest('.contenedor');
    if (card) { // Si se encontró una tarjeta:
        const pokemonId = parseInt(card.getAttribute('data-pokemon-id')); // Obtiene el ID del Pokémon de la tarjeta.
        const pokemon = todosLosPokemones.find(p => p.id === pokemonId); // Busca el objeto Pokémon completo en el array global.
        if (pokemon) { // Si se encontró el Pokémon:
            displayPokemonDetails(pokemon); // Llama a la función para mostrar sus detalles en el modal.
        }
    }
});

// Event Listener para cerrar el Modal cuando se hace clic en el botón de cierre.
closeModalButton.addEventListener('click', () => {
    pokemonModal.style.display = 'none'; // Oculta el modal.
    document.body.classList.remove('modal-open'); // al cerrar el modal
});

// Event Listener para cerrar el Modal cuando se hace clic fuera del contenido del modal.
window.addEventListener('click', (event) => {
    if (event.target == pokemonModal) { // Si el clic fue directamente en el fondo del modal.
        pokemonModal.style.display = 'none'; // Oculta el modal.
        document.body.classList.remove('modal-open'); // al cerrar el modal
    }
});

// Función asíncrona para obtener y mostrar los detalles de un Pokémon en el modal.
async function displayPokemonDetails(pokemon) {
    const modalContent = document.querySelector('.modal-content');
    const closeButton = document.querySelector('.close-button');

    // Muestra un estado de carga inicial en el modal.
    modalContent.classList.add('loading'); // Añadir clase de carga.
    if (closeButton) closeButton.style.display = 'none'; // Ocultar botón de cierre.

    modalPokemonDetails.innerHTML = `
        <div class="modal-loading-content">
            <div class="loading-header">
                <img src="https://upload.wikimedia.org/wikipedia/commons/5/53/Pok%C3%A9_Ball_icon.svg" alt="Loading" class="loading-pokeball">
                <h2>Cargando...</h2>
            </div>
        </div>
    `;
    pokemonModal.style.display = 'flex'; // Cambiado a flex para permitir centrado.
    document.body.classList.add('modal-open'); // al abrir el modal

    let evolutionHtml = '<p>No hay información de evolución disponible.</p>';
    let locationsHtml = '<p>No hay información de ubicación disponible.</p>';

    try {
        // Intenta obtener la cadena de evolución del Pokémon.
        const evolutionChainResponse = await fetch(pokemon.evolutionChainUrl);
        const evolutionChainData = await evolutionChainResponse.json();
        evolutionHtml = getEvolutionChainHtml(evolutionChainData.chain, pokemon.id); // Genera el HTML de la cadena.

        // Intenta obtener las ubicaciones donde se encuentra el Pokémon.
        const locationResponse = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemon.id}/encounters`);
        const locationData = await locationResponse.json();
        locationsHtml = getLocationsHtml(locationData); // Genera el HTML de las ubicaciones.

    } catch (error) {
        // Maneja los errores si no se pueden obtener los datos adicionales.
        console.error('Error al obtener datos adicionales del Pokémon:', error);
        // Los mensajes predeterminados se mantendrán.
    }

    // Rellena el modal con los detalles completos del Pokémon.
    modalContent.classList.remove('loading'); // Quitar clase de carga.
    if (closeButton) closeButton.style.display = 'block'; // Mostrar botón de cierre.

    modalPokemonDetails.innerHTML = `
        <div class="modal-header">
            <div class="navigation-buttons">
                <button id="prev-pokemon" class="nav-button">&lt;</button>
                <button id="next-pokemon" class="nav-button">&gt;</button>
            </div>
            <h1>${pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}</h1>
            <img src="${pokemon.img}" alt="${pokemon.name}" class="modal-sprite">
            <span class="pokemon-id-modal">#${pokemon.id.toString().padStart(3, '0')}</span>
            <button id="play-cry-button" class="play-cry-button">Reproducir grito</button>
        </div>
        <div class="pokemon-info-modal">
            <h3>Tipos:</h3>
            <div class="pokemon-tipos">
                ${pokemon.types.map(t => `<span class="tipo-pokemon" data-type="${t}">${tipoTraducido[t] || t}</span>`).join('')}
            </div>
            <h3>Descripción:</h3>
            <p>${pokemon.description || 'No hay descripción disponible para este Pokémon.'}</p>
            <h3>Datos:</h3>
            <p><strong>Altura:</strong> ${pokemon.height / 10} m</p>
            <p><strong>Peso:</strong> ${pokemon.weight / 10} kg</p>
            <h3>Habilidades:</h3>
            <ul>
                ${pokemon.abilities.map(a => `<li>${a.replace(/-/g, ' ').charAt(0).toUpperCase() + a.replace(/-/g, ' ').slice(1)}</li>`).join('')}
            </ul>
            <h3>Estadísticas Base:</h3>
            ${pokemon.stats.map(stat => `
                <p>${stat.name.replace(/-/g, ' ').charAt(0).toUpperCase() + stat.name.replace(/-/g, ' ').slice(1)}: ${stat.value}</p>
                <div class="stat-bar">
                    <div class="stat-bar-fill" style="width: ${Math.min(stat.value / 255 * 100, 100)}%;"></div>
                </div>
            `).join('')}
            <h3>Evoluciones:</h3>
            <div class="evolution-details">
                ${evolutionHtml}
            </div>
            <h3>Ubicaciones:</h3>
            <div class="location-details">
                ${locationsHtml}
            </div>
        </div>
    `;
    pokemonModal.style.display = 'flex'; // Asegurado que se muestre como flex.

    // Aplica los colores de tipo a los elementos de tipo dentro del modal.
    modalPokemonDetails.querySelectorAll('.tipo-pokemon').forEach(element => {
        const type = element.getAttribute('data-type');
        if (type && typeColores[type]) {
            element.style.backgroundColor = typeColores[type];
            // Ajusta el color del texto para un mejor contraste en tipos claros.
            if (['electric', 'ice', 'ground', 'steel'].includes(type)) {
                element.style.color = 'var(--pokemon-dark)';
                element.style.textShadow = 'none';
            } else {
                element.style.color = 'white';
                element.style.textShadow = '1px 1px 1px rgba(0,0,0,0.5)';
            }
        }
    });

    // Configura el botón para reproducir el "grito" del Pokémon.
    const playCryButton = document.getElementById('play-cry-button');
    playCryButton.onclick = () => {
        const audio = new Audio(pokemon.cry);
        audio.play().catch(e => console.error("Error al reproducir audio:", e)); // Manejo de errores de reproducción.
    };

    // Configurar botones de navegación modal
    const currentIndex = todosLosPokemones.findIndex(p => p.id === pokemon.id);
    const prevBtn = document.getElementById('prev-pokemon');
    const nextBtn = document.getElementById('next-pokemon');

    if (currentIndex > 0) {
        prevBtn.onclick = () => displayPokemonDetails(todosLosPokemones[currentIndex - 1]);
    } else {
        prevBtn.style.visibility = 'hidden';
    }

    if (currentIndex < todosLosPokemones.length - 1) {
        nextBtn.onclick = () => displayPokemonDetails(todosLosPokemones[currentIndex + 1]);
    } else {
        nextBtn.style.visibility = 'hidden';
    }
}

// --- Funciones Auxiliares para Generación de HTML ---

// Función auxiliar para construir el HTML de la cadena de evolución.
function getEvolutionChainHtml(chain, currentPokemonId) {
    let evolutionHtml = '<div class="evolution-chain">';
    let currentEvolution = chain;

    function processEvolutionNode(node) {
        const speciesName = node.species.name;
        const speciesId = node.species.url.split('/').slice(-2, -1)[0];
        const isCurrentPokemon = parseInt(speciesId) === currentPokemonId;

        // Usar modelo 3D en lugar del sprite 2D
        evolutionHtml += `
            <div class="evolution-stage ${isCurrentPokemon ? 'current-pokemon' : ''}">
                <p><strong>${speciesName.charAt(0).toUpperCase() + speciesName.slice(1)}</strong></p>
                <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${speciesId}.png" alt="${speciesName}" style="width:150px; height:150px;">
            </div>
        `;

        if (node.evolves_to.length > 0) {
            node.evolves_to.forEach(nextEvolution => {
                const evolutionTrigger = nextEvolution.evolution_details.length > 0 ?
                    nextEvolution.evolution_details[0].trigger.name.replace(/-/g, ' ') : '';
                const evolutionMethod = nextEvolution.evolution_details.length > 0 ?
                    getEvolutionMethod(nextEvolution.evolution_details[0]) : '';

                evolutionHtml += `
                    <div class="evolution-arrow">
                        <p>${evolutionTrigger.charAt(0).toUpperCase() + evolutionTrigger.slice(1)}: ${evolutionMethod}</p>
                        <span>&#8594;</span> 
                    </div>
                `;
                processEvolutionNode(nextEvolution);
            });
        }
    }

    processEvolutionNode(currentEvolution);
    evolutionHtml += '</div>';
    return evolutionHtml;
}
// Función auxiliar para obtener el método de evolución detallado en texto.
function getEvolutionMethod(details) {
    let method = '';
    if (details.min_level) method += `Nivel ${details.min_level} `; // Por nivel.
    if (details.item) method += `con ${details.item.name.replace(/-/g, ' ')} `; // Con un objeto.
    if (details.trigger.name === 'trade') method += 'por intercambio '; // Por intercambio.
    if (details.known_move) method += `con el movimiento ${details.known_move.name.replace(/-/g, ' ')} `; // Con un movimiento conocido.
    if (details.min_happiness) method += `con ${details.min_happiness}+ de felicidad `; // Por felicidad.
    if (details.min_beauty) method += `con ${details.min_beauty}+ de belleza `; // Por belleza (Pokémon Contests).
    // Por hora del día (día/noche).
    if (details.time_of_day && details.time_of_day !== '') method += `durante el ${details.time_of_day === 'day' ? 'día' : 'noche'} `;
    if (details.party_species) method += `con ${details.party_species.name.replace(/-/g, ' ')} en el equipo `; // Con una especie específica en el equipo.
    if (details.party_type) method += `con un tipo ${details.party_type.name} en el equipo `; // Con un tipo específico en el equipo.
    // Relación ataque/defensa.
    if (details.relative_physical_stats) {
        if (details.relative_physical_stats === 1) method += 'si su ataque es mayor que su defensa ';
        else if (details.relative_physical_stats === -1) method += 'si su defensa es mayor que su ataque ';
        else method += 'si su ataque y defensa son iguales ';
    }
    if (details.needs_overworld_rain) method += 'si llueve en el juego '; // Si está lloviendo.
    if (details.gender) method += `(${details.gender === 1 ? 'hembra' : 'macho'}) `; // Por género.
    if (details.held_item) method += `con ${details.held_item.name.replace(/-/g, ' ')} `; // Con un objeto equipado.
    if (details.location) method += `en ${details.location.name.replace(/-/g, ' ')} `; // En una ubicación específica.
    if (details.turn_upside_down) method += 'volteando la consola '; // Girando la consola (ej. Inkay).
    if (details.min_affection) method += `con ${details.min_affection}+ de afecto `; // Por afecto.
    if (details.max_health_stat) method += 'con HP al máximo '; // Ejemplos, verificar API para nombres específicos.
    if (details.min_level_up) method += `al subir de nivel con ${details.min_level_up} `; // Ejemplos, verificar API para nombres específicos.

    return method.trim() || 'Método desconocido'; // Retorna el método o "Método desconocido".
}

// Función auxiliar para construir el HTML de las ubicaciones del Pokémon.
function getLocationsHtml(locationsData) {
    if (locationsData.length === 0) {
        return '<p>Ubicación no disponible o no encontrada en la API.</p>'; // Si no hay datos, muestra un mensaje.
    }

    const uniqueLocations = new Map(); // Mapa para agrupar ubicaciones por nombre y versiones.
    locationsData.forEach(encounter => {
        const locationName = encounter.location_area.name.replace(/-/g, ' '); // Nombre de la ubicación, limpia guiones.
        // Obtiene los nombres de las versiones únicos para esta ubicación.
        const versions = encounter.version_details.map(v => v.version.name.replace(/-/g, ' '));

        if (!uniqueLocations.has(locationName)) {
            uniqueLocations.set(locationName, new Set()); // Si la ubicación no existe, crea un nuevo conjunto para las versiones.
        }
        versions.forEach(v => uniqueLocations.get(locationName).add(v)); // Añade las versiones al conjunto de la ubicación.
    });

    if (uniqueLocations.size === 0) {
        return '<p>Ubicación no disponible o no encontrada en la API.</p>'; // Si no se encontraron ubicaciones únicas, muestra un mensaje.
    }

    let html = '<ul>'; // Inicia una lista no ordenada.
    uniqueLocations.forEach((versionsSet, locName) => {
        // Formatea los nombres de las versiones.
        const formattedVersions = [...versionsSet].map(v => v.charAt(0).toUpperCase() + v.slice(1)).join(', ');
        // Añade un elemento de lista con la ubicación y sus versiones.
        html += `<li>${locName.charAt(0).toUpperCase() + locName.slice(1)} (Versiones: ${formattedVersions})</li>`;
    });
    html += '</ul>'; // Cierra la lista no ordenada.
    return html; // Retorna el HTML generado.
}

// --- Aplicación de Estilos Dinámicos ---

// Función para aplicar los colores de fondo y texto a las etiquetas de tipo de Pokémon.
function applyTypeColors() {
    document.querySelectorAll('.tipo-pokemon').forEach(element => {
        const tipo = element.getAttribute('data-type'); // Obtiene el tipo del atributo 'data-type'.
        if (tipo && typeColores[tipo]) { // Si el tipo existe y tiene un color definido:
            element.style.backgroundColor = typeColores[tipo]; // Aplica el color de fondo.
            // Ajusta el color del texto y la sombra para mejorar el contraste en tipos con colores claros.
            if (['electric', 'ice', 'ground', 'steel'].includes(tipo)) {
                element.style.color = 'var(--pokemon-dark)'; // Color de texto oscuro.
                element.style.textShadow = 'none'; // Sin sombra de texto.
            } else {
                element.style.color = 'white'; // Color de texto blanco.
                element.style.textShadow = '1px 1px 1px rgba(0,0,0,0.5)'; // Sombra de texto.
            }
        }
    });
}

// --- Observador de Cambios en el DOM ---

// Ejecuta la función cuando el DOM esté completamente cargado.
document.addEventListener('DOMContentLoaded', function () {
    // Crea un MutationObserver para observar cambios en el div 'contenedores'.
    const observer = new MutationObserver(applyTypeColors);
    // Configura el observador para reaccionar a la adición o eliminación de nodos hijos
    // y cambios en los subárboles (útil si los tipos se añaden dinámicamente).
    observer.observe(contenedoresDiv, {
        childList: true,
        subtree: true
    });
});