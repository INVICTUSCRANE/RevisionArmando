# Industrias Invictus Crane · Panel del administrador

Panel con todas las funciones del sistema (HTML + JavaScript + Tailwind CSS). Usa el mismo tema que el
portal de acceso (`invictus-portal`): colores, fuentes, neón y el interruptor de modo claro / oscuro.
Se abre directo con doble clic en `index.html`; no necesita servidor.

## Cómo trabajar

```bash
npm install      # una sola vez
npm run dev      # recompila CSS y JS cada vez que guardas
npm run build    # versión final minificada en /dist
```

Edita siempre los archivos de `src/`. La carpeta `dist/` se genera sola: no la edites a mano.

## Qué incluye

| Sección del menú                  | Pantalla                  | Qué se puede hacer |
|-----------------------------------|---------------------------|--------------------|
| Mis datos (pantalla de inicio)    | Mis datos                 | Datos de la persona que inició sesión: nombre, apellidos, correo, teléfono, departamento, rol, estado de la cuenta y hora de inicio de sesión. Debajo, una escena animada de grúas en carretera (CSS + SVG; al tocar la grúa suena el claxon). El logotipo de Invictus y la tarjeta de la persona llevan aquí. |
| Configurar datos de la empresa    | Información de la empresa | Editar misión, visión y WhatsApp (con aviso de "cambios sin guardar"); agregar, editar, buscar y eliminar valores. |
|                                   | Carrusel                  | Hasta 10 elementos; cada uno promociona una grúa **o** un accesorio, con orden, título, subtítulo e imagen. Al elegir un lugar, los demás se recorren solos. |
|                                   | Línea del tiempo          | Un acontecimiento por año (4 dígitos, sin repetir) con descripción e imagen. |
| Configurar catálogo de accesorios | Categorías de accesorios  | Alta, edición y baja. Las que tienen accesorios vinculados no se pueden eliminar. |
|                                   | Categorías de atributos   | Igual, y se ven los atributos ligados a cada una. |
|                                   | Atributos                 | Alta, edición y baja, con filtro por categoría. |
|                                   | Accesorios                | Nombre, categoría, precio (MXN), descripción y atributos (selector con búsqueda). |
| Configurar catálogo de grúas      | Categorías de grúas       | Alta, edición y baja (Plataformas, Rescate…). Las que tienen grúas vinculadas no se pueden eliminar. |
|                                   | Atributos opcionales      | Extras que el cliente puede elegir (nombre e imagen). Al eliminar uno se quita de las grúas que lo tenían. |
|                                   | Atributos de grúas        | Componentes que forman una grúa, como winches o plataformas (nombre e imagen). |
|                                   | Grúas                     | Nombre, categoría, imagen, atributos con cantidad (renglones con "2 × Winche") y atributos opcionales. Un atributo no se repite en dos renglones. Búsqueda y filtro por categoría. No se elimina si está en el carrusel. |
| Cotizaciones y reparaciones       | Solicitudes de cotizaciones | Solo consultar y eliminar. Usuario (o "Anónimo"), correo, registrado / no registrado, fecha y grúa con su foto. Búsqueda y filtro por registro. |
|                                   | Solicitudes de reparaciones | Igual, con nombre y apellidos por separado y el botón **Ver mensaje**, que abre el mensaje del cliente. |
| Administrar usuarios              | Usuarios administradores  | Alta, edición y baja del personal: nombre, apellidos, correo (también es su usuario), teléfono, departamento, rol, contraseña y cuenta activa. Interruptor para activar o desactivar desde la tabla. No deja quitar al último administrador activo. |
|                                   | Clientes                  | Lo mismo sin departamento ni rol. Si se elimina un cliente, sus solicitudes se conservan como "No registrado". |
| Respaldar base de datos           | Historial de respaldos    | Generar un respaldo (con confirmación) y restaurar uno anterior eligiendo su fecha (con confirmación reforzada: hay que escribir RESTAURAR). Mientras corre, se ve el avance y la pantalla consulta su estado cada segundo. Historial con fecha de inicio y fin, operación, origen, usuario y estado. |
| Bitácoras y auditorías            | Accesos al panel          | Solo lectura. Inicios y cierres de sesión del personal (no clientes): fecha, correo, nombre, apellidos, evento (Login exitoso, Logout, Cuenta bloqueada, Login fallido) y rol. Búsqueda y filtros por evento y por rol. |
|                                   | Recuperación de cuentas   | Solo lectura. Usuario (correo), nombre, apellidos, estado (Exitoso / Fallido), fecha y medio (Teléfono / Correo). Búsqueda y filtros por estado y por medio. |
|                                   | Cambios de usuarios       | Solo lectura. Quién hizo el cambio, su rol, a quién (administrador o cliente), la acción (CREAR, ACTUALIZAR, ELIMINAR, ACTIVAR, DESACTIVAR) y **Ver cambios**, que despliega los datos anteriores y los nuevos: lo que cambió se tacha en rojo a la izquierda y se resalta en verde a la derecha. La contraseña nunca se guarda: solo se anota que se cambió. Búsqueda y filtros por acción y por tipo de cuenta. En la demostración, lo que hagas en Administrar usuarios se registra aquí al momento. |
|                                   | Cambios en la empresa     | Solo lectura. Auditoría de Configurar datos de la empresa: misión, visión y WhatsApp (una sola fila: solo ACTUALIZAR, y la tabla dice qué campo cambió) y valores, carrusel y línea del tiempo (tablas propias: CREAR, ACTUALIZAR, ELIMINAR). Misma tabla y **Ver cambios** que «Cambios de usuarios»; las imágenes se comparan en miniatura y los textos largos van completos. Filtros por elemento (Misión, Visión, Teléfono, Valores, Carrusel, Línea del tiempo) y por acción. |
|                                   | Cambios en accesorios     | Solo lectura. Accesorios y todo lo que hace falta para crearlos: categorías de accesorios, atributos y categorías de atributos. En **Ver cambios** los atributos de un accesorio son etiquetas: las que se quitaron se tachan y las que se agregaron se resaltan. Si al eliminar un atributo se quitó de accesorios, se anota de cuáles. |
|                                   | Cambios en grúas          | Solo lectura. Grúas (nombre, categoría, imagen, atributos con cantidad —los detalles— y opcionales), categorías, atributos y atributos opcionales. Se ve, por ejemplo, «1 × Winche» tachado y «2 × Winche» resaltado. Si al eliminar un atributo u opcional se quitó de grúas, se anota de cuáles. |
|                                   | Solicitudes eliminadas    | Solo lectura. Las cotizaciones y reparaciones no se crean ni se editan en el panel, así que solo se registra quién eliminó cada una y cuándo, con los datos que la identifican (folio, solicitante, fecha de envío y, en cotizaciones, la grúa); no se guarda el mensaje del cliente. Filtros por tipo y por rol. |

