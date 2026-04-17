/**
 * Crevo FAQs — single source of truth for both:
 *
 *   1. The visual `<FaqSection>` accordion on the landing page.
 *   2. The Schema.org FAQPage JSON-LD that powers the rich snippet
 *      Google can render directly in search results (the expandable
 *      questions block).
 *
 * Why these 10 questions:
 *   - Match real "long-tail" search intent we saw researching peer
 *     fintechs in Perú (Latu, Tienda Pago, Increase, etc.) and Google
 *     Search Console seed queries for the loan vertical.
 *   - Cover the 5 main conversion blockers: amount, time, requirements,
 *     cost (TEA), trust (regulation, security).
 *   - Spaced answers (~ 2-4 sentences each) so the FAQPage rich snippet
 *     renders cleanly without being truncated.
 *
 * Editing rules:
 *   - Keep `id` stable — used as DOM anchor + accordion key. Don't
 *     reuse old ids if you delete/replace a question (silent SEO loss).
 *   - Plain text answers only (no HTML) — Google strips tags from
 *     FAQPage answers; mixing them in the visual section needs the same
 *     restraint or the JSON-LD will diverge from what the user sees,
 *     which Google can flag as "deceptive markup".
 */

export interface Faq {
  /** Stable identifier — used for accordion keys and DOM anchors. */
  id: string
  question: string
  answer: string
}

export const FAQS: readonly Faq[] = [
  {
    id: 'monto-disponible',
    question: '¿Qué montos puedo solicitar en Crevo?',
    answer:
      'Puedes pedir desde S/. 200 hasta S/. 2,000. El monto exacto que apruebes depende de tu evaluación crediticia: si es tu primer préstamo con nosotros, partirás con un límite menor que se va ampliando a medida que pagas a tiempo.',
  },
  {
    id: 'tiempo-aprobacion',
    question: '¿Cuánto demora la aprobación?',
    answer:
      'La evaluación es automática y dura unos minutos. En la mayoría de casos te avisamos en menos de 10 minutos si fuiste aprobado, y el desembolso a tu cuenta bancaria suele caer el mismo día hábil que aceptas las condiciones.',
  },
  {
    id: 'requisitos',
    question: '¿Qué requisitos necesito para solicitar un préstamo?',
    answer:
      'Solo necesitas tener entre 18 y 70 años, DNI peruano vigente, una cuenta bancaria a tu nombre en cualquier banco del Perú, y un correo y celular activos. No pedimos boletas, declaraciones de SUNAT ni avales: la evaluación es 100% digital.',
  },
  {
    id: 'tea-tasa',
    question: '¿Cuál es la TEA y cuánto pagaré en total?',
    answer:
      'Tu TEA depende del producto que elijas (Crevo Express, Flex o Plus) y de tu perfil. Antes de firmar te mostramos la TEA, la TCEA y el monto total a pagar — sin letra chica. Puedes ver el tarifario completo en la sección Tarifas.',
  },
  {
    id: 'desembolso',
    question: '¿Cómo recibo el dinero del préstamo?',
    answer:
      'Depositamos directamente en la cuenta bancaria que registraste, sea BCP, Interbank, BBVA, Scotiabank u otro banco peruano. Si tu cuenta es CCI también funciona. El depósito es por transferencia interbancaria, sin cobros adicionales por el desembolso.',
  },
  {
    id: 'seguridad',
    question: '¿Es seguro pedir un préstamo online en Crevo?',
    answer:
      'Sí. Crevo cumple con la Ley N° 29733 de Protección de Datos Personales del Perú, encripta tus datos con estándares bancarios (HTTPS + AES-256), y nunca solicitamos tu clave de banca por internet. Tampoco vendemos tu información a terceros con fines publicitarios.',
  },
  {
    id: 'pago-anticipado',
    question: '¿Puedo pagar mi préstamo antes de la fecha?',
    answer:
      'Sí, puedes adelantar cuotas o pagar el préstamo completo cuando quieras. Al pagar antes solo abonas el capital pendiente más los intereses devengados hasta esa fecha — los intereses futuros se descuentan automáticamente.',
  },
  {
    id: 'mora-incumplimiento',
    question: '¿Qué pasa si no pago a tiempo?',
    answer:
      'Si te atrasas, comenzamos un proceso de cobranza respetando la Ley 27598: contactamos solo en horarios permitidos (lunes a sábado, 7am a 8pm), sin hostigamiento ni amenazas. También aplicamos el interés moratorio establecido en tu Hoja Resumen. Si tienes problemas para pagar, escríbenos antes — siempre es mejor reestructurar a tiempo.',
  },
  {
    id: 'reclamo',
    question: '¿Cómo presento un reclamo?',
    answer:
      'A través del Libro de Reclamaciones digital de Crevo, accesible desde el footer del sitio. Cumplimos con el Código de Protección y Defensa del Consumidor (Ley 29571) e INDECOPI: respondemos en menos de 30 días calendario y te entregamos un código de seguimiento para consultar el estado.',
  },
  {
    id: 'regulacion',
    question: '¿Crevo está regulado en Perú?',
    answer:
      'Crevo opera bajo el marco peruano para empresas fintech de préstamos: cumplimos las tasas máximas establecidas por el BCRP, las reglas de transparencia de la SBS (Res. 3274-2017), las normas PLAFT de la UIF (Decreto Legislativo 1531) y las obligaciones ante INDECOPI y la ANPD.',
  },
] as const
