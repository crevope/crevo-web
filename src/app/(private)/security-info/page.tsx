'use client'
import Link from 'next/link'
import type { LucideIcon } from 'lucide-react'
import {
  Lock,
  ShieldCheck,
  Key,
  Globe,
  IdCard,
  UserCheck,
  Fingerprint,
  FileSignature,
  DoorClosed,
  Ticket,
  RotateCw,
  Gauge,
  Landmark,
  FileLock,
  Scale,
  Percent,
  Handshake,
  Eye,
  List,
  Bell,
  Cloud,
  ChevronRight,
  CircleHelp,
  Settings,
  Clock,
} from 'lucide-react'

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface SecurityItem {
  icon: LucideIcon
  title: string
  body: string
}

interface SecuritySection {
  id: string
  icon: LucideIcon
  title: string
  subtitle: string
  color: string // text color
  bg: string // icon bg
  border: string
  cardBg: string
  items: SecurityItem[]
}

// ─── Contenido ────────────────────────────────────────────────────────────────

const SECTIONS: SecuritySection[] = [
  {
    id: 'encryption',
    icon: Lock,
    title: 'Cifrado de datos',
    subtitle: 'Tus datos sensibles nunca se almacenan en texto plano.',
    color: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-blue-100 dark:bg-blue-900/30',
    border: 'border-blue-200 dark:border-blue-700/40',
    cardBg: 'bg-blue-50/50 dark:bg-blue-900/10',
    items: [
      {
        icon: ShieldCheck,
        title: 'Cifrado AES-256-GCM',
        body: 'Tu DNI y número de cuenta bancaria (CCI) se cifran con AES-256-GCM — el mismo estándar utilizado por los bancos más grandes del mundo — antes de guardarse en nuestra base de datos. Incluso si alguien accediera a la base de datos, no podría leer esos datos.',
      },
      {
        icon: Key,
        title: 'Claves separadas del dato',
        body: 'La clave de cifrado se almacena en un gestor de secretos independiente, separado de la base de datos. Sin esa clave, los datos cifrados son indescifrables.',
      },
      {
        icon: Globe,
        title: 'Comunicaciones HTTPS / TLS',
        body: 'Toda la comunicación entre tu dispositivo y nuestros servidores viaja cifrada mediante TLS 1.2+. Nadie puede interceptar tus datos en tránsito.',
      },
    ],
  },
  {
    id: 'identity',
    icon: IdCard,
    title: 'Verificación de identidad',
    subtitle: 'Solo personas reales pueden acceder a crédito en Crevo.',
    color: 'text-green-600 dark:text-green-400',
    bg: 'bg-green-100 dark:bg-green-900/30',
    border: 'border-green-200 dark:border-green-700/40',
    cardBg: 'bg-green-50/50 dark:bg-green-900/10',
    items: [
      {
        icon: UserCheck,
        title: 'KYC con Truora',
        body: 'Verificamos tu identidad con Truora, plataforma líder en América Latina, que compara tu DNI y selfie en tiempo real contra bases de datos gubernamentales. Esto evita que terceros soliciten préstamos usando tu nombre.',
      },
      {
        icon: Fingerprint,
        title: 'Límite de intentos de verificación',
        body: 'El sistema permite un máximo de 3 intentos de verificación KYC por usuario. Esto evita ataques automatizados y protege la integridad del proceso de onboarding.',
      },
      {
        icon: FileSignature,
        title: 'Firma Electrónica Simple',
        body: 'Cada contrato de préstamo se firma mediante un código OTP enviado a tu correo verificado, de acuerdo con la Ley N° 27269. El contrato firmado incluye un certificado con tu IP, fecha exacta y hash del documento.',
      },
    ],
  },
  {
    id: 'access',
    icon: DoorClosed,
    title: 'Control de acceso',
    subtitle: 'Tu cuenta solo puede ser tuya.',
    color: 'text-purple-600 dark:text-purple-400',
    bg: 'bg-purple-100 dark:bg-purple-900/30',
    border: 'border-purple-200 dark:border-purple-700/40',
    cardBg: 'bg-purple-50/50 dark:bg-purple-900/10',
    items: [
      {
        icon: Ticket,
        title: 'Tokens de sesión de corta duración',
        body: 'Tu sesión activa expira automáticamente cada 15 minutos. El sistema la renueva en segundo plano si sigues usando la app. Si cierras sesión o cambias de dispositivo, la sesión queda invalidada.',
      },
      {
        icon: RotateCw,
        title: 'Refresh tokens seguros',
        body: 'El token de renovación de sesión se almacena como hash SHA-256 — nunca en texto plano — y tiene una validez de 30 días. Si detectas actividad sospechosa, puedes revocar todas las sesiones desde tu perfil.',
      },
      {
        icon: Gauge,
        title: 'Límite de solicitudes (rate limiting)',
        body: 'El sistema bloquea automáticamente los intentos de acceso repetitivos. No puedes realizar más de 10 solicitudes de préstamo por hora ni abusar de los endpoints de autenticación.',
      },
    ],
  },
  {
    id: 'regulation',
    icon: Landmark,
    title: 'Marco regulatorio',
    subtitle: 'Cumplimos con las leyes peruanas que nos resultan aplicables.',
    color: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-100 dark:bg-amber-900/30',
    border: 'border-amber-200 dark:border-amber-700/40',
    cardBg: 'bg-amber-50/50 dark:bg-amber-900/10',
    items: [
      {
        icon: Landmark,
        title: 'Sujeto Obligado ante la UIF-Perú',
        body: 'Crevo es sujeto obligado ante la Unidad de Inteligencia Financiera (UIF-Perú), órgano de la SBS, en materia de prevención del lavado de activos y financiamiento del terrorismo, conforme a la Ley N° 27693 y la Resolución SBS N° 789-2018-SBS. Reportamos operaciones sospechosas y mantenemos un programa interno de cumplimiento PLAFT.',
      },
      {
        icon: FileLock,
        title: 'Protección de datos personales — Ley N° 29733',
        body: 'Tratamos tus datos conforme a la Ley de Protección de Datos Personales del Perú, fiscalizada por la Autoridad Nacional de Protección de Datos Personales (ANPDP). Tus datos solo se usan para los fines declarados. Puedes solicitar la eliminación de tu cuenta y datos en cualquier momento desde tu perfil.',
      },
      {
        icon: Scale,
        title: 'Hoja Resumen — formato SBS Res. 8181-2012',
        body: 'Aplicamos voluntariamente el formato de Hoja Resumen establecido por la Resolución SBS N° 8181-2012 para entidades del sistema financiero, donde se detallan en lenguaje claro todos los costos, tasas y condiciones del crédito antes de la firma.',
      },
      {
        icon: Percent,
        title: 'Topes de tasa BCRP — Ley N° 31143',
        body: 'La TCEA aplicada a tus préstamos respeta los topes máximos de tasa de interés convencional compensatoria publicados semestralmente por el Banco Central de Reserva del Perú (BCRP) para créditos de consumo y MYPE.',
      },
      {
        icon: Handshake,
        title: 'Protección al consumidor — INDECOPI',
        body: 'Cumplimos con el Código de Protección y Defensa del Consumidor (Ley N° 29571). Contamos con Libro de Reclamaciones virtual en la plataforma conforme al D.S. N° 011-2011-PCM. Atendemos reclamos en máximo 15 días hábiles.',
      },
    ],
  },
  {
    id: 'monitoring',
    icon: Eye,
    title: 'Monitoreo y trazabilidad',
    subtitle: 'Registramos toda acción importante para tu protección.',
    color: 'text-cyan-600 dark:text-cyan-400',
    bg: 'bg-cyan-100 dark:bg-cyan-900/30',
    border: 'border-cyan-200 dark:border-cyan-700/40',
    cardBg: 'bg-cyan-50/50 dark:bg-cyan-900/10',
    items: [
      {
        icon: List,
        title: 'Registro de auditoría inmutable',
        body: 'Toda acción relevante — inicio de sesión, solicitud de préstamo, aprobación, firma, pago — queda registrada con fecha, hora, IP y detalles del evento. Este registro es de solo escritura y no puede modificarse.',
      },
      {
        icon: Bell,
        title: 'Notificaciones en tiempo real',
        body: 'Recibes una notificación inmediata ante cualquier cambio en tu cuenta: nuevo préstamo solicitado, contrato aprobado, pago registrado. Si ves una notificación de algo que no hiciste tú, contáctanos de inmediato.',
      },
      {
        icon: Cloud,
        title: 'Infraestructura en la nube',
        body: 'Toda tu información se almacena y gestiona en servidores seguros en la nube, con alta disponibilidad y respaldos automáticos. Tus datos siempre están protegidos y accesibles cuando los necesitas.',
      },
    ],
  },
]

