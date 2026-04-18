import Link from 'next/link'
import { MapPin, ShieldCheck } from 'lucide-react'
import { Logo } from './Logo'
import { FacebookIcon } from './brand-icons'
import { CURRENT_YEAR } from '@/shared/lib/constants'
import { CITIES } from '@/features/city-landing/lib/cities'

/**
 * Shared footer for every public-facing marketing surface.
 *
 * Surfaces every navigable page Crevo wants Google (and humans) to find:
 *   - Productos: /simulador, /tarifas, /preguntas-frecuentes, /register
 *   - Empresa: /sobre-nosotros, /blog, contact
 *   - Atención al cliente: support email, /libro-de-reclamaciones,
 *     /libro-de-reclamaciones/consulta, /derechos-del-usuario
 *   - Información legal: T&C, Privacidad, Cookies, Cobranza
 *   - Préstamos por ciudad: every entry from `CITIES`
 *
 * Mounted at the bottom of the landing AND every standalone marketing
 * page (sobre-nosotros, preguntas-frecuentes, simulador, blog, blog/[slug],
 * prestamos-en/[city]) so the SEO link graph is consistent across all
 * entry points and pre-rendered into the HTML for crawlers.
 *
 * Server Component — zero client JS, just `<Link>` and `<a>` elements.
 */
export function LandingFooter() {
  return (
    <footer className="w-full py-12 px-6 sm:px-10 lg:px-16 xl:px-24 bg-[#0A192F] dark:bg-[#1E293B] border-t border-[#0A192F]/20 dark:border-[#334155]">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-8 mb-10">
          {/* Brand column — wider on desktop */}
          <div className="col-span-2 lg:col-span-2">
            <div className="mb-4">
              {/* Footer is always navy bg → white mark + gold "revo" */}
              <Logo size={36} markColor="#FFFFFF" textColor="#D4AF37" />
            </div>
            <p className="text-gray-400 text-sm leading-relaxed mb-4 max-w-sm">
              Préstamos online rápidos, transparentes y 100% digitales para todos los peruanos.
              Regulados, seguros y sin papeleo.
            </p>
            <p className="text-xs text-gray-500">
              <ShieldCheck className="inline h-4 w-4 text-[#00E5FF] mr-1.5" aria-hidden="true" />
              Sujeto Obligado UIF-Perú · Cumple Ley 29733
            </p>
          </div>

          <FooterColumn title="Productos">
            <FooterLink href="/simulador">Simulador de préstamos</FooterLink>
            <FooterLink href="/tarifas">Tarifario (TEA · TCEA)</FooterLink>
            <FooterLink href="/preguntas-frecuentes">Preguntas frecuentes</FooterLink>
            <FooterLink href="/register">Solicitar préstamo</FooterLink>
          </FooterColumn>

          <FooterColumn title="Empresa">
            <FooterLink href="/sobre-nosotros">Sobre nosotros</FooterLink>
            <FooterLink href="/blog">Blog</FooterLink>
            <FooterMail href="hola@crevo.pe">Contacto</FooterMail>
          </FooterColumn>

          <FooterColumn title="Atención al cliente">
            <FooterMail href="soporte@crevo.pe">soporte@crevo.pe</FooterMail>
            <FooterLink href="/libro-de-reclamaciones">Libro de Reclamaciones</FooterLink>
            <FooterLink href="/libro-de-reclamaciones/consulta">Consultar mi reclamo</FooterLink>
            <FooterLink href="/derechos-del-usuario">Tus derechos</FooterLink>
          </FooterColumn>

          <FooterColumn title="Información legal">
            <FooterLink href="/terminos-y-condiciones">Términos y Condiciones</FooterLink>
            <FooterLink href="/politica-de-privacidad">Política de Privacidad</FooterLink>
            <FooterLink href="/politica-de-cookies">Política de Cookies</FooterLink>
            <FooterLink href="/politica-de-cobranza">Política de Cobranza</FooterLink>
          </FooterColumn>
        </div>

        {/* Cities strip — every /prestamos-en/{city} landing surfaces here
            so each one accumulates internal-link equity from every page
            that renders this footer. Pure server-rendered, no JS. */}
        <div className="pt-8 border-t border-gray-700">
          <h3 className="text-white font-semibold mb-4 text-sm flex items-center gap-2">
            <MapPin className="h-4 w-4 text-[#00E5FF]" aria-hidden="true" />
            Préstamos por ciudad
          </h3>
          <ul className="flex flex-wrap gap-2">
            {CITIES.map((city) => (
              <li key={city.slug}>
                <Link
                  href={`/prestamos-en/${city.slug}`}
                  className="inline-flex items-center px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-gray-300 hover:bg-white/10 hover:text-[#D4AF37] hover:border-[#D4AF37]/30 transition-colors"
                >
                  Préstamos en {city.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="pt-8 mt-8 border-t border-gray-700 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-400 text-sm">
            © {CURRENT_YEAR} Crevo. Todos los derechos reservados.
          </p>
          <div className="flex items-center gap-3">
            <a
              href="https://www.facebook.com/crevoperu"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Crevo en Facebook"
              className="w-9 h-9 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 hover:text-[#D4AF37] hover:bg-gray-700 transition-all"
            >
              <FacebookIcon className="h-4 w-4" />
            </a>
            {/* Instagram + LinkedIn pendientes — placeholders comentados para
                agregar cuando los handles existan. Mejor no renderizar links
                rotos: rompen la confianza y son señales SEO negativas. */}
          </div>
        </div>
      </div>
    </footer>
  )
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function FooterColumn({ title, children }: Readonly<{ title: string; children: React.ReactNode }>) {
  return (
    <div>
      <h3 className="text-white font-semibold mb-4 text-sm">{title}</h3>
      <ul className="space-y-2 text-sm">{children}</ul>
    </div>
  )
}

function FooterLink({ href, children }: Readonly<{ href: string; children: React.ReactNode }>) {
  return (
    <li>
      <Link href={href} className="text-gray-400 hover:text-[#D4AF37] transition-colors">
        {children}
      </Link>
    </li>
  )
}

function FooterMail({ href, children }: Readonly<{ href: string; children: React.ReactNode }>) {
  return (
    <li>
      <a href={`mailto:${href}`} className="text-gray-400 hover:text-[#D4AF37] transition-colors">
        {children}
      </a>
    </li>
  )
}
