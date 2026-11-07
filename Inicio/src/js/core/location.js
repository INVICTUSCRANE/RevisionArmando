/**
 * Ubicación de la empresa: alimenta el mapa de Contacto y Reparaciones.
 * Para apuntar a la dirección exacta, cambia `query` (calle, número, colonia…) o pon las coordenadas,
 * por ejemplo '19.4153,-98.1406'. No hace falta clave de Google: se usa el mapa incrustado público.
 */
export const LOCATION = {
    name: 'Industrias Invictus Crane',
    city: 'Apizaco, Tlaxcala',
    country: 'México',
    query: 'Apizaco, Tlaxcala, México',
    zoom: 14
};

const q = () => encodeURIComponent(LOCATION.query);

export const mapEmbedUrl = () => `https://maps.google.com/maps?q=${q()}&z=${LOCATION.zoom}&hl=es&output=embed`;
export const mapOpenUrl = () => `https://www.google.com/maps/search/?api=1&query=${q()}`;
export const mapDirectionsUrl = () => `https://www.google.com/maps/dir/?api=1&destination=${q()}`;
