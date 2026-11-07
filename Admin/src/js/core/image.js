/**
 * Lectura de imágenes elegidas por la persona. Para la demostración se reducen a 1280 px
 * y se guardan como data URL JPEG; con el servidor real se envía el `File` original (ver services/admin-api.js).
 */
export const IMAGE_TYPES = ['image/png', 'image/jpeg'];
export const MAX_IMAGE_MB = 5;

export function validateImage(file) {
    if (!file) return 'Selecciona una imagen.';
    if (!IMAGE_TYPES.includes(file.type)) return 'La imagen debe ser PNG o JPG.';
    if (file.size > MAX_IMAGE_MB * 1024 * 1024) return `La imagen pesa más de ${MAX_IMAGE_MB} MB.`;
    return '';
}

export function readImage(file, maxWidth = 1280) {
    return new Promise((resolve, reject) => {
        const url = URL.createObjectURL(file);
        const img = new Image();
        img.onload = () => {
            const scale = Math.min(1, maxWidth / img.naturalWidth);
            const canvas = document.createElement('canvas');
            canvas.width = Math.round(img.naturalWidth * scale);
            canvas.height = Math.round(img.naturalHeight * scale);
            const context = canvas.getContext('2d');
            context.fillStyle = '#fff';   // fondo para PNG con transparencia
            context.fillRect(0, 0, canvas.width, canvas.height);
            context.drawImage(img, 0, 0, canvas.width, canvas.height);
            URL.revokeObjectURL(url);
            resolve(canvas.toDataURL('image/jpeg', .82));
        };
        img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('No se pudo leer la imagen.')); };
        img.src = url;
    });
}
