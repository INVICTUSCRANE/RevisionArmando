# Industrias Invictus Crane · Portal interno

Pantalla de acceso del portal interno (HTML + JavaScript + Tailwind CSS). Se abre directo con
doble clic en `index.html`; no necesita servidor.

## Cómo trabajar

```bash
npm install      # una sola vez
npm run dev      # recompila CSS y JS cada vez que guardas
npm run build    # versión final minificada en /dist
```

Edita siempre los archivos de `src/`. La carpeta `dist/` se genera sola: no la edites a mano.

## Qué incluye

- **Inicio de sesión** con rol (Administrador, Ventas, Marketing), correo electrónico como usuario,
  contraseña con botón para mostrarla y "Recordarme". Al entrar aparece un aviso animado de
  "Sesión iniciada correctamente" (todavía no hay panel al que redirigir).
- En computadora todo cabe en la pantalla sin scroll; en celular la página se desplaza normalmente.
- **Recuperar contraseña** por correo o por teléfono (SMS): se pide un código de seguridad de 6 dígitos
  (vence en 10 minutos, se puede reenviar a los 45 s) y luego la nueva contraseña con medidor de
  seguridad. Al terminar se ve una animación de candado cerrándose con destellos.
  **Por ahora cualquier código de 6 dígitos es válido** (ver "Conectar el servidor real").
- **Modo oscuro** con el interruptor de arriba a la derecha. Se recuerda en el navegador y, si nunca
  se eligió, sigue la preferencia del sistema.
- **Animaciones**: inspección de calidad de las grúas (`inspection-scene.js`). Un inspector con casco,
  visor de realidad aumentada y chaleco reflejante revisa desde un panel holográfico cómo se arma cada
  grúa en la bahía de ensamble: el chasis sube por el elevador, el soldador del pórtico agrega cabina,
  caja de arrastre, torre y luces, el escáner láser revisa cada pieza y el inspector la palomea en el
  holograma. Con todo aprobado sale el sello "APROBADA", la grúa se va y sube la siguiente unidad.
  El mouse la controla: la posición horizontal fija la velocidad de la línea, sobre la bahía el
  escáner sigue al cursor, clic en el holograma lanza un nuevo escaneo y clic en la bahía saca
  chispas. Reacciona al formulario: escribir ilumina el holograma, un error lo pone en rojo con falla
  visual y al entrar todo destella en dorado. Además: cuadrícula en movimiento con barrido de luz y
  puntos de neón, chispas, borde neón que recorre la tarjeta y transiciones entre pasos. Se
  desactivan solas si el sistema pide "reducir movimiento".
- **Colores**: el verde es el protagonista; el morado (`royal-*`) y el dorado (`gold-*`) de
  `theme.css` aparecen en detalles: enlaces, borde y línea superior de la tarjeta, punto del titular,
  luna del interruptor de tema, botón de sonido y la escena.
- **Sonidos** (`core/sound.js`): se sintetizan en el navegador (no hay archivos de audio). Suenan al
  pasar el cursor, elegir opciones, escribir, cambiar de tema o de pantalla, en errores, al entrar y
  al restablecer la contraseña. El botón de la bocina (arriba a la derecha del panel verde) o la tecla
  **M** los silencia; la preferencia se recuerda en el navegador.
- **Rendimiento**: la escena es un solo `<canvas>` con una capa fija precalculada; las animaciones
  CSS usan solo `transform` y `opacity`. No animes `filter`, `box-shadow`, `background-position` ni
  degradados: obligan a repintar en cada cuadro y la página se siente lenta.

## Conectar el servidor real

Hoy todo está **simulado en el navegador** porque aún no hay backend. Toda la comunicación pasa por
`src/js/services/auth-api.js`; cada función tiene un comentario **SERVIDOR REAL** con la ruta y la
respuesta esperada:

| Función              | Endpoint sugerido                     |
|----------------------|---------------------------------------|
| `login`              | `POST /api/auth/login`                |
| `requestResetCode`   | `POST /api/auth/password/forgot`      |
| `verifyResetCode`    | `POST /api/auth/password/verify`      |
| `resetPassword`      | `POST /api/auth/password/reset`       |

Al conectarlo, borra lo marcado como **DEMO**: las cuentas de prueba de `auth-api.js`, el bloque
"Cuentas de prueba" de `index.html` y el aviso que muestra el código en pantalla (`recovery.js`).
El servidor es quien debe enviar el correo o SMS, comparar el código (hoy se acepta cualquiera de
6 dígitos), validar contraseñas, limitar intentos y vencer códigos. Cuando exista el panel, cambia el
aviso de `showSuccess` en `login-form.js` por la redirección.

### Cuentas de prueba

| Rol           | Correo                        | Contraseña       | Teléfono         |
|---------------|-------------------------------|------------------|------------------|
| Administrador | admin@invictuscrane.com       | Invictus#2026    | +52 81 1234 5601 |
| Ventas        | ventas@invictuscrane.com      | Ventas#2026      | +52 81 1234 5602 |
| Marketing     | marketing@invictuscrane.com   | Marketing#2026   | +52 81 1234 5603 |

En la recuperación de prueba sirve cualquier código de 6 dígitos y cualquier correo o teléfono. Si usas
el de una cuenta de prueba, su contraseña cambia de verdad en ese navegador; para volver a la original,
borra los datos del sitio en el navegador.

## Estructura

```
index.html                 Inicio de sesión y recuperación (5 pasos en la misma tarjeta).
assets/img/                Logotipo.
src/js/
  login.js                 Punto de entrada.
  services/auth-api.js     ÚNICO lugar que habla con el servidor (hoy simulado).
  features/
    login-form.js          Formulario de inicio de sesión.
    recovery.js            Recuperar contraseña: método, código y nueva contraseña.
    views.js               Cambio animado entre pasos de la tarjeta.
    theme.js               Modo claro / oscuro.
    session.js             Sesión guardada y nombres de los roles.
    inspection-scene.js    Inspector y holograma revisando la construcción de grúas (canvas).
    sound-fx.js            Conecta los sonidos con la interfaz y el botón para silenciar.
    ambient.js             Puntos de neón y chispas del panel izquierdo.
    password-field.js      Botón para mostrar u ocultar contraseñas.
  core/                    Utilidades de DOM, avisos, sonidos (sound.js) y la animación de celebración (burst.js).
src/styles/
  main.css                 Importa Tailwind y los componentes.
  theme.css                Colores, fuentes y animaciones de la marca (los mismos del sitio).
  components/ui.css        Campos, botones, roles, código de 6 dígitos.
  components/scene.css     Cuadrícula animada, chispas y lienzo de la escena.
  components/neon.css      Efectos de neón, interruptor de tema y botón de sonido.
```