- En la edición de imágenes, si no eliges otra se conserva la actual (igual que en `ControlAcontecimiento`).
- **Guardar** se habilita solo cuando el formulario está completo (y, al editar, cuando hay un cambio).
- Las bitácoras muestran 20 registros y un botón **Mostrar más**; la búsqueda espera a que dejes de escribir.
- Las siete bitácoras usan la misma pantalla (`views/audit-log.js`); cada una solo describe sus columnas, filtros
  y qué campos muestra **Ver cambios**. Para auditar un módulo nuevo basta con agregar su configuración.
- En la demostración, todo lo que hagas en las pantallas de la empresa, los catálogos y las solicitudes se registra
  al momento en su bitácora, con la persona que inició sesión como autor.

### Celular, tableta y escritorio

- Desde 1280 px el menú queda fijo a la izquierda; abajo de eso es un cajón (botón ☰) que se cierra con la X,
  tocando fuera, con Esc, deslizándolo hacia la izquierda o al cambiar de pantalla (también con el botón Atrás).
- Las tablas deciden su forma según el ancho de **su tarjeta** (container queries de Tailwind, `@container`),
  no el de la ventana: con 56rem o más son tabla (compacta entre 56 y 64rem, con los botones solo de ícono);
  con menos, cada fila se vuelve una tarjeta (dos columnas de tarjetas entre 44 y 56rem). Así se ven bien en
  celular, en tableta y en laptops donde el menú le quita espacio.
