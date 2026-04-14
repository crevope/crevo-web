'use client'
import { useState } from 'react'
import Link from 'next/link'

// ─── Tipos ────────────────────────────────────────────────────────────────────

type CategoryId = 'historial' | 'deudas' | 'ahorro' | 'presupuesto' | 'credito' | 'fraude'

interface Tip {
  icon: string
  title: string
  body: string
  tag?: string
}

interface Category {
  id: CategoryId
  label: string
  icon: string
  color: string        // Tailwind text color
  bg: string           // Tailwind bg color (badge/icon bg)
  border: string
  cardBg: string
  tips: Tip[]
}

// ─── Contenido ────────────────────────────────────────────────────────────────

const CATEGORIES: Category[] = [
  {
    id: 'historial',
    label: 'Historial crediticio',
    icon: 'fa-solid fa-star',
    color: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-blue-100 dark:bg-blue-900/30',
    border: 'border-blue-200 dark:border-blue-700/40',
    cardBg: 'bg-blue-50/60 dark:bg-blue-900/20',
    tips: [
      {
        icon: 'fa-solid fa-calendar-check',
        title: 'Paga siempre a tiempo',
        body: 'El historial de pagos es el factor más importante de tu score crediticio. Un solo pago atrasado puede reducir tu puntaje hasta 100 puntos y permanecer en tu historial por hasta 5 años.',
        tag: 'Fundamental',
      },
      {
        icon: 'fa-solid fa-clock-rotate-left',
        title: 'Revisa tu reporte crediticio',
        body: 'Solicita tu reporte en Equifax Perú o Infocorp al menos una vez al año. Detectar errores a tiempo te permite corregirlos antes de que afecten una solicitud de crédito.',
      },
      {
        icon: 'fa-solid fa-arrow-trend-up',
        title: 'Construye historial desde cero',
        body: 'Si no tienes historial, comienza con montos pequeños y págalos puntualmente. Cada préstamo pagado a tiempo suma puntos positivos a tu perfil en las centrales de riesgo.',
      },
      {
        icon: 'fa-solid fa-ban',
        title: 'Evita múltiples consultas simultáneas',
        body: 'Cada vez que solicitas crédito en varias entidades al mismo tiempo, se generan "consultas duras" que reducen temporalmente tu score. Espacía tus solicitudes al menos 3 meses.',
      },
    ],
  },
  {
    id: 'deudas',
    label: 'Gestión de deudas',
    icon: 'fa-solid fa-scale-balanced',
    color: 'text-orange-600 dark:text-orange-400',
    bg: 'bg-orange-100 dark:bg-orange-900/30',
    border: 'border-orange-200 dark:border-orange-700/40',
    cardBg: 'bg-orange-50/60 dark:bg-orange-900/20',
    tips: [
      {
        icon: 'fa-solid fa-percent',
        title: 'La regla del 30%',
        body: 'No destines más del 30% de tus ingresos mensuales al pago de deudas. Si superas ese umbral, estás en zona de riesgo de sobreendeudamiento y dificultas tu acceso a nuevos créditos.',
        tag: 'Regla de oro',
      },
      {
        icon: 'fa-solid fa-fire',
        title: 'Método avalancha: elimina la deuda más cara primero',
        body: 'Ordena tus deudas de mayor a menor tasa de interés. Paga el mínimo en todas y destina el excedente a la de mayor tasa. Ahorrarás más en intereses a largo plazo.',
      },
      {
        icon: 'fa-solid fa-snowflake',
        title: 'Método bola de nieve: gana motivación',
        body: 'Paga primero la deuda más pequeña, independientemente de la tasa. Al liquidarla, ese pago lo rediriges a la siguiente. Los logros rápidos mantienen la motivación.',
      },
      {
        icon: 'fa-solid fa-handshake',
        title: 'Negocia antes de entrar en mora',
        body: 'Si prevés dificultades para pagar, contacta a tu acreedor antes de vencer el plazo. Las refinanciaciones o reestructuraciones son más fáciles de obtener antes de entrar en mora.',
      },
    ],
  },
  {
    id: 'ahorro',
    label: 'Hábitos de ahorro',
    icon: 'fa-solid fa-piggy-bank',
    color: 'text-green-600 dark:text-green-400',
    bg: 'bg-green-100 dark:bg-green-900/30',
    border: 'border-green-200 dark:border-green-700/40',
    cardBg: 'bg-green-50/60 dark:bg-green-900/20',
    tips: [
      {
        icon: 'fa-solid fa-shield',
        title: 'Fondo de emergencia: tu primera prioridad',
        body: 'Construye un colchón equivalente a 3 a 6 meses de tus gastos fijos antes de invertir o pagar deudas agresivamente. Este fondo te protege de usar crédito caro en emergencias.',
        tag: 'Prioritario',
      },
      {
        icon: 'fa-solid fa-robot',
        title: 'Automatiza tu ahorro',
        body: 'Configura una transferencia automática el día que recibes tu sueldo. Ahorrar "lo que sobra" rara vez funciona; ahorra primero y gasta con lo que queda.',
      },
      {
        icon: 'fa-solid fa-chart-pie',
        title: 'Regla 50/30/20',
        body: '50% de tus ingresos para necesidades básicas (alquiler, alimentación, servicios), 30% para gastos personales y ocio, y 20% para ahorro e inversión. Ajusta según tu realidad.',
      },
      {
        icon: 'fa-solid fa-tag',
        title: 'Distingue necesidad de deseo',
        body: 'Antes de cada compra no planificada, espera 48 horas. Si aún la quieres y tienes presupuesto para ello, cómprala. Esto elimina las compras impulsivas que erosionan el ahorro.',
      },
    ],
  },
  {
    id: 'presupuesto',
    label: 'Presupuesto personal',
    icon: 'fa-solid fa-file-invoice-dollar',
    color: 'text-purple-600 dark:text-purple-400',
    bg: 'bg-purple-100 dark:bg-purple-900/30',
    border: 'border-purple-200 dark:border-purple-700/40',
    cardBg: 'bg-purple-50/60 dark:bg-purple-900/20',
    tips: [
      {
        icon: 'fa-solid fa-list-check',
        title: 'Registra todos tus gastos durante 30 días',
        body: 'Solo puedes controlar lo que mides. Durante un mes, anota cada gasto (por pequeño que sea) en una app o cuaderno. Descubrirás patrones de gasto que no conocías.',
        tag: 'Primer paso',
      },
      {
        icon: 'fa-solid fa-bullseye',
        title: 'Fija metas SMART',
        body: 'Un objetivo financiero debe ser Específico, Medible, Alcanzable, Relevante y con un Tiempo definido. "Ahorrar S/ 500 para diciembre" es mejor que "ahorrar más".',
      },
      {
        icon: 'fa-solid fa-receipt',
        title: 'Revisa tus suscripciones',
        body: 'Las suscripciones mensuales de S/ 20, S/ 35 o S/ 50 parecen pequeñas por separado, pero juntas pueden sumar cientos de soles al mes. Revisa cuáles realmente usas.',
      },
      {
        icon: 'fa-solid fa-calendar',
        title: 'Presupuesta los gastos variables con anticipación',
        body: 'Navidad, útiles escolares, renovación de seguros o impuestos son gastos predecibles. Divídelos entre 12 y ahorra esa cantidad cada mes para no golpear tu liquidez.',
      },
    ],
  },
  {
    id: 'credito',
    label: 'Uso inteligente del crédito',
    icon: 'fa-solid fa-credit-card',
    color: 'text-cyan-600 dark:text-cyan-400',
    bg: 'bg-cyan-100 dark:bg-cyan-900/30',
    border: 'border-cyan-200 dark:border-cyan-700/40',
    cardBg: 'bg-cyan-50/60 dark:bg-cyan-900/20',
    tips: [
      {
        icon: 'fa-solid fa-magnifying-glass-dollar',
        title: 'Compara la TCEA, no solo la TEA',
        body: 'La Tasa de Costo Efectivo Anual (TCEA) incluye todos los cargos: intereses, comisiones e impuestos. Es el indicador real del costo de un crédito. Siempre compara TCEA entre entidades.',
        tag: 'Clave',
      },
      {
        icon: 'fa-solid fa-calculator',
        title: 'Calcula el costo real antes de pedir',
        body: 'Usa el simulador de Crevo para ver el monto total a devolver antes de aceptar. Un préstamo de S/ 500 puede costarte S/ 620 en total. Asegúrate de poder asumir esa diferencia.',
      },
      {
        icon: 'fa-solid fa-forward',
        title: 'El pago anticipado reduce tus intereses',
        body: 'Si recibes ingresos extra, considera hacer un pago anticipado. Al reducir el saldo pendiente, los intereses futuros se calculan sobre un monto menor.',
      },
      {
        icon: 'fa-solid fa-triangle-exclamation',
        title: 'El crédito para emergencias, no para caprichos',
        body: 'Un préstamo personal es útil para cubrir necesidades urgentes o imprevistos. Financiar vacaciones o ropa con crédito a alta tasa puede duplicar su costo real.',
      },
    ],
  },
  {
    id: 'fraude',
    label: 'Seguridad y fraudes',
    icon: 'fa-solid fa-shield-halved',
    color: 'text-red-600 dark:text-red-400',
    bg: 'bg-red-100 dark:bg-red-900/30',
    border: 'border-red-200 dark:border-red-700/40',
    cardBg: 'bg-red-50/60 dark:bg-red-900/20',
    tips: [
      {
        icon: 'fa-solid fa-user-secret',
        title: 'Nadie legítimo te pedirá tu contraseña',
        body: 'Ni Crevo, ni ningún banco, te pedirá tu contraseña, PIN o código OTP por teléfono, WhatsApp o correo. Si alguien lo hace, es un intento de fraude. Corta la comunicación de inmediato.',
        tag: 'Importante',
      },
      {
        icon: 'fa-solid fa-link',
        title: 'Verifica siempre la URL antes de ingresar datos',
        body: 'Los sitios de phishing imitan páginas legítimas. Asegúrate de que la URL comience con "https://" y que el dominio sea exactamente el correcto. Guarda en favoritos los sitios financieros que usas.',
      },
      {
        icon: 'fa-solid fa-lock',
        title: 'Usa contraseñas únicas y un gestor de contraseñas',
        body: 'Reutilizar contraseñas es peligroso: si una cuenta es hackeada, todas lo son. Usa un gestor de contraseñas (Bitwarden, 1Password) para generar y almacenar contraseñas únicas.',
      },
      {
        icon: 'fa-solid fa-mobile-screen',
        title: 'Activa la autenticación en dos pasos',
        body: 'El doble factor de autenticación (2FA) impide el acceso no autorizado incluso si roban tu contraseña. Actívalo en todas tus cuentas financieras y de correo electrónico.',
      },
    ],
  },
]

