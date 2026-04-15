import type { Metadata } from 'next'
import { LegalPageLayout } from '@/features/legal/ui/LegalPageLayout'
import { LEGAL_VERSIONS, LEGAL_COMPANY, LEGAL_URLS } from '@/features/legal/lib/legalConstants'

export const metadata: Metadata = {
  title: 'Política de Privacidad | Crevo',
  description:
    'Política de Privacidad de Crevo conforme a la Ley N° 29733 de Protección de Datos Personales del Perú.',
  robots: { index: true, follow: true },
}

export default function PrivacyPolicyPage() {
  return (
    <LegalPageLayout
      title="Política de Privacidad"
      version={LEGAL_VERSIONS.PRIVACY}
      effectiveDate="15 de abril de 2026"
      currentHref="/politica-de-privacidad"
      intro={
        `Esta Política de Privacidad describe cómo Crevo recopila, utiliza, almacena, comparte y ` +
        `protege tus datos personales en cumplimiento de la Ley N° 29733 — Ley de Protección de ` +
        `Datos Personales del Perú, su Reglamento (D.S. N° 003-2013-JUS) y demás normativa aplicable.`
      }
    >
      <div className="callout">
        <strong>En una sola línea:</strong> Recopilamos solo los datos necesarios para evaluarte y
        otorgarte un préstamo, los protegemos con cifrado, no los vendemos a terceros y tú puedes
        ejercer en cualquier momento tus derechos ARCO (acceso, rectificación, cancelación, oposición).
      </div>

      <h2>1. Identidad del responsable del tratamiento</h2>
      <p>
        El responsable del tratamiento de tus datos personales es <strong>{LEGAL_COMPANY.legalName}</strong>{' '}
        (en adelante, "Crevo"), con RUC <strong>{LEGAL_COMPANY.ruc}</strong> y domicilio en{' '}
        {LEGAL_COMPANY.address}. Para asuntos de privacidad puedes contactarnos en{' '}
        <a href={`mailto:${LEGAL_COMPANY.privacyEmail}`}>{LEGAL_COMPANY.privacyEmail}</a>.
      </p>
      <p>
        Nuestros bancos de datos personales se encuentran en proceso de inscripción ante la
        Autoridad Nacional de Protección de Datos Personales (ANPDP) del Ministerio de Justicia y
        Derechos Humanos.
      </p>

      <h2>2. ¿Qué datos personales tratamos?</h2>

      <h3>2.1. Datos de identificación</h3>
      <ul>
        <li>Nombres y apellidos completos.</li>
        <li>Tipo y número de documento de identidad (DNI).</li>
        <li>Fecha de nacimiento, género, estado civil.</li>
        <li>Imagen del DNI por ambos lados.</li>
        <li>Fotografía facial en tiempo real (selfie / prueba de vida).</li>
        <li>Firma electrónica simple y huellas auditables (timestamps, IP, agente de usuario).</li>
      </ul>

      <h3>2.2. Datos de contacto</h3>
      <ul>
        <li>Dirección de correo electrónico.</li>
        <li>Número de teléfono móvil.</li>
        <li>Domicilio (cuando se requiera para evaluación crediticia).</li>
      </ul>

      <h3>2.3. Datos financieros y crediticios</h3>
      <ul>
        <li>Cuenta bancaria (CCI, banco, alias) para desembolsos y pagos.</li>
        <li>Información sobre ingresos, ocupación y referencias laborales (cuando se solicite).</li>
        <li>Historial crediticio reportado por centrales de riesgo (Equifax, Sentinel u otras).</li>
        <li>Historial de tus préstamos, pagos, moras y reestructuraciones dentro de Crevo.</li>
      </ul>

      <h3>2.4. Datos técnicos y de uso</h3>
      <ul>
        <li>Dirección IP, tipo de dispositivo, sistema operativo, navegador.</li>
        <li>Datos de geolocalización aproximada (a nivel ciudad/región).</li>
        <li>Cookies y tecnologías similares (ver <a href={LEGAL_URLS.COOKIES}>Política de Cookies</a>).</li>
        <li>Logs de actividad en la Plataforma (acciones, horarios, resultados).</li>
      </ul>

      <h2>3. Finalidades del tratamiento</h2>

      <h3>3.1. Finalidades necesarias para la prestación del servicio</h3>
      <ul>
        <li>Crear, gestionar y autenticar tu cuenta en la Plataforma.</li>
        <li>Verificar tu identidad (KYC) y prevenir suplantación o fraude.</li>
        <li>Evaluar tu capacidad y comportamiento crediticio para aprobar o rechazar préstamos.</li>
        <li>Generar contratos, hojas resumen, cronogramas y constancias de pago.</li>
        <li>Procesar desembolsos y cobranzas a través del sistema financiero peruano.</li>
        <li>Atender tus consultas, quejas y reclamos.</li>
        <li>Cumplir obligaciones legales (tributarias, antilavado, regulatorias).</li>
      </ul>

      <h3>3.2. Finalidades adicionales (opcionales — requieren tu consentimiento)</h3>
      <ul>
        <li>Enviarte ofertas comerciales, descuentos o nuevos productos de Crevo.</li>
        <li>Realizar encuestas de satisfacción y estudios de mercado.</li>
        <li>Personalizar tu experiencia en la Plataforma (recomendaciones, contenido).</li>
      </ul>
      <p>
        Puedes <strong>oponerte en cualquier momento</strong> a las finalidades adicionales sin que
        ello afecte la prestación del servicio principal de préstamos.
      </p>

      <h2>4. Base legal del tratamiento</h2>
      <p>El tratamiento de tus datos se sustenta en una o varias de las siguientes bases:</p>
      <ul>
        <li><strong>Tu consentimiento expreso, libre, previo, inequívoco e informado</strong> al registrarte y aceptar esta Política.</li>
        <li><strong>Ejecución de un contrato</strong> (el contrato de mutuo dinerario que celebras con Crevo).</li>
        <li><strong>Cumplimiento de obligaciones legales</strong> (normativa tributaria, antilavado, protección al consumidor).</li>
        <li><strong>Interés legítimo</strong> de Crevo para prevenir fraudes y mejorar el servicio.</li>
      </ul>

      <h2>5. ¿Con quién compartimos tus datos?</h2>
      <p>
        Crevo no vende ni alquila tus datos personales. Los compartimos exclusivamente con los
        siguientes terceros, en la medida estrictamente necesaria para las finalidades descritas:
      </p>
      <ul>
        <li><strong>Centrales de riesgo</strong> (Equifax Perú, Sentinel) para evaluar tu solvencia y reportar tu comportamiento de pago, conforme a la Ley N° 27489.</li>
        <li><strong>Proveedores de KYC e identidad</strong> (p. ej. Truora) para verificación biométrica del DNI.</li>
        <li><strong>Pasarelas de pago y proveedores de desembolsos</strong> (Culqi, Izipay y entidades del sistema financiero) para procesar cobros y abonos.</li>
        <li><strong>Proveedores de infraestructura</strong> (Supabase / PostgreSQL, almacenamiento de archivos, mensajería transaccional) ubicados en jurisdicciones que ofrecen niveles adecuados de protección.</li>
        <li><strong>Estudios de cobranza</strong> autorizados, en caso de mora, sujetos a obligaciones contractuales de confidencialidad.</li>
        <li><strong>Autoridades competentes</strong> (Poder Judicial, Ministerio Público, SUNAT, UIF-Perú, ANPDP) cuando exista requerimiento debidamente fundamentado.</li>
      </ul>

      <h2>6. Transferencia internacional de datos</h2>
      <p>
        Algunos de nuestros proveedores (alojamiento en la nube, mensajería) procesan datos en
        servidores ubicados fuera del Perú, principalmente en Estados Unidos y la Unión Europea.
        Estas transferencias se realizan al amparo de cláusulas contractuales tipo y/o políticas de
        privacidad que ofrecen niveles de protección equivalentes a los exigidos por la Ley
        N° 29733. Al aceptar esta Política consientes expresamente dichas transferencias.
      </p>

      <h2>7. Plazo de conservación</h2>
      <p>
        Conservamos tus datos personales solo por el tiempo necesario para las finalidades
        descritas y/o para cumplir nuestras obligaciones legales:
      </p>
      <ul>
        <li><strong>Datos del contrato de préstamo</strong>: durante la vigencia del préstamo y hasta diez (10) años después de su cancelación o reestructuración, conforme a las normas civiles y tributarias.</li>
        <li><strong>Datos KYC</strong> (imagen DNI, selfie): durante diez (10) años desde el cierre de tu cuenta o último préstamo, por exigencias de prevención de lavado de activos (Ley N° 27693).</li>
        <li><strong>Datos comerciales (marketing)</strong>: hasta que retires tu consentimiento.</li>
        <li><strong>Logs de seguridad</strong>: doce (12) meses, salvo necesidad probatoria mayor.</li>
      </ul>

      <h2>8. Medidas de seguridad</h2>
      <p>Aplicamos medidas técnicas y organizativas razonables para proteger tus datos:</p>
      <ul>
        <li>Cifrado en tránsito mediante TLS 1.2 o superior.</li>
        <li>Cifrado en reposo de campos sensibles (DNI, CCI bancario) con AES-256-GCM.</li>
        <li>Hash de contraseñas con bcrypt.</li>
        <li>Tokens JWT de corta duración con refresh-token rotativo.</li>
        <li>Códigos OTP de un solo uso para firma de contratos.</li>
        <li>Control de accesos basado en roles y registro de auditoría inmutable.</li>
        <li>Limitación de tasas (rate limiting) y monitoreo continuo contra abusos.</li>
        <li>Backups automáticos y planes de continuidad del negocio.</li>
      </ul>
      <p>
        Ninguna medida de seguridad es absoluta. Si detectas o sospechas un acceso indebido a tu
        cuenta, comunícalo de inmediato a{' '}
        <a href={`mailto:${LEGAL_COMPANY.privacyEmail}`}>{LEGAL_COMPANY.privacyEmail}</a>.
      </p>

      <h2>9. Tus derechos como titular de los datos (Derechos ARCO)</h2>
      <p>
        Conforme a la Ley N° 29733, en cualquier momento puedes ejercer los siguientes derechos:
      </p>
      <ul>
        <li><strong>Acceso:</strong> conocer qué datos tuyos tratamos y para qué.</li>
        <li><strong>Rectificación:</strong> corregir datos inexactos o desactualizados.</li>
        <li><strong>Cancelación / supresión:</strong> solicitar la eliminación de tus datos, salvo que exista obligación legal de conservarlos.</li>
        <li><strong>Oposición:</strong> oponerte a tratamientos específicos (típicamente, marketing).</li>
        <li><strong>Información:</strong> recibir información clara sobre el tratamiento.</li>
        <li><strong>Revocación del consentimiento:</strong> retirar tu consentimiento en cualquier momento, sin efecto retroactivo.</li>
      </ul>
      <p>
        Para ejercer cualquiera de estos derechos envía una solicitud a{' '}
        <a href={`mailto:${LEGAL_COMPANY.privacyEmail}`}>{LEGAL_COMPANY.privacyEmail}</a> adjuntando:
        (i) tu nombre completo y número de DNI; (ii) descripción clara de tu pedido; (iii) copia de
        tu DNI vigente para acreditar identidad. Responderemos tu solicitud en un plazo máximo de
        veinte (20) días hábiles, conforme al Reglamento de la Ley.
      </p>
      <p>
        Si consideras que tu solicitud no fue atendida adecuadamente, puedes presentar un reclamo
        ante la <strong>Autoridad Nacional de Protección de Datos Personales (ANPDP)</strong> del
        Ministerio de Justicia y Derechos Humanos.
      </p>

      <h2>10. Datos de menores de edad</h2>
      <p>
        La Plataforma está dirigida exclusivamente a personas mayores de edad. No recopilamos
        intencionalmente datos de menores de 18 años. Si detectamos que se ha registrado un menor
        de edad procederemos a cerrar la cuenta y eliminar los datos, sin perjuicio de las acciones
        legales que correspondan contra quien haya proporcionado información falsa.
      </p>

      <h2>11. Decisiones automatizadas</h2>
      <p>
        Para aprobar o rechazar préstamos utilizamos modelos automatizados de scoring crediticio
        que combinan información del Usuario, su comportamiento histórico en Crevo y su historial
        en centrales de riesgo. En caso de rechazo automatizado tienes derecho a solicitar:
        (i) explicación general de los criterios usados; (ii) revisión humana de la decisión por un
        analista de Crevo. Las solicitudes deben enviarse a{' '}
        <a href={`mailto:${LEGAL_COMPANY.privacyEmail}`}>{LEGAL_COMPANY.privacyEmail}</a>.
      </p>

      <h2>12. Cookies</h2>
      <p>
        Utilizamos cookies y tecnologías similares para operar la Plataforma, recordar tus
        preferencias y entender cómo se usa el servicio. Para más detalles consulta nuestra{' '}
        <a href={LEGAL_URLS.COOKIES}>Política de Cookies</a>.
      </p>

      <h2>13. Cambios a esta Política</h2>
      <p>
        Podremos actualizar esta Política para reflejar cambios legales, técnicos u operativos.
        Los cambios sustanciales serán comunicados al correo electrónico registrado y/o mediante
        aviso destacado en la Plataforma con la antelación adecuada. La fecha de la última
        actualización siempre se muestra en el encabezado.
      </p>

      <h2>14. Contacto</h2>
      <p>
        Para cualquier consulta o ejercicio de derechos sobre tus datos personales:
      </p>
      <ul>
        <li>Correo: <a href={`mailto:${LEGAL_COMPANY.privacyEmail}`}>{LEGAL_COMPANY.privacyEmail}</a></li>
        <li>Domicilio: {LEGAL_COMPANY.address}</li>
      </ul>

      <div className="callout" style={{ marginTop: '2rem' }}>
        <strong>Última actualización:</strong> 15 de abril de 2026 (versión {LEGAL_VERSIONS.PRIVACY}).
      </div>
    </LegalPageLayout>
  )
}
