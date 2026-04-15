import type { Metadata } from 'next'
import { LegalPageLayout } from '@/features/legal/ui/LegalPageLayout'
import { LEGAL_COMPANY, LEGAL_URLS } from '@/features/legal/lib/legalConstants'

export const metadata: Metadata = {
  title: 'Política de cobranza | Crevo',
  description:
    'Política de cobranza de Crevo: horarios permitidos de contacto, límites diarios, canales y compromiso de trato digno según la Ley 27598 (prohibición del hostigamiento en cobranzas).',
  robots: { index: true, follow: true },
}

/**
 * Política de cobranza pública.
 *
 * Base legal:
 *   - Ley N° 27598 — Prohibición del hostigamiento en cobranzas
 *   - Código del Consumidor (Ley 29571) art. 58-61 — métodos abusivos
 *   - SBS Res. 3274-2017 (Transparencia) — disclosure obligatoria
 *   - D.Leg. 1031 — Protección al consumidor de servicios financieros
 *
 * Esta página es la disclosure pública. La enforcement de los horarios en
 * el motor de notificaciones (CollectionsService) es un pendiente de Tier 1
 * y se implementará en el próximo sprint.
 */
export default function CollectionsPolicyPage() {
  return (
    <LegalPageLayout
      title="Política de cobranza"
      version="2026-04-15"
      effectiveDate="15 de abril de 2026"
      currentHref="/politica-de-cobranza"
      intro={
        `En Crevo creemos que la cobranza es una conversación, no una ` +
        `persecución. Esta política describe cómo, cuándo y con qué límites ` +
        `nos comunicamos contigo si llegas a caer en mora. Está alineada con ` +
        `la Ley N° 27598, el Código del Consumidor (Ley 29571) y las mejores ` +
        `prácticas del sector financiero.`
      }
    >
      <div className="callout">
        <strong>Lo que nunca vamos a hacer:</strong> llamarte fuera de horario,
        contactarte domingos o feriados, comunicarnos con tu familia, vecinos o
        empleador para presionarte, amenazarte, exponerte públicamente ni usar
        un lenguaje ofensivo. Cualquier incumplimiento puedes reportarlo en
        nuestro <a href={LEGAL_URLS.COMPLAINTS_BOOK}>Libro de Reclamaciones</a>{' '}
        o ante INDECOPI.
      </div>

      <h2>1. Cuándo inicia la cobranza</h2>
      <p>
        Un préstamo entra en cobranza únicamente si la cuota no se paga dentro
        del plazo de vencimiento y expiraron los días de gracia. Los tramos son
        los siguientes:
      </p>
      <ul>
        <li>
          <strong>Días 1 a 3 (período de gracia):</strong> enviamos recordatorios
          amigables por email y notificación push. No se aplica ningún interés
          moratorio ni gasto de cobranza.
        </li>
        <li>
          <strong>Días 4 a 6:</strong> empieza a correr el interés moratorio
          diario (dentro del tope publicado por el BCRP) y segundos
          recordatorios.
        </li>
        <li>
          <strong>Desde el día 7:</strong> inicia la gestión activa de cobranza
          con los gastos y canales detallados más abajo.
        </li>
      </ul>

      <h2>2. Horarios permitidos de contacto</h2>
      <p>
        Crevo se compromete a contactarte únicamente dentro de los siguientes
        horarios, conforme a las buenas prácticas del sector y a la prohibición
        de hostigamiento (Ley 27598):
      </p>
      <ul>
        <li>
          <strong>De lunes a sábado:</strong> entre las{' '}
          <strong>08:00 h y las 20:00 h</strong> (hora de Lima).
        </li>
        <li>
          <strong>Domingos y feriados nacionales:</strong> no realizamos
          llamadas ni mensajes de cobranza.
        </li>
        <li>
          <strong>Emails y notificaciones push:</strong> pueden enviarse en
          cualquier horario porque no interrumpen tu descanso, pero cualquier
          obligación de respuesta corre dentro del horario hábil.
        </li>
      </ul>

      <h2>3. Canales y límite diario de contacto</h2>
      <p>
        Para que la comunicación sea efectiva pero nunca abusiva, limitamos el
        número de intentos diarios por canal:
      </p>
      <ul>
        <li>
          <strong>Llamadas telefónicas:</strong> máximo 2 intentos por día.
          Si en un intento alguien responde y solicita que se suspendan las
          llamadas por ese día, cesamos de inmediato.
        </li>
        <li>
          <strong>Mensajes SMS / WhatsApp:</strong> máximo 1 mensaje por día por
          cada canal.
        </li>
        <li>
          <strong>Email:</strong> máximo 1 mensaje por día.
        </li>
        <li>
          <strong>Notificaciones push:</strong> máximo 2 por día (mañana y
          tarde, siempre en horario hábil).
        </li>
      </ul>
      <p>
        Los intentos fallidos (número apagado, no contesta) no cuentan contra
        el límite, pero sí se registran en el expediente del caso.
      </p>

      <h2>4. Con quién podemos comunicarnos</h2>
      <p>
        Nos comunicamos <strong>exclusivamente contigo</strong>, usando los
        datos de contacto que registraste en tu cuenta. Específicamente:
      </p>
      <ul>
        <li>No contactamos a tu familia, vecinos, colegas ni empleador.</li>
        <li>
          No publicamos información sobre tu deuda en redes sociales ni la
          compartimos con terceros ajenos al préstamo.
        </li>
        <li>
          Solo informamos a centrales de riesgo (Equifax, Experian) y a la
          SBS cuando la mora supera los plazos establecidos en la regulación
          vigente, como parte del reporte normal del sistema financiero.
        </li>
      </ul>

      <h2>5. Trato digno garantizado</h2>
      <p>
        Todas las comunicaciones de cobranza se rigen por los siguientes
        principios irrenunciables:
      </p>
      <ul>
        <li>
          <strong>Respeto:</strong> ningún asesor puede usar lenguaje ofensivo,
          amenazas, coacción ni burlas.
        </li>
        <li>
          <strong>Transparencia:</strong> siempre te indicamos el monto
          adeudado, cómo se compone (principal, intereses, moratorios,
          comisiones), y las opciones de regularización.
        </li>
        <li>
          <strong>Identificación:</strong> el asesor se presenta con su nombre
          y como representante de Crevo.
        </li>
        <li>
          <strong>Grabación:</strong> las llamadas se graban con fines de
          control de calidad y auditoría. Tienes derecho a solicitar el audio
          de cualquier llamada relacionada contigo.
        </li>
        <li>
          <strong>Soluciones:</strong> siempre te ofrecemos al menos una
          alternativa de regularización (pago parcial, reprogramación,
          refinanciamiento) antes de iniciar gestiones de mayor intensidad.
        </li>
      </ul>

      <h2>6. Gastos de cobranza</h2>
      <p>
        Los gastos de cobranza se aplican de forma escalonada y están
        publicados de forma íntegra en nuestro{' '}
        <a href={LEGAL_URLS.TARIFF}>Tarifario</a>. Nunca te cobraremos montos
        distintos a los publicados ni gastos no contemplados en tu contrato.
      </p>
      <p>
        Cada cargo de cobranza se informa por escrito antes de aplicarse, con
        el detalle de la gestión realizada y el monto correspondiente.
      </p>

      <h2>7. Interés moratorio</h2>
      <p>
        El interés moratorio es adicional al interés compensatorio y se aplica
        únicamente sobre la porción vencida. Respeta en todo momento el tope
        publicado por el BCRP (tasa máxima adicional de mora), que se actualiza
        de forma automática cuando el BCRP publica nuevos valores.
      </p>

      <h2>8. Cómo regularizar tu préstamo</h2>
      <p>
        Ofrecemos múltiples opciones para que puedas regularizar tu situación
        según lo que puedas pagar hoy:
      </p>
      <ul>
        <li>
          <strong>Pago total:</strong> cancela el saldo completo y tu cuenta
          queda al día. Tu calificación crediticia interna mejora
          inmediatamente.
        </li>
        <li>
          <strong>Pago parcial:</strong> haz un abono y conversa con nosotros
          para reprogramar el saldo restante.
        </li>
        <li>
          <strong>Reprogramación:</strong> evaluamos caso por caso —
          generalmente disponible cuando demuestras voluntad de pago y no has
          tenido reestructuraciones previas en el mismo año.
        </li>
      </ul>
      <p>
        Para coordinar cualquier opción escríbenos a{' '}
        <a href={`mailto:${LEGAL_COMPANY.supportEmail}`}>{LEGAL_COMPANY.supportEmail}</a>{' '}
        o desde tu panel en la sección de préstamos activos.
      </p>

      <h2>9. Qué hacer si consideras que se violó esta política</h2>
      <p>
        Si sientes que un contacto de cobranza se hizo fuera de horario, excedió
        los límites diarios o usó un tono inadecuado, tienes tres canales para
        reportarlo:
      </p>
      <ol>
        <li>
          <strong>Reclamo directo a Crevo:</strong> usa el{' '}
          <a href={LEGAL_URLS.COMPLAINTS_BOOK}>Libro de Reclamaciones</a>{' '}
          virtual — obligatorio atender en 30 días calendario.
        </li>
        <li>
          <strong>INDECOPI:</strong> si eres consumidor y consideras que hubo
          hostigamiento o método abusivo (Ley 29571 art. 58-61), puedes
          presentar reclamo en{' '}
          <a
            href="https://www.indecopi.gob.pe/"
            target="_blank"
            rel="noopener noreferrer"
          >
            indecopi.gob.pe
          </a>.
        </li>
        <li>
          <strong>SBS:</strong> si el problema involucra a un intermediario
          bajo supervisión SBS, puedes usar el Servicio de Atención al Usuario
          de la Superintendencia.
        </li>
      </ol>

      <h2>10. Vigencia y actualizaciones</h2>
      <p>
        Esta política es de aplicación inmediata desde la fecha de vigencia
        indicada al inicio. Si la actualizamos publicaremos la nueva versión en
        esta misma URL y notificaremos a los usuarios con préstamos activos con
        al menos 15 días de anticipación.
      </p>
    </LegalPageLayout>
  )
}
