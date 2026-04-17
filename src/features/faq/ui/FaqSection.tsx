import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/shared/ui/accordion'
import { FAQS } from '../data/faqs'

/**
 * Visual FAQ accordion for the landing page. Each question maps 1:1 to an
 * entry in the FAQPage JSON-LD that gets emitted alongside (see
 * `faqJsonLd()`). Keeping both rendered from the same FAQS array makes it
 * impossible for the visible answer to drift from the structured-data
 * answer Google parses.
 *
 * Accessibility:
 *   - The Accordion primitive (Radix) handles aria-expanded, focus
 *     management and keyboard navigation out of the box.
 *   - Each item gets `id="faq-{slug}"` so we can deep-link to a specific
 *     question (e.g. /#faq-tea-tasa from emails or marketing pages).
 *   - Single-open mode (`type="single" collapsible`) reduces cognitive
 *     load — readers see one answer at a time.
 */
export function FaqSection() {
  return (
    <section
      id="faq"
      aria-labelledby="faq-heading"
      className="w-full bg-white dark:bg-[#0F172A] py-16 lg:py-24"
    >
      <div className="max-w-4xl mx-auto px-6 sm:px-8">
        {/* Section header */}
        <div className="text-center mb-12 lg:mb-16">
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#00E5FF]/10 border border-[#00E5FF]/20 text-xs font-semibold tracking-wider uppercase text-[#0A192F] dark:text-[#00E5FF] mb-4">
            <span className="h-1.5 w-1.5 rounded-full bg-[#00E5FF]" />
            Preguntas frecuentes
          </span>
          <h2
            id="faq-heading"
            className="text-3xl lg:text-4xl font-bold text-[#0A192F] dark:text-white tracking-tight"
          >
            Resolvemos tus dudas sobre{' '}
            <span className="text-[#D4AF37]">préstamos online</span>
          </h2>
          <p className="mt-4 text-base text-gray-600 dark:text-gray-300 max-w-xl mx-auto">
            Todo lo que necesitas saber antes de pedir tu primer préstamo con Crevo:
            montos, requisitos, tiempos y seguridad.
          </p>
        </div>

        {/* Accordion */}
        <Accordion type="single" collapsible className="w-full">
          {FAQS.map((faq) => (
            <AccordionItem key={faq.id} value={faq.id} id={`faq-${faq.id}`}>
              <AccordionTrigger>{faq.question}</AccordionTrigger>
              <AccordionContent>{faq.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        {/* Bottom note */}
        <p className="mt-12 text-center text-sm text-gray-500 dark:text-gray-400">
          ¿Tu pregunta no está aquí?{' '}
          <a
            href="mailto:soporte@crevo.pe"
            className="text-[#0A192F] dark:text-[#D4AF37] font-medium hover:underline"
          >
            Escríbenos a soporte@crevo.pe
          </a>
        </p>
      </div>
    </section>
  )
}
