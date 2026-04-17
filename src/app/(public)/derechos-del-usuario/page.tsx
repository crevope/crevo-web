import Link from 'next/link'
import { LegalPageLayout } from '@/features/legal/ui/LegalPageLayout'
import { LEGAL_COMPANY, LEGAL_URLS } from '@/features/legal/lib/legalConstants'
import { buildMetadata } from '@/shared/seo/buildMetadata'

export const metadata = buildMetadata({
  title: 'Derechos del usuario',
  description:
    'Resumen práctico de tus derechos como consumidor financiero y como titular de datos personales en Crevo: derechos ARCO (Ley 29733), derechos bajo el Código del Consumidor (Ley 29571) y cómo ejercerlos paso a paso.',
  path: '/derechos-del-usuario',
  keywords: ['derechos arco', 'derechos del consumidor financiero', 'ley 29571'],
})

/**
 * Página orientada a usabilidad — NO reemplaza las cláusulas legales de la
 * Política de Privacidad (que cubren los derechos ARCO de forma formal).
 * Aquí el foco es darle al usuario una guía accionable: "qué puedo pedir",
 * "cómo lo pido", "en cuánto tiempo responden".
 *
 * Cumple con:
 *   - Ley 29733 (Protección de Datos Personales) art. 18–24 + D.S. 003-2013-JUS
 *   - Código del Consumidor (Ley 29571) art. 1, 5, 6, 19, 100
 *   - SBS Res. 3274-2017 (Transparencia — derecho a información clara)
 *   - Directiva ANPDP 01-2020 (ejercicio de derechos)
 */
