/** Lectura y escritura en localStorage tolerante a datos corruptos o almacenamiento bloqueado. */
export function readJSON(key, fallback) {
    try {
        const value = localStorage.getItem(key);
        return value === null ? fallback : JSON.parse(value);
    } catch (error) {
        console.warn(`No se pudo leer el dato local "${key}".`, error);
        return fallback;
    }
}

export function writeJSON(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
    } catch (error) {
        console.error(`No se pudo guardar el dato local "${key}".`, error);
        return false;
    }
}

export function removeKey(key) {
    try { localStorage.removeItem(key); } catch { /* almacenamiento bloqueado */ }
}
