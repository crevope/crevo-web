import { LegalPageLayout } from '@/features/legal/ui/LegalPageLayout'
import { LEGAL_VERSIONS, LEGAL_COMPANY, LEGAL_URLS } from '@/features/legal/lib/legalConstants'
import { buildMetadata } from '@/shared/seo/buildMetadata'

export const metadata = buildMetadata({
  title: 'Política de Cookies',
  description:
    'Información sobre el uso de cookies y tecnologías similares en la plataforma Crevo.',
  path: '/politica-de-cookies',
})

export default function CookiesPolicyPage() {
  return (
    <LegalPageLayout
      title="Política de Cookies"
      version={LEGAL_VERSIONS.COOKIES}
      effectiveDate="15 de abril de 2026"
      currentHref="/politica-de-cookies"
      intro={
        `Esta Política explica qué cookies y tecnologías similares utiliza Crevo en su sitio web ` +
        `(${LEGAL_COMPANY.domain}), con qué finalidad y cómo puedes gestionarlas. Forma parte ` +
        `integrante de nuestra Política de Privacidad.`
      }
    >
      <h2>1. ¿Qué son las cookies?</h2>
      <p>
        Las cookies son pequeños archivos de texto que un sitio web instala en tu dispositivo
        (computadora, tablet o teléfono) cuando lo visitas. Sirven para que el sitio recuerde
        información sobre tu visita, como tus preferencias o tu sesión iniciada, y para entender
        cómo se utiliza el servicio. Algunas tecnologías equivalentes (LocalStorage, SessionStorage,
        píxeles, etiquetas) cumplen funciones similares y se rigen por esta misma Política.
      </p>

      <h2>2. ¿Qué cookies utilizamos?</h2>

      <h3>2.1. Cookies estrictamente necesarias</h3>
      <p>
        Indispensables para el funcionamiento de la Plataforma.{' '}
        <strong>No requieren tu consentimiento</strong> porque sin ellas el servicio no puede
        prestarse correctamente.
      </p>
      <ul>
        <li>
          <strong>Sesión y autenticación:</strong> guardamos tu token de acceso (JWT) y tu
          refresh-token en almacenamiento local del navegador para mantenerte autenticado.
        </li>
        <li>
          <strong>Preferencias mínimas:</strong> tema claro/oscuro, idioma.
        </li>
        <li>
          <strong>Seguridad:</strong> tokens anti-CSRF, identificadores para limitar abusos (rate
          limiting).
        </li>
      </ul>

      <h3>2.2. Cookies analíticas</h3>
      <p>
        Nos ayudan a medir cómo se usa la Plataforma para mejorarla (páginas más visitadas, tiempo
        en sitio, errores). Solo se activan con tu consentimiento.
      </p>
      <ul>
        <li>
          <strong>Vercel Analytics</strong> — métricas agregadas y anónimas de tráfico.
        </li>
        <li>
          <strong>Medición propia de demanda</strong> — guardamos en tu navegador dos
          identificadores aleatorios, sin ningún dato tuyo dentro: <code>crevo_visitor_id</code>{' '}
          (permanente, para no contarte dos veces si vuelves) y <code>crevo_session_id</code> (se
          renueva a los 30 minutos de inactividad). Nos permiten saber cuántos visitantes distintos
          usan el simulador y qué montos consultan. Identifican a un navegador, no a una persona, no
          se comparten con terceros y no se instalan si rechazas la analítica. Del lado del servidor
          guardamos además tu dirección IP cifrada de forma irreversible, con una clave que cambia
          cada día, solo para no contarte dos veces dentro de la misma jornada.
        </li>
      </ul>

      <h3>2.3. Cookies de terceros</h3>
      <p>
        Algunas funcionalidades dependen de proveedores que pueden instalar sus propias cookies o
        identificadores en tu navegador, sujetos a sus respectivas políticas:
      </p>
      <ul>
        <li>
          <strong>Pasarelas de pago</strong> (Culqi, Izipay): cuando inicias un pago en línea, el
          proveedor puede usar cookies para procesar la transacción y prevenir fraude.
        </li>
        <li>
          <strong>Servicios de KYC</strong> (Truora): pueden establecer identificadores temporales
          durante la verificación biométrica.
        </li>
        <li>
          <strong>Sentry</strong>: monitoreo de errores en producción; usa identificadores no
          persistentes para correlacionar trazas.
        </li>
        <li>
          <strong>Firebase Cloud Messaging</strong>: si activas las notificaciones push, se utiliza
          un token de dispositivo gestionado por Google.
        </li>
      </ul>

      <h2>3. Cookies que NO utilizamos</h2>
      <ul>
        <li>
          <strong>No</strong> usamos cookies publicitarias propias.
        </li>
        <li>
          <strong>No</strong> compartimos identificadores con redes publicitarias para perfilamiento
          comercial.
        </li>
        <li>
          <strong>No</strong> vendemos información de navegación a terceros.
        </li>
      </ul>

      <h2>4. Consentimiento y gestión</h2>
      <p>
        La primera vez que ingresas a la Plataforma verás un banner con tres opciones —
        <em> aceptar todo, rechazar opcionales</em> o <em>personalizar</em> por categoría — todas
        con el mismo peso visual, conforme a la Directiva ANPDP 01-2020. Tu decisión se guarda en tu
        dispositivo y rige las siguientes visitas.
      </p>
      <p>
        Puedes cambiar tu decisión en cualquier momento usando el botón{' '}
        <strong>“Gestionar cookies”</strong> del pie de página. Si actualizamos las categorías o los
        proveedores, el banner volverá a aparecer para renovar el consentimiento. Ten presente que
        bloquear las cookies estrictamente necesarias puede impedir el funcionamiento correcto de la
        Plataforma (por ejemplo, no podrás iniciar sesión).
      </p>

      <h3>4.1. Cómo configurar las cookies en tu navegador</h3>
      <ul>
        <li>
          <strong>Google Chrome:</strong> Configuración → Privacidad y seguridad → Cookies y otros
          datos de sitios.
        </li>
        <li>
          <strong>Mozilla Firefox:</strong> Ajustes → Privacidad y seguridad → Cookies y datos del
          sitio.
        </li>
        <li>
          <strong>Safari:</strong> Preferencias → Privacidad → Cookies y datos de sitios web.
        </li>
        <li>
          <strong>Microsoft Edge:</strong> Configuración → Cookies y permisos del sitio.
        </li>
      </ul>

      <h2>5. Período de conservación</h2>
      <p>
        Las cookies de sesión se eliminan al cerrar el navegador. Las cookies persistentes
        permanecen en tu dispositivo por el tiempo definido por cada cookie (por lo general entre
        treinta días y un año), salvo que las elimines manualmente.
      </p>

      <h2>6. Tratamiento de los datos recopilados</h2>
      <p>
        Cualquier dato personal recopilado a través de cookies se trata conforme a nuestra{' '}
        <a href={LEGAL_URLS.PRIVACY}>Política de Privacidad</a> y a la Ley N° 29733.
      </p>

      <h2>7. Cambios a esta Política</h2>
      <p>
        Podremos actualizar esta Política en función de cambios legales o de los proveedores que
        utilicemos. La fecha de la última actualización siempre se muestra en el encabezado.
      </p>

      <h2>8. Contacto</h2>
      <p>
        Si tienes preguntas sobre el uso de cookies escríbenos a{' '}
        <a href={`mailto:${LEGAL_COMPANY.privacyEmail}`}>{LEGAL_COMPANY.privacyEmail}</a>.
      </p>

      <div className="callout" style={{ marginTop: '2rem' }}>
        <strong>Última actualización:</strong> 15 de abril de 2026 (versión {LEGAL_VERSIONS.COOKIES}
        ).
      </div>
    </LegalPageLayout>
  )
}