- Las rejillas (grúas, carrusel, accesorios…) usan las mismas variantes `@xl:`, `@4xl:`… de Tailwind.
- En celular los cuadros de diálogo salen desde abajo con sus botones a lo ancho, el título del encabezado
  puede usar dos renglones y se respetan las zonas seguras (muesca y barra inferior) del teléfono.

### Sonidos

Se generan en el navegador con Web Audio (`src/js/core/sound.js`); no hay archivos de audio. Hay sonidos
para tocar botones, navegar, abrir y cerrar menús y cuadros de diálogo, interruptores, filtros, avisos de éxito
o error, eliminar, cambiar de tema y el claxon de la grúa de «Mis datos». El botón con la bocina (junto al
interruptor de tema) los silencia y se recuerda en `localStorage` (`invictus_admin_sound`). Un elemento puede
pedir un sonido con `data-sound="nombre"` o ninguno con `data-sound="none"`.

### Rendimiento

- Todo lo que se mueve sin parar usa solo `transform` u `opacity`, que el navegador resuelve en la tarjeta de
  video. Antes había animaciones de `left`, `background-position` y `filter`, y desenfoques de fondo
  (`backdrop-filter`) en tarjetas, encabezado y cuadros de diálogo, que obligaban a recalcular y pintar en cada
  cuadro. Medido en una laptop de 1366 × 768 (modo oscuro, 5 s en reposo): de ~150–230 ms de trabajo y
  ~130 recálculos de diseño a ~3 ms y 0.
- Las animaciones del menú se pausan mientras el cajón está cerrado. Al buscar o filtrar, la lista solo hace un
  fundido rápido en vez de volver a entrar escalonada.
- El cambio de tema usa la View Transitions API (un círculo que se expande desde el interruptor) en lugar de
  animar el color de cada elemento.
- Las ilustraciones de ejemplo (`assets/img/demo/*.svg`) están animadas por dentro y son lo único que sigue
  trabajando en reposo (Grúas, Carrusel y Línea del tiempo). Con fotos reales ese costo desaparece.
- **Animaciones** (discretas, para no distraer de la administración): fondo del menú con cuadrícula y barrido
  de luz, tira LED bajo el encabezado, entrada escalonada de tarjetas, medidor de 10 luces del carrusel,
  línea del tiempo que se dibuja con nodos que laten, destello verde en lo recién guardado, salida animada al
  eliminar, barra de luz al pasar sobre una fila de las tablas, interruptores con resorte, barra LED que recorre
  la tarjeta mientras se respalda o restaura, borde que se dibuja en el mensaje del cliente,
  listón de categoría que entra y destella en cada grúa, etiquetas de atributos que aparecen una tras otra,
  renglones del formulario que entran y salen deslizándose, cuadros de diálogo con resorte y línea neón, y el gancho que se balancea en las secciones por
  definir. En modo oscuro los acentos se vuelven neón. Todo se apaga si el sistema pide "reducir movimiento".
- **Ojo con Tailwind v4:** dentro de reglas de `::before` / `::after`, `@apply dark:…` se descarta sin avisar
  (el `&` de CSS no puede representar un pseudo-elemento). En esos casos escribe la regla aparte:
  `.dark .algo::before { … }`.

## Datos y servidor

Hoy todo está **simulado en el navegador**: los datos de ejemplo (`src/js/data/seed.js`, los mismos textos y
productos del sitio público) se copian a `localStorage` y ahí se guardan los cambios. El botón
**Datos de prueba** (abajo del menú) los restablece.

Toda la comunicación pasa por `src/js/services/admin-api.js`; cada función tiene un comentario
**SERVIDOR REAL** con la ruta sugerida, los campos y las respuestas de error (400, 404, 409). Para conectar
el backend de Spring Boot:

