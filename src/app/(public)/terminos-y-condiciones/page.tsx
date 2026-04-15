import type { Metadata } from 'next'
import { LegalPageLayout } from '@/features/legal/ui/LegalPageLayout'
import { LEGAL_VERSIONS, LEGAL_COMPANY, LEGAL_URLS } from '@/features/legal/lib/legalConstants'

export const metadata: Metadata = {
  title: 'Términos y Condiciones | Crevo',
  description:
    'Términos y Condiciones de uso de la plataforma Crevo para préstamos digitales en Perú.',
  robots: { index: true, follow: true },
}

export default function TermsAndConditionsPage() {
  return (
    <LegalPageLayout
      title="Términos y Condiciones"
      version={LEGAL_VERSIONS.TERMS}
      effectiveDate="15 de abril de 2026"
      currentHref="/terminos-y-condiciones"
      intro={
        `Estos Términos y Condiciones (los "Términos") regulan el uso de la plataforma Crevo ` +
        `(en adelante, la "Plataforma") y la solicitud, otorgamiento y pago de préstamos ofrecidos ` +
        `a través de ella. Al registrarte y/o utilizar nuestros servicios, declaras haberlos leído, ` +
        `comprendido y aceptado en su integridad.`
      }
    >
      <div className="callout">
        <strong>Resumen rápido:</strong> Crevo es una plataforma digital que te permite solicitar
        préstamos personales en línea. Antes de aceptar un préstamo verás siempre el monto que
        recibirás, el monto que pagarás, las cuotas, la TCEA y todos los costos asociados. Solo nos
        comprometemos a desembolsarte el préstamo una vez que ambas partes hayan firmado el contrato.
      </div>

      <h2>1. Identificación del titular y marco regulatorio</h2>
      <p>
        La Plataforma Crevo es operada por <strong>{LEGAL_COMPANY.legalName}</strong>, identificada con
        RUC <strong>{LEGAL_COMPANY.ruc}</strong>, con domicilio en {LEGAL_COMPANY.address}, República
        del Perú. Para cualquier comunicación de carácter legal puedes escribirnos a{' '}
        <a href={`mailto:${LEGAL_COMPANY.email}`}>{LEGAL_COMPANY.email}</a>.
      </p>

      <h3>1.1. Naturaleza jurídica de Crevo</h3>
      <p>
        Crevo es una <strong>empresa peruana de préstamos</strong> que otorga créditos personales con{' '}
        <strong>capital propio</strong>. <strong>No</strong> es un banco, financiera, caja municipal,
        EDPYME, cooperativa de ahorro y crédito ni cualquier otra entidad del sistema financiero
        autorizada por la <strong>Superintendencia de Banca, Seguros y AFP (SBS)</strong>. En
        consecuencia, no captamos depósitos del público ni administramos fondos de terceros, y nuestra
        actividad <strong>no se encuentra bajo la supervisión prudencial de la SBS</strong>.
      </p>

      <h3>1.2. Normas que nos resultan aplicables</h3>
      <p>Nuestra operación se rige por la legislación peruana, en particular:</p>
      <ul>
        <li><strong>Código Civil</strong> — contrato de mutuo dinerario (artículo 1648° y siguientes).</li>
        <li><strong>Ley N° 29571</strong> — Código de Protección y Defensa del Consumidor (INDECOPI).</li>
        <li><strong>Ley N° 29733</strong> y su Reglamento — Protección de Datos Personales (ANPDP).</li>
        <li><strong>Ley N° 27269</strong> y su Reglamento — Firma Electrónica.</li>
        <li><strong>Ley N° 27489</strong> — Centrales Privadas de Información de Riesgos.</li>
        <li><strong>Ley N° 31143</strong> y circulares del <strong>Banco Central de Reserva del Perú (BCRP)</strong> — topes a las tasas de interés convencional compensatoria y moratoria aplicables a operaciones de crédito de consumo y MYPE.</li>
        <li><strong>Ley N° 27693</strong> y <strong>Resolución SBS N° 789-2018-SBS</strong> — Crevo es <em>sujeto obligado</em> ante la <strong>Unidad de Inteligencia Financiera del Perú (UIF-Perú)</strong>, órgano de la SBS, en materia de prevención del lavado de activos y financiamiento del terrorismo. Esta condición implica obligaciones de reporte y monitoreo, pero <strong>no constituye supervisión prudencial</strong> por parte de la SBS.</li>
        <li><strong>D.S. N° 011-2011-PCM</strong> — Libro de Reclamaciones.</li>
      </ul>

      <h3>1.3. Compromiso voluntario de transparencia</h3>
      <p>
        Aun cuando no formamos parte del sistema financiero supervisado, Crevo aplica de manera
        voluntaria los estándares de transparencia exigidos por la SBS a las entidades del sistema
        financiero, en particular: cálculo y publicación de la <strong>TCEA</strong>, entrega de{' '}
        <strong>Hoja Resumen</strong> y <strong>Cronograma de Pagos</strong> antes de la firma del
        contrato, y respeto a los <strong>topes de tasa de interés</strong> publicados por el BCRP.
        A mediano plazo, es nuestro plan iniciar el proceso de autorización ante la SBS como
        Entidad de Desarrollo para la Pequeña y Microempresa (<strong>EDPYME</strong>) cuando
        alcancemos los requisitos de capital y organización exigidos por la Ley N° 26702.
      </p>

      <h2>2. Definiciones</h2>
      <ul>
        <li><strong>Usuario / Tú:</strong> persona natural mayor de edad, con capacidad civil plena, residente en el Perú, que utiliza la Plataforma.</li>
        <li><strong>Crevo / Nosotros:</strong> {LEGAL_COMPANY.legalName}, en su calidad de titular de la Plataforma y otorgante del préstamo.</li>
        <li><strong>Préstamo:</strong> contrato de mutuo dinerario celebrado entre Crevo y el Usuario a través de la Plataforma.</li>
        <li><strong>Cuenta:</strong> registro personal del Usuario en la Plataforma, protegido por correo electrónico y contraseña.</li>
        <li><strong>Hoja Resumen:</strong> documento que detalla el monto, plazo, número de cuotas, TEA, TCEA, comisiones y todos los costos del préstamo, entregado antes de la firma.</li>
        <li><strong>TCEA:</strong> Tasa de Costo Efectivo Anual que incluye intereses y demás cargos.</li>
      </ul>

      <h2>3. Requisitos para usar la Plataforma</h2>
      <p>Para registrarte y solicitar un préstamo debes cumplir, como mínimo, con lo siguiente:</p>
      <ul>
        <li>Ser persona natural, mayor de 18 años y menor de 70 años al momento de la solicitud.</li>
        <li>Contar con DNI vigente emitido por RENIEC.</li>
        <li>Tener domicilio en el territorio nacional peruano.</li>
        <li>Disponer de un correo electrónico válido y un número de teléfono móvil peruano operativo.</li>
        <li>Ser titular de una cuenta bancaria a tu nombre en una entidad del sistema financiero peruano.</li>
        <li>No haber sido reportado por fraude, suplantación de identidad o conducta análoga frente a Crevo o terceros.</li>
      </ul>

      <h2>4. Registro y verificación de identidad (KYC)</h2>
      <p>
        Para activar tu Cuenta deberás completar el proceso de conocimiento del cliente (KYC), que
        incluye la captura de imagen de tu DNI por ambos lados, una prueba de vida (selfie) y, de
        ser necesario, documentación adicional. El proceso se realiza con apoyo de proveedores
        tecnológicos especializados; los datos se tratan conforme a nuestra{' '}
        <a href={LEGAL_URLS.PRIVACY}>Política de Privacidad</a>.
      </p>
      <p>
        Crevo se reserva el derecho de rechazar o suspender una Cuenta si la información provista
        resulta falsa, incompleta, inconsistente o si existen indicios razonables de suplantación o
        uso fraudulento.
      </p>

      <h2>5. Solicitud, evaluación y aprobación del préstamo</h2>
      <p>
        El Usuario podrá solicitar un préstamo desde la Plataforma indicando el monto, plazo y
        frecuencia de pago. Crevo evaluará la solicitud aplicando criterios internos de scoring
        crediticio, que pueden incluir:
      </p>
      <ul>
        <li>Información proporcionada por el Usuario al momento del registro y la solicitud.</li>
        <li>Consultas a centrales de riesgo (Equifax, Sentinel u otras), previa autorización expresa del Usuario.</li>
        <li>Comportamiento histórico del Usuario en la Plataforma (préstamos previos, pagos puntuales, moras).</li>
        <li>Modelos estadísticos y reglas de negocio definidas por Crevo.</li>
      </ul>
      <p>
        La aprobación de un préstamo es facultad exclusiva de Crevo y no genera obligación de
        contratar. La sola simulación de un préstamo en la Plataforma no constituye aprobación ni
        otorga derecho a recibir financiamiento.
      </p>

      <h2>6. Hoja Resumen y firma del contrato</h2>
      <p>
        Antes de la firma del contrato del préstamo, Crevo pondrá a tu disposición la{' '}
        <strong>Hoja Resumen</strong> y el <strong>Cronograma de Pagos</strong>, donde se detallan
        de forma clara y completa: el monto a desembolsar, el monto a pagar, las cuotas, las fechas
        de vencimiento, la Tasa Efectiva Anual (TEA), la Tasa de Costo Efectivo Anual (TCEA), las
        comisiones, los gastos por mora y cualquier otro cargo aplicable. Tienes derecho a leerlos
        antes de firmar y a no aceptar el préstamo si no estás conforme.
      </p>
      <p>
        La TCEA aplicada a tu préstamo no excederá los topes máximos de tasa de interés convencional
        compensatoria publicados semestralmente por el <strong>Banco Central de Reserva del Perú
        (BCRP)</strong> para operaciones de crédito de consumo y MYPE, conforme a la Ley N° 31143.
      </p>
      <p>
        La firma del contrato se realiza mediante <strong>Firma Electrónica Simple</strong> (Ley
        N° 27269 y su Reglamento), implementada a través de un código de un solo uso (OTP) enviado
        a tu correo electrónico verificado. Al ingresar el OTP en la Plataforma manifiestas tu
        consentimiento informado y aceptas todas las condiciones del préstamo.
      </p>

      <h2>7. Desembolso</h2>
      <p>
        Una vez firmado el contrato, Crevo abonará el monto neto del préstamo en la cuenta bancaria
        registrada por el Usuario, a través de transferencias interbancarias o proveedores de pago
        habilitados. Crevo no se hace responsable por demoras ajenas a su control imputables al
        sistema financiero, fallas técnicas de terceros o información bancaria errónea proporcionada
        por el Usuario.
      </p>

      <h2>8. Pago de cuotas y prepago</h2>
      <p>
        El Usuario se obliga a pagar puntualmente cada cuota en la fecha de vencimiento indicada en
        el Cronograma. Crevo pondrá a disposición canales electrónicos de pago (pasarelas de pago,
        transferencias, billeteras digitales) y enviará recordatorios por correo electrónico o
        notificaciones push, sin que la falta de aviso libere al Usuario de su obligación de pago.
      </p>
      <p>
        El Usuario tiene derecho a realizar <strong>prepagos parciales o totales</strong> en
        cualquier momento, sin penalidad, conforme al artículo 86° del Código de Protección y
        Defensa del Consumidor. El cálculo del saldo pendiente al momento del prepago se realizará
        según la modalidad permitida por la normativa vigente.
      </p>

      <h2>9. Mora y consecuencias del incumplimiento</h2>
      <p>
        El incumplimiento total o parcial de cualquier cuota generará automáticamente la mora desde
        el día siguiente al vencimiento, devengando los intereses moratorios pactados en el
        contrato y la Hoja Resumen. Adicionalmente, podrán aplicarse las siguientes consecuencias:
      </p>
      <ul>
        <li>Reporte negativo a centrales de riesgo (Equifax, Sentinel) conforme a la Ley N° 27489.</li>
        <li>Gestiones de cobranza extrajudicial a través de personal propio o terceros autorizados, en estricto respeto de la Ley N° 29571.</li>
        <li>Exigibilidad anticipada del saldo total del préstamo cuando corresponda según el contrato.</li>
        <li>Inicio de acciones legales para el cobro de la deuda, con cargo a las costas y costos del proceso.</li>
      </ul>
      <p>
        Las gestiones de cobranza no se realizarán en horarios nocturnos, días feriados, ni mediante
        amenazas, hostigamiento o exposición pública del deudor.
      </p>

      <h2>10. Reestructuración del préstamo</h2>
      <p>
        Excepcionalmente y a solicitud del Usuario, Crevo podrá evaluar la reestructuración del
        préstamo (p. ej. ampliación de plazo). La aprobación es facultativa. Toda reestructuración
        se documenta con una nueva Hoja Resumen y se firma con el mismo mecanismo de Firma
        Electrónica Simple.
      </p>

      <h2>11. Obligaciones del Usuario</h2>
      <ul>
        <li>Proporcionar información veraz, completa y actualizada en todo momento.</li>
        <li>Mantener la confidencialidad de su contraseña y código OTP. Crevo nunca te pedirá tu contraseña ni OTP por teléfono, WhatsApp o correo.</li>
        <li>Notificar de inmediato cualquier acceso no autorizado a su Cuenta a {LEGAL_COMPANY.supportEmail}.</li>
        <li>Utilizar la Plataforma exclusivamente para fines lícitos y personales.</li>
        <li>No intentar vulnerar la seguridad, hacer ingeniería inversa, ni automatizar el uso de la Plataforma.</li>
      </ul>

      <h2>12. Propiedad intelectual</h2>
      <p>
        Todos los derechos de propiedad intelectual sobre la Plataforma, sus marcas, logotipos,
        software, contenidos y diseños pertenecen a Crevo o a sus licenciantes. El Usuario obtiene
        únicamente una licencia limitada, no exclusiva y revocable para usar la Plataforma conforme
        a estos Términos.
      </p>

      <h2>13. Disponibilidad del servicio</h2>
      <p>
        Crevo realiza esfuerzos razonables para mantener la Plataforma operativa 24/7. Sin embargo,
        no garantiza que el servicio sea ininterrumpido o esté libre de errores. Podrán existir
        ventanas de mantenimiento programadas o interrupciones por causas de fuerza mayor, fallas
        de proveedores externos (Supabase, pasarelas de pago, servicios de mensajería) o ataques
        cibernéticos, sin que esto genere responsabilidad alguna por daños indirectos.
      </p>

      <h2>14. Suspensión y cierre de Cuenta</h2>
      <p>
        Crevo podrá suspender o cerrar la Cuenta del Usuario, previa o posterior comunicación según
        corresponda, en los siguientes casos: (i) incumplimiento sustancial de estos Términos; (ii)
        información falsa o fraudulenta; (iii) actividades de lavado de activos, financiamiento del
        terrorismo o cualquier ilícito; (iv) requerimiento de autoridad competente; (v) inactividad
        prolongada de la Cuenta sin saldos pendientes.
      </p>
      <p>
        El Usuario podrá cerrar voluntariamente su Cuenta solicitándolo por escrito a{' '}
        <a href={`mailto:${LEGAL_COMPANY.supportEmail}`}>{LEGAL_COMPANY.supportEmail}</a>, siempre
        que no mantenga préstamos vigentes ni saldos pendientes. La conservación de información
        posterior al cierre se rige por la <a href={LEGAL_URLS.PRIVACY}>Política de Privacidad</a>.
      </p>

      <h2>15. Limitación de responsabilidad</h2>
      <p>
        En la máxima medida permitida por la ley, Crevo no será responsable por daños indirectos,
        lucro cesante, pérdida de oportunidad o daños morales derivados del uso o imposibilidad de
        uso de la Plataforma. La responsabilidad total agregada de Crevo, en cualquier caso, no
        excederá el monto del último préstamo activo del Usuario al momento del hecho generador.
      </p>

      <h2>16. Atención al cliente y reclamos</h2>
      <p>
        Para consultas, quejas o reclamos puedes contactarnos a través de:
      </p>
      <ul>
        <li>Correo electrónico: <a href={`mailto:${LEGAL_COMPANY.supportEmail}`}>{LEGAL_COMPANY.supportEmail}</a></li>
        <li><a href="/libro-de-reclamaciones">Libro de Reclamaciones virtual</a> disponible en la Plataforma (conforme al D.S. N° 011-2011-PCM).</li>
      </ul>
      <p>
        Atenderemos tu reclamo dentro del plazo legal de quince (15) días hábiles, prorrogable por
        una sola vez por causa justificada, conforme a la Ley N° 29571.
      </p>

      <h2>17. Modificaciones de los Términos</h2>
      <p>
        Crevo podrá modificar estos Términos en cualquier momento. Los cambios sustanciales serán
        comunicados al correo electrónico registrado y/o mediante aviso destacado dentro de la
        Plataforma con al menos cuarenta y cinco (45) días calendario de anticipación, conforme al
        artículo 56° del Código del Consumidor cuando resulte aplicable. Si no estás de acuerdo con
        las modificaciones podrás cerrar tu Cuenta antes de su entrada en vigencia.
      </p>

      <h2>18. Ley aplicable y solución de controversias</h2>
      <p>
        Estos Términos se rigen por las leyes de la República del Perú. Cualquier controversia
        derivada de su interpretación o ejecución se someterá a los Juzgados y Salas Civiles del
        Distrito Judicial de Lima Cercado, sin perjuicio del derecho del Usuario consumidor de
        acudir a INDECOPI o a los mecanismos alternativos de solución de conflictos previstos en la
        Ley N° 29571.
      </p>

      <h2>19. Aceptación</h2>
      <p>
        Al hacer clic en "Acepto los Términos y Condiciones" y/o al registrarte, ingresar a la
        Plataforma o solicitar un préstamo, confirmas haber leído estos Términos y los aceptas en
        su totalidad. Esta aceptación queda registrada de forma inmutable en nuestros sistemas
        junto con la versión exacta del documento, fecha, hora, dirección IP y agente de usuario,
        como evidencia del consentimiento prestado.
      </p>

      <div className="callout" style={{ marginTop: '2rem' }}>
        <strong>Última actualización:</strong> 15 de abril de 2026 (versión {LEGAL_VERSIONS.TERMS}).<br />
        <strong>Texto vigente:</strong> Esta página siempre muestra la versión vigente. Las
        versiones anteriores quedan archivadas en nuestros sistemas y pueden solicitarse a{' '}
        <a href={`mailto:${LEGAL_COMPANY.email}`}>{LEGAL_COMPANY.email}</a>.
      </div>
    </LegalPageLayout>
  )
}
