/**
 * Modo ligero: en equipos que dibujan la página sin aceleración gráfica (el navegador usa un
 * renderizador por software) o con muy poca memoria, los adornos que se repiten sin parar
 * (chispas, libros flotando, marcos que giran) hacen que el scroll se trabe. Ahí se agrega la
 * clase `is-lite` a <html> y styles/base.css los deja quietos; el diseño se ve igual.
 * Para probarlo en cualquier equipo: agrega ?ligero a la dirección de la página.
 */
const SOFTWARE_RENDERER = /swiftshader|llvmpipe|softpipe|software|basic render/i;

function rendererName() {
    try {
        const gl = document.createElement('canvas').getContext('webgl');
        if (!gl) return 'none';
        const info = gl.getExtension('WEBGL_debug_renderer_info');
        const name = info ? gl.getParameter(info.UNMASKED_RENDERER_WEBGL) : '';
        gl.getExtension('WEBGL_lose_context')?.loseContext();
        return String(name);
    } catch {
        return '';
    }
}

export function isLiteDevice() {
    if (new URLSearchParams(location.search).has('ligero')) return true;
    const lowMemory = navigator.deviceMemory !== undefined && navigator.deviceMemory <= 2;
    const name = rendererName();
    return lowMemory || name === 'none' || SOFTWARE_RENDERER.test(name);
}

export function initLiteMode() {
    const lite = isLiteDevice();
    document.documentElement.classList.toggle('is-lite', lite);
    return lite;
}