1. Reemplaza el cuerpo de cada función por `apiFetch(...)` de `src/js/services/http.js` (ajusta `API_BASE`
   y el formato de error de tu `@RestControllerAdvice`).
2. Las imágenes van como `multipart/form-data` con el `File` original (en las pantallas está marcado dónde).
3. Borra lo marcado como **DEMO**: el bloque de `admin-api.js`, `seed.js`, el botón "Datos de prueba" de
   `index.html` y su código en `admin.js`.
4. En `src/js/features/session.js`, valida la sesión con el servidor y ajusta `LOGIN_URL`.
5. Respaldar y restaurar tardan: el servidor debe responder `202` con la operación `en_proceso` y exponer
   `GET /api/respaldos/{id}` para que la pantalla consulte cuándo termina. El usuario que la lanza sale del token.
6. Las contraseñas solo viajan al crear o cambiarlas; el listado nunca las devuelve.
7. **Mis datos**: `getMyProfile()` debe pedir `GET /api/mi-cuenta` (la persona sale del token).
8. **Bitácoras**: `GET /api/bitacoras/accesos`, `/recuperaciones`, `/cambios-usuarios`, `/empresa`, `/accesorios`,
   `/gruas` y `/solicitudes-eliminadas`, ordenadas de la más reciente a la más antigua (la forma de cada registro
   está en `admin-api.js`). Los registros los escribe el servidor en la misma transacción del cambio (al iniciar
   o cerrar sesión, al recuperar una contraseña, en cada alta, cambio o baja y al eliminar una solicitud); en la
   demostración los escriben `logUserChange()`, `logContentChange()` y `logRequestDeletion()` de `admin-api.js`.
   - Cada registro guarda una **copia** de los datos antes y después, con nombres en lugar de ids, para que el
     historial no cambie si después se renombra o se elimina algo relacionado. Empresa, accesorios y grúas pueden
     compartir una tabla con una columna `modulo`.
   - La imagen se guarda como su URL y solo cuando cambió. Para que el «antes» se siga viendo, el servidor no debe
     borrar de S3 una imagen reemplazada mientras aparezca en la bitácora (si falta, la pantalla dice «Imagen no
     disponible»).

La persona que se muestra abajo del menú y en «Mis datos» sale de la sesión que guarda el portal de acceso; si
no hay sesión, se muestra la cuenta de Administración de prueba (Carlos Mendoza).

## Estructura

```
index.html                 Esqueleto: menú lateral, encabezado y el área donde se dibuja cada pantalla.
assets/img/                Logotipo e ilustraciones de ejemplo (demo/, las mismas del sitio).
src/js/
  admin.js                 Punto de entrada.
  data/menu.js             ÚNICA lista de secciones y pantallas del menú.
  data/seed.js             Datos de demostración.
  services/admin-api.js    ÚNICO lugar que habla con el servidor (hoy simulado).
  services/http.js         Cliente fetch listo para el backend.
  features/                Menú, rutas (#/seccion/pantalla), tema, sesión, sonidos (sound-fx.js),
                           cuadros de diálogo, campo de imagen y contadores de caracteres.
  views/                   Una pantalla por archivo + shared.js con las piezas comunes
                           (profile.js = Mis datos, crane-scene.js = escena de grúas).
                           Bitácoras: audit-log.js (pantalla común y detalle antes / después),
                           audits.js (accesos, recuperación y cambios de usuarios) y content-audits.js
                           (empresa, accesorios, grúas y solicitudes eliminadas).
  core/                    Utilidades de DOM, íconos, avisos, formatos, imágenes y sound.js (Web Audio).
src/styles/
  theme.css                Colores, fuentes y animaciones de la marca (los mismos del portal).
  components/layout.css    Menú lateral, encabezado y área de trabajo.
  components/ui.css        Botones, campos, filtros, interruptores, etiquetas, cuadros de diálogo y avisos.
  components/content.css   Tarjetas, tablas, carrusel, línea del tiempo, respaldos, estados vacíos y animaciones de listas.
  components/neon.css      Efectos de neón y luces LED, interruptor de tema.
  components/pages.css     Mis datos, escena de grúas y bitácoras (antes / después).
```
