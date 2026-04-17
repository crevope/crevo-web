export interface CityLanding {
  /** URL slug — used at `/prestamos-en-{slug}`. */
  slug: string
  /** Display name in running prose. */
  name: string
  /** Preposition + name, used in headings ("en Lima" / "en La Libertad"). */
  locativeName: string
  /** 2-3 sentence intro tailored to the local consumer. */
  intro: string
  /** Selected economic / demographic data points — surface builds trust
   *  ("they understand our market") and feeds the AI-generated meta. */
  stats: { label: string; value: string }[]
  /** Common use cases local to the city. Plural, lowercase. */
  localUseCases: string[]
  /** Supported banks the user can deposit into. We say "all major Peruvian
   *  banks" centrally; this is just for local flavor if we want to highlight
   *  e.g. a regional bank. Keep empty to use the default list. */
  localBanks?: string[]
}

/**
 * City landing registry.
 *
 * Each entry gets a dedicated page at `/prestamos-en-{slug}` with content
 * tailored for long-tail SEO ("préstamos online arequipa", "crédito rápido
 * trujillo"). The page layout is shared; only copy varies.
 *
 * Adding a new city = adding one entry here. The page and sitemap pick it
 * up automatically at build time.
 */
export const CITIES: CityLanding[] = [
  {
    slug: 'lima',
    name: 'Lima',
    locativeName: 'en Lima',
    intro:
      'Crevo opera en toda Lima Metropolitana y Callao. Desembolsamos a cualquier cuenta bancaria peruana — BCP, Interbank, BBVA, Scotiabank, BanBif — normalmente en menos de 30 minutos en días hábiles. Sin visitas a oficinas, sin filas, sin papeleo físico.',
    stats: [
      { label: 'Población', value: '~10.1M' },
      { label: 'Distritos atendidos', value: '43' },
      { label: 'Promedio desembolso', value: '< 30 min' },
    ],
    localUseCases: [
      'cuotas de universidad o instituto',
      'reparaciones del carro o moto',
      'imprevistos médicos',
      'reemplazo de electrodomésticos',
      'inversión en tu negocio o emprendimiento',
    ],
  },
  {
    slug: 'arequipa',
    name: 'Arequipa',
    locativeName: 'en Arequipa',
    intro:
      'Si vives en Arequipa Metropolitana, Cayma, Yanahuara, Cerro Colorado, Paucarpata o cualquier distrito del departamento, Crevo te desembolsa el mismo día a tu cuenta bancaria. Atendemos a la Ciudad Blanca con el mismo proceso 100% digital que usamos en Lima — sin oficinas regionales, sin demoras.',
    stats: [
      { label: 'Población', value: '~1.3M' },
      { label: 'Desembolso', value: 'Mismo día' },
      { label: 'Proceso', value: '100% online' },
    ],
    localUseCases: [
      'campañas de minería / construcción',
      'gastos de universidades UNSA, UCSM, UCSP',
      'emprendimientos de turismo',
      'emergencias familiares',
      'capital de trabajo para negocios del centro histórico',
    ],
  },
  {
    slug: 'trujillo',
    name: 'Trujillo',
    locativeName: 'en Trujillo',
    intro:
      'Crevo llega a La Libertad con el mismo proceso digital que el resto del país. Vivas en el centro histórico de Trujillo, El Porvenir, Víctor Larco Herrera o Huanchaco, solicitas desde tu teléfono y recibes el depósito en tu cuenta el mismo día.',
    stats: [
      { label: 'Población', value: '~1.0M' },
      { label: 'Desembolso', value: 'Mismo día' },
      { label: 'Sin oficinas', value: 'Todo digital' },
    ],
    localUseCases: [
      'pago de universidad (UNT, UPAO, UCV)',
      'gastos de calzadistas y comercio de El Porvenir',
      'turismo y restauración en Huanchaco',
      'imprevistos médicos',
      'capital semilla de negocios locales',
    ],
  },
  {
    slug: 'chiclayo',
    name: 'Chiclayo',
    locativeName: 'en Chiclayo',
    intro:
      'En la Ciudad de la Amistad, Crevo está disponible para trabajadores, estudiantes y emprendedores de Chiclayo, José Leonardo Ortiz, La Victoria y alrededores. Proceso 100% digital, sin visitas a oficinas, con desembolso a cualquier banco peruano el mismo día.',
    stats: [
      { label: 'Población', value: '~0.88M' },
      { label: 'Desembolso', value: 'Mismo día' },
      { label: 'Proceso', value: '100% online' },
    ],
    localUseCases: [
      'cuotas de USAT, UNPRG, USS',
      'capital para comercio en Mercado Modelo',
      'gastos de campañas agrícolas en Lambayeque',
      'emergencias médicas',
      'reparación de vehículos',
    ],
  },
  {
    slug: 'piura',
    name: 'Piura',
    locativeName: 'en Piura',
    intro:
      'Crevo opera en todo el departamento de Piura. Desde Piura ciudad hasta Sullana, Paita, Talara o Catacaos, solicitas desde tu celular y recibes el depósito en tu cuenta bancaria con el mismo proceso que en el resto del país — aprobación en minutos, sin visitas presenciales.',
    stats: [
      { label: 'Población', value: '~1.8M' },
      { label: 'Desembolso', value: 'Mismo día' },
      { label: 'Sin viajar', value: '100% digital' },
    ],
    localUseCases: [
      'cuotas de UDEP, UNP, UPAO Piura',
      'campañas agrícolas del Bajo Piura',
      'comercio en San Sebastián',
      'emergencias familiares',
      'inversión en pesca artesanal',
    ],
  },
  {
    slug: 'cusco',
    name: 'Cusco',
    locativeName: 'en Cusco',
    intro:
      'En la Ciudad Imperial, Crevo atiende a residentes de Cusco, San Jerónimo, San Sebastián, Santiago y el resto del Valle Sagrado. Desembolso digital a tu cuenta bancaria sin necesidad de visitar oficinas — útil tanto para trabajadores locales como para emprendedores del sector turístico.',
    stats: [
      { label: 'Población', value: '~0.46M' },
      { label: 'Desembolso', value: 'Mismo día' },
      { label: 'Proceso', value: '100% online' },
    ],
    localUseCases: [
      'capital de trabajo para turismo y restauración',
      'cuotas de UNSAAC, UAC, UTEA',
      'gastos de temporada baja',
      'emergencias médicas',
      'emprendimientos textiles y artesanía',
    ],
  },
]

export function findCity(slug: string): CityLanding | null {
  return CITIES.find((c) => c.slug === slug) ?? null
}
