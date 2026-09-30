# Aetheria - 3D Particle Vision Synthesizer

Sistema interactivo 3D de partículas en tiempo real desarrollado con **Three.js** y shaders personalizados **GLSL**, controlado mediante visión artificial y gestos manuales a través de la cámara web con **MediaPipe Tasks-Vision**.

---

## 🌟 Características Principales

1. **Visión Artificial y Detección de Gestos (MediaPipe)**:
   - **Palma Abierta (Open Palm)**: Extensión completa de los 5 dedos para generar una onda expansiva de dispersión y regenerar el flujo dinámico.
   - **Signo de la Paz ("V")**: Conmutación fluida hacia la siguiente plantilla 3D mediante morphing en GPU.
   - **Tensión / Separación de Manos**: Cálculo de la distancia relativa entre muñecas (o span digital con una sola mano) que modula la escala cósmica, expansión y turbulencia procedimental.
   - **Puño Cerrado**: Condensación gravitacional de partículas hacia el núcleo.
   - **Pipeline Desacoplado**: La visión se ejecuta a ~30 FPS para garantizar que el renderizado WebGL se mantenga a 60 FPS estables.

2. **Arquitectura de Partículas y Shaders GLSL (GPU)**:
   - Dibujo en una única llamada (*single draw call*) con `THREE.Points` y `THREE.BufferGeometry`.
   - **Vertex Shader**: Interpolación GPU con función `mix()`, ruido procedural Simplex 3D para fluidos y atenuación de tamaño por distancia de cámara.
   - **Fragment Shader**: Perfil de intensidad radial suave (`gl_PointCoord`) con núcleo luminiscente y halo etéreo.

3. **6 Plantillas Tridimensionales Paramétricas**:
   - **Saturno con Anillos** (esfera y discos concéntricos con la división de Cassini).
   - **Corazón 3D** (cardioide volumétrico con gradientes de color).
   - **Espiral / Flor de Loto** (filotaxis de Fermat con curvatura de pétalos 3D).
   - **Estatua de Buda** (figura en postura de meditación con trono y halo aureola).
   - **Fuegos Artificiales** (estallido radial concéntrico con estelas y caída gravitacional).
   - **Galaxia Espiral** (disco logarítmico con núcleo estelar).

4. **Panel de Control y Respaldo Manual**:
   - Selector interactivo de plantillas y paletas cromáticas (Cyber Violet, Solar Flare, Mystic Emerald, etc.).
   - Selector de cámara de entrada (`navigator.mediaDevices.enumerateDevices`).
   - Control con ratón / táctil (arrastrar para rotar en 3D, rueda para zoom, doble clic para dispersión) y atajos de teclado (`Espacio`, `D`, `C`).

---

## 🚀 Cómo Publicar este Sitio Web en GitHub (GitHub Pages)

Para que tu proyecto esté **ejecutable en una página web en vivo en GitHub** de forma totalmente gratuita y automática, sigue estos sencillos pasos:

### Paso 1: Crear un nuevo repositorio en GitHub
1. Entra a [github.com/new](https://github.com/new).
2. Nombra tu repositorio (por ejemplo: `aetheria-3d-particles`).
3. Déjalo como **Público** y no selecciones inicializar con README (ya tenemos todo listo).
4. Haz clic en **Create repository**.

### Paso 2: Subir el código a GitHub desde tu terminal
En la carpeta del proyecto, ejecuta los siguientes comandos:

```bash
# Inicializar git si aún no está inicializado
git init

# Agregar todos los archivos
git add .

# Crear el primer commit
git commit -m "feat: Aetheria 3D Particle Vision Synthesizer"

# Renombrar rama a main
git branch -M main

# Vincular con tu repositorio de GitHub (reemplaza con tu URL)
git remote add origin https://github.com/TU_USUARIO/TU_REPOSITORIO.git

# Subir los archivos
git push -u origin main
```

### Paso 3: Activar GitHub Pages en 1 clic
1. En tu repositorio de GitHub, ve a la pestaña **Settings** (Configuración).
2. En el menú lateral izquierdo, haz clic en **Pages**.
3. En la sección **Build and deployment**:
   - En **Source**, selecciona: **GitHub Actions**.
4. ¡Listo! El archivo `.github/workflows/deploy.yml` ya incluido en este repositorio compilará automáticamente el proyecto y creará tu sitio web ejecutable.
5. En 1 o 2 minutos, tu sitio web estará disponible en:
   `https://TU_USUARIO.github.io/TU_REPOSITORIO/`

---

## 💻 Ejecución en Entorno Local

Si deseas probar o modificar el proyecto en tu computadora:

```bash
# 1. Instalar dependencias
npm install

# 2. Iniciar el servidor de desarrollo
npm run dev

# 3. Compilar para producción
npm run build

# 4. Probar la compilación en local
npm run preview
```

---

## ⌨️ Atajos de Teclado y Controles

| Tecla / Acción | Función |
| :--- | :--- |
| **Barra Espaciadora** | Conmutar a la siguiente plantilla 3D (Morphing GPU) |
| **Tecla D** | Disparar onda expansiva de dispersión (Regenerar dinámica) |
| **Tecla C** | Activar / Desactivar visión por cámara web |
| **Arrastrar Ratón / Touch** | Rotar libremente el modelo 3D en el espacio |
| **Rueda de Ratón / Pellizco** | Zoom dentro / fuera |
| **Doble Clic** | Disparar onda expansiva manual |