export default function UserRightsPage() {
  return (
    <LegalPageLayout
      title="Derechos del usuario"
      version="2026-04-15"
      effectiveDate="15 de abril de 2026"
      currentHref="/derechos-del-usuario"
      intro={
        `Este documento es una guía práctica de los derechos que tienes cuando ` +
        `usas Crevo — como consumidor financiero (Código del Consumidor, Ley ` +
        `28587) y como titular de tus datos personales (Ley 29733). Incluye los ` +
        `canales, requisitos y plazos para ejercerlos. La versión formal y ` +
        `exhaustiva vive en la Política de Privacidad y los Términos y ` +
        `Condiciones.`
      }
    >
      <div className="callout">
        <strong>En una sola línea:</strong> Puedes pedirnos en cualquier momento ver, corregir,
        cancelar u oponerte al uso de tus datos; pedir la Hoja Resumen antes de firmar; prepagar sin
        penalidad; cerrar tu cuenta; y reclamar ante Crevo, la ANPDP o INDECOPI si algo no se
        resuelve.
      </div>

      <h2>1. Derechos ARCO sobre tus datos personales</h2>
      <p>
        La Ley N° 29733 te reconoce los siguientes derechos sobre los datos que Crevo trata de ti:
      </p>
      <ul>
        <li>
          <strong>Acceso:</strong> obtener de forma gratuita la información sobre los datos que
          tenemos de ti, el origen de los mismos, las finalidades, las cesiones a terceros y los
          plazos de conservación.
        </li>
        <li>
          <strong>Rectificación:</strong> corregir datos inexactos, incompletos, desactualizados o
          tratados indebidamente.
        </li>
        <li>
          <strong>Cancelación (supresión):</strong> solicitar la eliminación de tus datos cuando ya
          no sean necesarios, salvo obligación legal de conservación (por ejemplo los 10 años
          post-pago exigidos a entidades financieras).
        </li>
        <li>
          <strong>Oposición:</strong> oponerte, total o parcialmente, a tratamientos específicos —
          típicamente marketing y perfilamiento.
        </li>
        <li>
          <strong>Información:</strong> recibir información clara sobre cómo y para qué tratamos tus
          datos antes de recopilarlos.
        </li>
        <li>
          <strong>Revocación del consentimiento:</strong> retirar tu consentimiento previo en
          cualquier momento, sin efecto retroactivo.
        </li>
      </ul>

      <h2>2. Cómo ejerces tus derechos ARCO — paso a paso</h2>
      <ol>
        <li>
          Envía un correo a{' '}
          <a href={`mailto:${LEGAL_COMPANY.privacyEmail}`}>{LEGAL_COMPANY.privacyEmail}</a> con el
          asunto{' '}
          <em>
            “Ejercicio de derecho ARCO — [Acceso / Rectificación / Cancelación / Oposición /
            Información / Revocación]”
          </em>
          .
        </li>
        <li>
          Incluye: (i) tus nombres y apellidos completos; (ii) tu número de DNI; (iii) la
          descripción clara de lo que pides; (iv) una copia legible de tu DNI vigente para acreditar
          tu identidad (sin este requisito no podemos procesar la solicitud, según el Reglamento de
          la Ley 29733).
        </li>
        <li>
          Responderemos tu solicitud en un plazo máximo de <strong>20 días hábiles</strong> contados
          desde que recibimos toda la información necesaria.
        </li>
        <li>
          Si tu solicitud no es atendida o no estás conforme con la respuesta, puedes presentar un
          reclamo ante la{' '}
          <strong>Autoridad Nacional de Protección de Datos Personales (ANPDP)</strong> del
          Ministerio de Justicia y Derechos Humanos.
        </li>
      </ol>

      <h2>3. Derechos como consumidor financiero</h2>
      <p>
        Además de los derechos de datos personales, como cliente de servicios financieros tienes
        derechos específicos bajo la Ley 28587 y la Resolución SBS 3274-2017:
      </p>
      <ul>
        <li>
          <strong>Información veraz y oportuna:</strong> recibir, antes de firmar cualquier
          contrato, la Hoja Resumen con la TEA, TCEA, el cronograma de pagos, todas las comisiones,
          portes y los totales a pagar. Puedes pedirla en cualquier momento durante la simulación.
        </li>
        <li>
          <strong>Cálculo y simulación:</strong> acceder al simulador público de{' '}
          <Link href="/">crevo.pe</Link> y al <a href={LEGAL_URLS.TARIFF}>Tarifario</a> para
          comparar costos antes de decidir.
        </li>
        <li>
          <strong>Prepago sin penalidad:</strong> pagar tu préstamo de forma adelantada, total o
          parcial, sin ningún cargo adicional — la aplicación recalcula automáticamente los
          intereses para que solo pagues por los días efectivamente usados.
        </li>
        <li>
          <strong>No discriminación:</strong> no podemos negarte un producto por motivos que no sean
          criterios objetivos de riesgo crediticio debidamente documentados.
        </li>
        <li>
          <strong>Revisión humana de decisiones automatizadas:</strong> si tu solicitud de préstamo
          fue rechazada por el modelo de scoring, puedes pedir una revisión por un analista de Crevo
          enviando un correo a{' '}
          <a href={`mailto:${LEGAL_COMPANY.privacyEmail}`}>{LEGAL_COMPANY.privacyEmail}</a>.
        </li>
        <li>
          <strong>Trato digno en cobranzas:</strong> si llegas a caer en mora, Crevo cumple con los
          horarios y límites de contacto establecidos en la{' '}
          <a href={LEGAL_URLS.COLLECTIONS_POLICY}>Política de cobranza</a> (Ley 27598 — prohibición
          del hostigamiento).
        </li>
      </ul>

      <h2>4. Cómo reclamas si algo va mal</h2>
      <p>Dependiendo del tipo de problema, tienes tres canales distintos:</p>
      <ol>
        <li>
          <strong>Problemas con tu préstamo o el servicio de Crevo</strong> (cobros incorrectos,
          mora aplicada indebidamente, demoras de desembolso, etc.): usa el{' '}
          <a href={LEGAL_URLS.COMPLAINTS_BOOK}>Libro de Reclamaciones</a> virtual. Debemos
          responderte dentro de 30 días calendario (D.S. 011-2011-PCM / INDECOPI).
        </li>
        <li>
          <strong>Problemas con el uso de tus datos personales</strong> (pedidos ARCO desatendidos,
          uso indebido, filtración): escribe a{' '}
          <a href={`mailto:${LEGAL_COMPANY.privacyEmail}`}>{LEGAL_COMPANY.privacyEmail}</a>. Si no
          resolvemos, puedes escalar a la{' '}
          <strong>Autoridad Nacional de Protección de Datos Personales</strong>.
        </li>
        <li>
          <strong>Reclamos formales ante autoridades:</strong>
          <ul>
            <li>
              <strong>INDECOPI</strong> — para consumidor en general. Canal “Reclama virtual” en{' '}
              <a href="https://www.indecopi.gob.pe/" target="_blank" rel="noopener noreferrer">
                indecopi.gob.pe
              </a>
              .
            </li>
            <li>
              <strong>ANPDP</strong> — para protección de datos. En{' '}
              <a href="https://www.gob.pe/anpd" target="_blank" rel="noopener noreferrer">
                gob.pe/anpd
              </a>
              .
            </li>
          </ul>
        </li>
      </ol>

      <h2>5. Cierre de cuenta y derecho al olvido</h2>
      <p>
        Puedes cerrar tu cuenta de Crevo en cualquier momento desde tu <a href="/profile">perfil</a>{' '}
        o escribiéndonos a{' '}
        <a href={`mailto:${LEGAL_COMPANY.privacyEmail}`}>{LEGAL_COMPANY.privacyEmail}</a>. Ten en
        cuenta que:
      </p>
      <ul>
        <li>
          Si tienes un préstamo activo o una deuda vencida, no podemos cerrar la cuenta hasta que
          quede saldada.
        </li>
        <li>
          Aunque cierres la cuenta, conservamos tus datos KYC y de préstamos por los plazos legales
          obligatorios (10 años para información financiera y antilavado, según Ley 27693).
        </li>
        <li>
          Los datos cuya retención no sea obligatoria se eliminan o anonimizan dentro de los 30 días
          siguientes al cierre.
        </li>
      </ul>

      <h2>6. Contacto y canales de atención</h2>
      <p>{LEGAL_COMPANY.brand} pone a tu disposición los siguientes canales:</p>
      <ul>
        <li>
          <strong>Soporte general:</strong>{' '}
          <a href={`mailto:${LEGAL_COMPANY.supportEmail}`}>{LEGAL_COMPANY.supportEmail}</a>
        </li>
        <li>
          <strong>Privacidad y datos personales:</strong>{' '}
          <a href={`mailto:${LEGAL_COMPANY.privacyEmail}`}>{LEGAL_COMPANY.privacyEmail}</a>
        </li>
        <li>
          <strong>Temas legales:</strong>{' '}
          <a href={`mailto:${LEGAL_COMPANY.email}`}>{LEGAL_COMPANY.email}</a>
        </li>
        <li>
          <strong>Reclamos INDECOPI:</strong>{' '}
          <a href={LEGAL_URLS.COMPLAINTS_BOOK}>Libro de Reclamaciones virtual</a>
        </li>
      </ul>
    </LegalPageLayout>
  )
}
