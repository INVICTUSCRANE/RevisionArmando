# Industrias Invictus Crane · Sitio web

Sitio estático (HTML + JavaScript + Tailwind CSS). Se abre directo con doble clic en `index.html`;
no necesita servidor. El estilo LED y neón toma como referencia el portal interno (login).

Las fotografías van en `assets/img/fotos/`: qué archivo va en cada lugar y fotos libres sugeridas
están en [FOTOS.md](FOTOS.md).

## Cómo trabajar

```bash
npm install      # una sola vez
npm run dev      # recompila CSS y JS cada vez que guardas
npm run build    # versión final minificada en /dist
```

Edita siempre los archivos de `src/`. La carpeta `dist/` se genera sola: no la edites a mano.

## Estructura

```
index.html, pages/*.html   Solo el contenido de cada página. Encabezado, pie,
                           carrito y botón de WhatsApp los agrega el JS.
assets/img/                Logotipos.
assets/img/fotos/          Fotografías del sitio (ver FOTOS.md).
assets/img/historia/       Ilustraciones de respaldo de "Nuestra trayectoria"
                           (se regeneran con scripts/historia-svg.py).
src/js/
  main.js                  Punto de entrada: arranca cada módulo.
  data/products.js         ÚNICA fuente de grúas, accesorios y precios, y de las categorías
                           de accesorios (ACCESSORY_CATEGORIES).
  data/media.js            ÚNICA lista de fotografías (archivo, texto alternativo y respaldo).
  core/                    Utilidades: DOM, rutas, localStorage, formato, toast, WhatsApp,
                           ubicación del mapa (location.js), fotos con respaldo (photos.js)
                           destello de luz (burst.js) y modo ligero (performance.js).
  layout/                  Encabezado, pie, menú, redes sociales y los íconos SVG.
  features/
    catalog/               Catálogos tipo libro:
      flipbook.js            motor del libro (StPageFlip); la hoja cambia solo con clic
      page-templates.js      diseño de cada hoja (portada, índice, ficha…)
      cover-art.js           portada detallada (la comparten el catálogo y los libros 3D del inicio)
      catalog-content.js     qué hojas lleva cada catálogo: índice por secciones, portadilla de
                             cada línea o categoría y luego sus fichas
      index.js               qué libro se arma en cada página
    cart/                  Carrito:
      cart-store.js          estado (localStorage, sincronizado entre pestañas)
      cart-drawer.js         panel lateral
      add-feedback.js        confirmación al agregar: botón, destello y ficha que vuela
      fly-to-cart.js         animación de la ficha hacia el carrito visible
    scenes/
      assembly-line.js       línea de ensamble animada (inicio y páginas de equipos)
      play-when-visible.js   pausa una escena fuera de pantalla
    ambient.js             fondo vivo de las secciones oscuras (cuadrícula, luz, chispas)
    pause-offscreen.js     congela las animaciones CSS de las secciones fuera de pantalla
    auth.js                Cuentas locales (contraseñas con hash PBKDF2).
    equipment-viewer.js    Páginas de Plataformas, Rescate, Wheel Lift y Underlift
                           (especificaciones como paneles LED animados).
    book-launcher.js       Libros 3D del inicio: flotan, siguen al cursor, se asoman
                           y al hacer clic se abren y llevan al catálogo.
    location-map.js        Mapa de Google Maps de Contacto y Reparaciones.
    hero-slider.js, stats.js, prefetch.js, timeline.js, reveal.js, forms.js
src/styles/
  main.css                 Importa Tailwind y los componentes.
  theme.css                Colores (verde --color-neon como principal; --color-gold y --color-violet
                           solo para acentos), fuentes y animaciones de la marca.
  base.css                 Estilos generales, aparición al hacer scroll y pausa fuera de pantalla.
  components/
    neon.css                 piezas LED/neón reutilizables (palabra neón, marcos, tiras, HUD, letrero)
    ambient.css              fondo vivo
    scenes.css               línea de ensamble
    book*.css                libro, hojas y libros 3D del inicio
    header.css, hero.css, sections.css, ui.css, cart.css
```

## Tailwind y CSS

Usa clases de Tailwind para lo común y CSS normal en `src/styles/components/` cuando una
animación o efecto lo necesite; ambos conviven sin problema.

Para que el sitio vaya fluido, las animaciones que se repiten solo mueven `transform` u `opacity`
(no sombras ni fondos), no se usa desenfoque de fondo (`backdrop-blur`) sobre zonas animadas y todo
lo que está fuera de pantalla se pausa. Con "reducir movimiento" activado en el sistema, las
animaciones se apagan.

**Modo ligero.** En equipos sin aceleración gráfica (o con poca memoria), `core/performance.js` agrega la
clase `is-lite` a `<html>`: los fondos y los libros 3D del inicio quedan quietos y cada libro se dibuja como
una sola pieza inclinada, para que el scroll no se trabe. Para verlo en cualquier equipo abre una página con
`?ligero` al final (por ejemplo `index.html?ligero`).

## Tareas comunes

- **Agregar o cambiar un producto o precio:** edita `src/js/data/products.js`. El catálogo, el índice,
  la página de la línea y el carrito se actualizan solos. Cada línea de grúas tiene `tagline` (frase de su
  portadilla) e `icon`; cada accesorio tiene `category`, que lo coloca en su sección del catálogo. Agrega los
  accesorios nuevos al final de la lista: los carritos guardados de versiones anteriores dependen del orden.
- **Años de experiencia:** se calculan solos desde el año de inicio (`FOUNDED` en `src/js/features/stats.js`).
- **Cambiar el número de WhatsApp:** `src/js/core/whatsapp.js`.
- **Cambiar el menú o el pie:** `src/js/layout/navigation.js`.
- **Poner las redes sociales oficiales:** cambia cada `href` de `SOCIAL_LINKS` en `src/js/layout/navigation.js`
  (hoy apuntan a la página principal de Facebook, Instagram y TikTok). Se usan en el encabezado, el menú del
  celular y el pie.
- **Cambiar la ubicación del mapa:** `src/js/core/location.js`. Hoy apunta a Apizaco, Tlaxcala; para marcar la
  dirección exacta escribe la calle y número en `query` o pon las coordenadas (por ejemplo `'19.4153,-98.1406'`).
- **Animación al hacer scroll:** agrega `data-reveal` (o `data-reveal="left|right|zoom"`) a cualquier elemento.
- **Cambiar o agregar una foto:** guarda el archivo en `assets/img/fotos/` con el nombre de [FOTOS.md](FOTOS.md);
  para una foto nueva, agrégala también en `src/js/data/media.js`.
- **Fondo LED en una sección oscura:** agrega `<div data-ambient class="absolute inset-0 -z-10"></div>` dentro de
  una sección con `relative isolate overflow-hidden`.
- **Palabra en neón:** `<span class="neon-word">texto</span>`.

## Carrito

Se guarda en el navegador (localStorage), admite cantidades y se sincroniza entre pestañas.
Al agregar un accesorio, el botón se ilumina con "¡Agregado!", sale un destello, la ficha vuela al
carrito (también en pantalla completa) y aparece un aviso con el botón "Ver carrito".
Para finalizar la compra se pide una cuenta; el pedido se envía por WhatsApp con folio, productos y total.
El cobro con Mercado Pago queda pendiente de conectar a un backend.