// ─── Componente ───────────────────────────────────────────────────────────────

export default function LearnPage() {
  const [activeCategory, setActiveCategory] = useState<CategoryId>('historial')

  const category = CATEGORIES.find(c => c.id === activeCategory)!

  return (
    <div className="space-y-6 max-w-5xl mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-1">
            <Link href="/dashboard" className="hover:text-[#1A56FF] transition-colors">Dashboard</Link>
            <i className="fa-solid fa-chevron-right text-xs" />
            <span className="text-[#0A192F] dark:text-white">Educación Financiera</span>
          </div>
          <h1 className="text-2xl font-semibold text-[#0A192F] dark:text-white tracking-tight">Educación Financiera</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">
            Consejos prácticos para tomar mejores decisiones con tu dinero.
          </p>
        </div>
        <div className="hidden sm:flex w-11 h-11 rounded-lg bg-[#00E5FF]/10 items-center justify-center text-[#00E5FF]">
          <i className="fa-solid fa-graduation-cap text-xl" />
        </div>
      </div>

      {/* Category tabs — horizontal scroll en mobile */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {CATEGORIES.map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all shrink-0 border ${
              activeCategory === cat.id
                ? `${cat.bg} ${cat.color} ${cat.border}`
                : 'bg-white dark:bg-[#1E293B] border-gray-100 dark:border-white/6 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5'
            }`}
          >
            <i className={`${cat.icon} text-xs`} />
            {cat.label}
          </button>
        ))}
      </div>

      {/* Tips grid */}
      <div>
        {/* Section header */}
        <div className="flex items-center gap-3 mb-5">
          <div className={`w-10 h-10 rounded-lg ${category.bg} flex items-center justify-center`}>
            <i className={`${category.icon} ${category.color}`} />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-[#0A192F] dark:text-white">{category.label}</h2>
            <p className="text-xs text-gray-400">{category.tips.length} consejos</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {category.tips.map(tip => (
            <div
              key={tip.title}
              className={`p-5 rounded-lg border ${category.border} ${category.cardBg}`}
            >
              <div className="flex items-start gap-4">
                <div className={`w-10 h-10 rounded-lg ${category.bg} flex items-center justify-center shrink-0 mt-0.5`}>
                  <i className={`${tip.icon} ${category.color} text-sm`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <h3 className="font-semibold text-[#0A192F] dark:text-white text-sm">{tip.title}</h3>
                    {tip.tag && (
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${category.bg} ${category.color}`}>
                        {tip.tag}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{tip.body}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="rounded-lg p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-white/10" style={{ background: 'linear-gradient(135deg, #0A192F 0%, #1A365D 100%)' }}>
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 rounded-lg bg-[#D4AF37] flex items-center justify-center shrink-0">
            <i className="fa-solid fa-bolt text-[#0A192F] text-xl" />
          </div>
          <div>
            <p className="font-semibold text-white text-base">¿Listo para mejorar tu score?</p>
            <p className="text-white/60 text-sm mt-0.5">Aplica lo aprendido. Solicita tu préstamo, págalo a tiempo y construye tu historial.</p>
          </div>
        </div>
        <Link
          href="/request-loan"
          className="bg-[#D4AF37] text-[#0A192F] font-semibold px-6 py-2.5 rounded-lg text-sm hover:bg-[#B8941F] transition-colors shrink-0 whitespace-nowrap"
        >
          Solicitar préstamo
        </Link>
      </div>

    </div>
  )
}
