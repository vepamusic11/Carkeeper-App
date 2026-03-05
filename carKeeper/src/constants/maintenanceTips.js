/**
 * Maintenance tips and recommendations by type
 * Each tip includes recommended intervals and descriptions in Spanish and English
 */
const maintenanceTips = {
  cambio_aceite: {
    interval_km: 10000,
    interval_months: 6,
    description_es: 'Cada 5.000-10.000 km o cada 6 meses. Usa el aceite recomendado por el fabricante.',
    description_en: 'Every 5,000-10,000 km or every 6 months. Use manufacturer-recommended oil.',
    icon: 'water',
  },
  cambio_filtros: {
    interval_km: 20000,
    interval_months: 12,
    description_es: 'Cada 15.000-20.000 km o una vez al año. Incluye filtro de aire, aceite y combustible.',
    description_en: 'Every 15,000-20,000 km or once a year. Includes air, oil, and fuel filters.',
    icon: 'funnel',
  },
  frenos: {
    interval_km: 40000,
    interval_months: 24,
    description_es: 'Revisar cada 20.000 km. Cambiar pastillas cada 40.000-60.000 km. Discos cada 80.000 km.',
    description_en: 'Check every 20,000 km. Replace pads every 40,000-60,000 km. Rotors every 80,000 km.',
    icon: 'hand-left',
  },
  neumaticos: {
    interval_km: 40000,
    interval_months: 48,
    description_es: 'Rotar cada 10.000 km. Cambiar cada 40.000-60.000 km o cuando el dibujo sea menor a 1.6 mm.',
    description_en: 'Rotate every 10,000 km. Replace every 40,000-60,000 km or when tread is below 1.6 mm.',
    icon: 'ellipse',
  },
  alineacion: {
    interval_km: 10000,
    interval_months: 12,
    description_es: 'Cada 10.000 km o al notar desgaste desigual en los neumáticos.',
    description_en: 'Every 10,000 km or when uneven tire wear is noticed.',
    icon: 'resize',
  },
  balanceado: {
    interval_km: 10000,
    interval_months: 12,
    description_es: 'Cada cambio de neumáticos o cada 10.000 km. Previene vibraciones.',
    description_en: 'Every tire change or every 10,000 km. Prevents vibrations.',
    icon: 'git-compare',
  },
  bateria: {
    interval_km: null,
    interval_months: 6,
    description_es: 'Revisar cada 6 meses. Vida útil de 3-5 años. Limpiar bornes regularmente.',
    description_en: 'Check every 6 months. Lifespan 3-5 years. Clean terminals regularly.',
    icon: 'battery-half',
  },
  aire_acondicionado: {
    interval_km: null,
    interval_months: 24,
    description_es: 'Revisar gas cada 2 años. Limpiar filtros del habitáculo anualmente.',
    description_en: 'Check refrigerant every 2 years. Clean cabin filters annually.',
    icon: 'snow',
  },
  revision_general: {
    interval_km: 10000,
    interval_months: 12,
    description_es: 'Cada 10.000 km o anualmente. Inspección completa de todos los sistemas.',
    description_en: 'Every 10,000 km or annually. Full inspection of all systems.',
    icon: 'search',
  },
  correa_distribucion: {
    interval_km: 100000,
    interval_months: 60,
    description_es: 'Cada 80.000-120.000 km o cada 5 años. Su rotura puede causar daños graves al motor.',
    description_en: 'Every 80,000-120,000 km or every 5 years. Failure can cause severe engine damage.',
    icon: 'sync',
  },
  liquido_frenos: {
    interval_km: null,
    interval_months: 24,
    description_es: 'Cambiar cada 2 años. El líquido absorbe humedad con el tiempo y pierde eficacia.',
    description_en: 'Replace every 2 years. Fluid absorbs moisture over time and loses effectiveness.',
    icon: 'beaker',
  },
  suspension: {
    interval_km: 60000,
    interval_months: 48,
    description_es: 'Revisar cada 20.000 km. Cambiar amortiguadores cada 60.000-80.000 km.',
    description_en: 'Check every 20,000 km. Replace shocks every 60,000-80,000 km.',
    icon: 'swap-vertical',
  },
  transmision: {
    interval_km: 60000,
    interval_months: 48,
    description_es: 'Cambiar aceite de transmisión cada 60.000 km. Verificar nivel regularmente.',
    description_en: 'Change transmission fluid every 60,000 km. Check levels regularly.',
    icon: 'cog',
  },
  refrigerante: {
    interval_km: 40000,
    interval_months: 24,
    description_es: 'Cambiar cada 40.000 km o cada 2 años. No mezclar tipos de refrigerante.',
    description_en: 'Replace every 40,000 km or every 2 years. Do not mix coolant types.',
    icon: 'thermometer',
  },
  bujias: {
    interval_km: 30000,
    interval_months: 36,
    description_es: 'Cada 30.000-60.000 km según tipo. Las de iridio duran hasta 100.000 km.',
    description_en: 'Every 30,000-60,000 km depending on type. Iridium plugs last up to 100,000 km.',
    icon: 'flash',
  },
  luces: {
    interval_km: null,
    interval_months: 12,
    description_es: 'Revisar funcionamiento cada 6 meses. Reemplazar inmediatamente si fallan.',
    description_en: 'Check operation every 6 months. Replace immediately if they fail.',
    icon: 'bulb',
  },
  limpiaparabrisas: {
    interval_km: null,
    interval_months: 12,
    description_es: 'Cambiar cada 6-12 meses o cuando dejen marcas en el parabrisas.',
    description_en: 'Replace every 6-12 months or when they leave streaks on windshield.',
    icon: 'rainy',
  },
  otro: {
    interval_km: null,
    interval_months: null,
    description_es: 'Consulta el manual del propietario para intervalos específicos.',
    description_en: 'Check the owner\'s manual for specific intervals.',
    icon: 'help-circle',
  },
};

