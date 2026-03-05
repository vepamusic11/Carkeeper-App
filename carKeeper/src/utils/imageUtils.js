/**
 * Construye la URL completa para una imagen
 * @param {string} imageUrl - URL de la imagen (puede ser relativa o absoluta)
 * @returns {string} URL completa de la imagen
 */
export const getImageUrl = (imageUrl) => {
  if (!imageUrl) return null;
  
  // Si ya es una URL completa
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    // Forzar HTTPS si viene con HTTP
    if (imageUrl.startsWith('http://')) {
      return imageUrl.replace('http://', 'https://');
    }
    return imageUrl;
  }
  
  // Si es una URL relativa, construir la URL completa con HTTPS
  const baseUrl = process.env.EXPO_PUBLIC_BACKEND_URL;
  return `${baseUrl}${imageUrl}`;
};