// ─── Stats rápidos ─────────────────────────────────────────────────────────────

const STATS: { icon: LucideIcon; value: string; label: string }[] = [
  { icon: Lock, value: 'AES-256', label: 'Estándar de cifrado' },
  { icon: ShieldCheck, value: '100%', label: 'Tráfico cifrado HTTPS' },
  { icon: Landmark, value: 'UIF-Perú', label: 'Sujeto Obligado PLAFT' },
  { icon: Clock, value: '15 min', label: 'Expiración de sesión' },
]

// ─── Componente ───────────────────────────────────────────────────────────────

export default function SecurityInfoPage() {
  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Breadcrumb + hero */}
      <div>
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-4">
          <Link href="/dashboard" className="hover:text-[#1A56FF] transition-colors">
            Dashboard
          </Link>
          <ChevronRight className="h-3 w-3" aria-hidden="true" />
          <span className="text-[#0A192F] dark:text-white">Seguridad y privacidad</span>
        </div>

        {/* Hero card */}
        <div
          className="rounded-lg overflow-hidden border border-white/10"
          style={{ background: 'linear-gradient(135deg, #0A192F 0%, #1A365D 100%)' }}
        >
          <div className="p-8 flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="w-14 h-14 rounded-lg bg-[#00E5FF]/10 border border-[#00E5FF]/20 flex items-center justify-center shrink-0">
              <ShieldCheck className="h-7 w-7 text-[#00E5FF]" aria-hidden="true" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#00E5FF]/10 text-[#00E5FF] border border-[#00E5FF]/20 uppercase tracking-wide">
                  Protección activa
                </span>
              </div>
              <h1 className="text-2xl font-semibold text-white mb-1 tracking-tight">
                Seguridad y privacidad
              </h1>
              <p className="text-white/60 text-sm leading-relaxed max-w-xl">
                Aquí explicamos con transparencia qué medidas técnicas y regulatorias protegen tu
                información financiera y personal en Crevo.
              </p>
            </div>
          </div>

          {/* Stats bar */}
          <div className="border-t border-white/8 grid grid-cols-2 sm:grid-cols-4">
            {STATS.map((stat, i) => {
              const StatIcon = stat.icon
              return (
                <div
                  key={stat.label}
                  className={`px-6 py-4 flex flex-col items-center gap-1 ${i < STATS.length - 1 ? 'border-r border-white/8' : ''}`}
                >
                  <StatIcon className="h-5 w-5 text-[#00E5FF] mb-0.5" aria-hidden="true" />
                  <p className="text-white font-semibold text-lg leading-none">{stat.value}</p>
                  <p className="text-white/50 text-xs text-center">{stat.label}</p>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Sections */}
      {SECTIONS.map((section) => {
        const SectionIcon = section.icon
        return (
          <div key={section.id} className="space-y-4">
            {/* Section header */}
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-lg ${section.bg} flex items-center justify-center shrink-0`}
              >
                <SectionIcon className={`h-4 w-4 ${section.color}`} aria-hidden="true" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-[#0A192F] dark:text-white">
                  {section.title}
                </h2>
                <p className="text-xs text-gray-400 dark:text-gray-500">{section.subtitle}</p>
              </div>
            </div>

            {/* Items */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {section.items.map((item) => {
                const ItemIcon = item.icon
                return (
                  <div
                    key={item.title}
                    className={`p-5 rounded-lg border ${section.border} ${section.cardBg}`}
                  >
                    <div
                      className={`w-9 h-9 rounded-lg ${section.bg} flex items-center justify-center mb-3`}
                    >
                      <ItemIcon className={`h-4 w-4 ${section.color}`} aria-hidden="true" />
                    </div>
                    <h3 className="font-semibold text-[#0A192F] dark:text-white text-sm mb-2">
                      {item.title}
                    </h3>
                    <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                      {item.body}
                    </p>
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}

      {/* Footer CTA */}
      <div
        className="rounded-lg p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-white/10"
        style={{ background: 'linear-gradient(135deg, #0A192F 0%, #1A365D 100%)' }}
      >
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
            <CircleHelp className="h-4 w-4 text-white" aria-hidden="true" />
          </div>
          <div>
            <p className="font-semibold text-white text-sm">¿Tienes dudas sobre tu privacidad?</p>
            <p className="text-xs text-white/60 mt-0.5">
              Puedes solicitar la eliminación de tus datos o hacer consultas escribiéndonos a{' '}
              <a href="mailto:privacidad@crevo.pe" className="text-[#00E5FF] hover:underline">
                privacidad@crevo.pe
              </a>
            </p>
          </div>
        </div>
        <Link
          href="/profile?section=security"
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#D4AF37] text-[#0A192F] text-sm font-semibold hover:bg-[#B8941F] transition-colors shrink-0 whitespace-nowrap"
        >
          <Settings className="h-4 w-4" aria-hidden="true" />
          Configurar mi seguridad
        </Link>
      </div>
    </div>
  )
}