/**
 * Get tip for a maintenance type
 * @param {string} type - maintenance type key
 * @param {string} lang - 'es' or 'en'
 * @returns {{ description: string, interval_km: number|null, interval_months: number|null, icon: string } | null}
 */
export const getTip = (type, lang = 'es') => {
  const tip = maintenanceTips[type];
  if (!tip) return maintenanceTips.otro;
  return {
    ...tip,
    description: lang === 'en' ? tip.description_en : tip.description_es,
  };
};

/**
 * Calculate urgency based on last maintenance date and km
 * @param {string} type - maintenance type
 * @param {Date} lastDate - last maintenance date
 * @param {number} lastKm - km at last maintenance
 * @param {number} currentKm - current vehicle km
 * @returns {'overdue'|'upcoming'|'ok'}
 */
export const getUrgency = (type, lastDate, lastKm, currentKm) => {
  const tip = maintenanceTips[type];
  if (!tip) return 'ok';

  let isOverdue = false;
  let isUpcoming = false;

  // Check km-based interval
  if (tip.interval_km && lastKm != null && currentKm != null) {
    const kmSince = currentKm - lastKm;
    if (kmSince >= tip.interval_km) isOverdue = true;
    else if (kmSince >= tip.interval_km * 0.8) isUpcoming = true;
  }

  // Check time-based interval
  if (tip.interval_months && lastDate) {
    const monthsSince = (Date.now() - new Date(lastDate).getTime()) / (1000 * 60 * 60 * 24 * 30);
    if (monthsSince >= tip.interval_months) isOverdue = true;
    else if (monthsSince >= tip.interval_months * 0.8) isUpcoming = true;
  }

  if (isOverdue) return 'overdue';
  if (isUpcoming) return 'upcoming';
  return 'ok';
};

/**
 * Suggest next maintenance date and km based on type
 * @param {string} type - maintenance type
 * @param {number} currentKm - current vehicle km
 * @returns {{ nextKm: number|null, nextDate: Date|null }}
 */
export const suggestNext = (type, currentKm) => {
  const tip = maintenanceTips[type];
  if (!tip) return { nextKm: null, nextDate: null };

  const nextKm = tip.interval_km && currentKm ? currentKm + tip.interval_km : null;
  const nextDate = tip.interval_months
    ? new Date(Date.now() + tip.interval_months * 30 * 24 * 60 * 60 * 1000)
    : null;

  return { nextKm, nextDate };
};

export default maintenanceTips;
