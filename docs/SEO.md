# SEO — Guía de operaciones

Estado: **setup técnico completo** (5 fases implementadas). Este documento
explica cómo dejar SEO operativo después del deploy y cómo monitorearlo en
el día a día.

> ⚙️ **Todo el código SEO vive en estos archivos:**
> - `src/shared/config/seo.ts` — single source of truth (URL, marca, keywords, social, verification)
> - `src/shared/seo/buildMetadata.ts` — helper de metadata por página
> - `src/shared/seo/JsonLd.tsx` + `src/shared/seo/schemas/` — structured data
> - `src/app/{robots,sitemap,manifest}.ts` — files conventions de Next 15
> - `src/app/{icon.svg,apple-icon.tsx,opengraph-image.tsx,twitter-image.tsx}` — assets de marca/social
> - `src/features/faq/` — FAQ visual + FAQPage schema (single source de 10 Q&A)

---

## 1. Variables de entorno (Vercel)

Copialas desde `.env.example` al panel de Vercel → Settings → Environment Variables.

| Variable | Obligatoria | Para qué |
|---|---|---|
| `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` | Recomendada | Verificar dominio en Google Search Console |
| `NEXT_PUBLIC_BING_SITE_VERIFICATION` | Recomendada | Verificar dominio en Bing Webmaster Tools |
| `NEXT_PUBLIC_FB_APP_ID` | Opcional | Facebook Insights (analytics de shares) |

**Nota:** son `NEXT_PUBLIC_*` porque se renderizan como `<meta>` tags en el HTML — no hay secreto.

---

## 2. Setup post-deploy (orden recomendado)

### 2.1 Google Search Console — el más importante

Google Search Console (GSC) es **la herramienta gratuita más útil para SEO**: te muestra
qué consultas traen clicks a tu sitio, posición promedio, errores de indexación, mobile
usability, etc. **Hay que registrar el sitio sí o sí.**

**Pasos:**

1. Ir a https://search.google.com/search-console y loguearte con la cuenta de Google de Crevo.
2. Agregar propiedad → elegir **"Prefijo de URL"** (más simple que "Dominio") → ingresar `https://crevo.pe`.
3. **Método de verificación: meta tag HTML**
   - Google te da un string tipo `abc123def456...`
   - Copiar SOLO el valor del `content="..."`, no el tag completo
4. En Vercel → Environment Variables → agregar:
   ```
   NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION=abc123def456...
   ```
5. **Redeploy** (Vercel → Deployments → ⋯ → Redeploy)
6. Volver a GSC → click en "Verificar". Debería aparecer ✅.

**Después de verificar:**

7. Sitemaps → agregar `sitemap.xml` (la URL completa será `https://crevo.pe/sitemap.xml`)
8. Configuración → Orientación geográfica → País objetivo: **Perú** (ya está implícito por el TLD `.pe` y el `lang="es-PE"`, pero confirmarlo no hace daño)
9. Indexación → URL Inspection → pegar `https://crevo.pe/` → "Solicitar indexación" para acelerar el primer crawl

> **Tiempo realista:** Google tarda 3-7 días en empezar a aparecer datos en GSC, y 4-12 semanas en posicionar el sitio para queries no-branded.

### 2.2 Bing Webmaster Tools

Bing tiene ~3% del mercado pero es trivial de setear (importa todo desde GSC).

**Pasos:**

1. Ir a https://www.bing.com/webmasters
2. **Importar desde Google Search Console** (botón en la home — un click)
   - Bing reusa la verificación de Google
   - Importa automáticamente el sitemap
3. (Opcional) Si preferís verificación independiente: usar el método "meta tag" igual que con Google, y setear `NEXT_PUBLIC_BING_SITE_VERIFICATION` en Vercel.

### 2.3 Facebook App ID (opcional)

Solo si querés **analytics de shares** de Facebook (cuántas veces se compartió cada URL, reacciones, etc.). **No es necesario para que las previews se vean bien.**

1. Ir a https://developers.facebook.com/apps/ → **Create App** → tipo "Other" → categoría "Business"
2. Nombre: "Crevo" (o como prefieras)
3. Copiar el **App ID** (15–16 dígitos) del dashboard
4. Vercel → Environment Variables → `NEXT_PUBLIC_FB_APP_ID=1234567890123456`
5. Redeploy

---

## 3. Validar que todo funciona

Después de cada deploy importante, correr este checklist:

### Validators online (gratis)

| Tool | Qué valida | URL |
|---|---|---|
| **Rich Results Test** | structured data (FAQ, Organization, Breadcrumb) y vista previa Google | https://search.google.com/test/rich-results |
| **Schema.org Validator** | Sintaxis estricta de schemas (sin filtro Google) | https://validator.schema.org |
| **Facebook Sharing Debugger** | Open Graph (imagen, título, descripción) | https://developers.facebook.com/tools/debug/ |
| **LinkedIn Post Inspector** | Preview LinkedIn + warnings | https://www.linkedin.com/post-inspector/ |
| **PageSpeed Insights** | Core Web Vitals (LCP, INP, CLS) — afectan ranking | https://pagespeed.web.dev/ |
| **Mobile-Friendly Test** | Que el sitio sea usable en mobile (criterio de ranking) | https://search.google.com/test/mobile-friendly |

### URLs que deberían responder OK

```
GET https://crevo.pe/robots.txt           → 200 text/plain
GET https://crevo.pe/sitemap.xml          → 200 application/xml
GET https://crevo.pe/manifest.webmanifest → 200 application/manifest+json
GET https://crevo.pe/icon.svg             → 200 image/svg+xml
GET https://crevo.pe/apple-icon           → 200 image/png  (180×180)
GET https://crevo.pe/opengraph-image      → 200 image/png  (1200×630)
GET https://crevo.pe/twitter-image        → 200 image/png  (1200×630)
```

### Estructura HTML que debería estar en `<head>`

```html
<title>Crevo — Préstamos online rápidos y seguros en Perú</title>
<meta name="description" content="Mini préstamos online de S/. 200 a S/. 2,000…">
<link rel="canonical" href="https://crevo.pe/">
<meta name="robots" content="index, follow">
<meta property="og:title" content="…">
<meta property="og:image" content="https://crevo.pe/opengraph-image">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:image" content="https://crevo.pe/opengraph-image">
<meta name="theme-color" media="(prefers-color-scheme: dark)" content="#0A192F">
<link rel="icon" href="/icon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/apple-icon" sizes="180x180">
<link rel="manifest" href="/manifest.webmanifest">

<!-- Cuando los env vars estén seteados -->
<meta name="google-site-verification" content="…">
<meta property="fb:app_id" content="…">
```

Y en el `<body>`, **3 bloques `<script type="application/ld+json">`**:
- FinancialService (Organization)
- WebSite
- FAQPage (solo en home)

Las páginas legales tienen un 4° bloque: BreadcrumbList.

---

## 4. Keywords objetivo

Lo que está apuntado en `src/shared/config/seo.ts` (`SEO_KEYWORDS`) y en cada página.

### Head terms (alta intención, alta competencia)

- **préstamos online perú**
- préstamos rápidos perú
- crédito rápido lima

### Long-tail (más fácil ranquear, menos volumen pero alta conversión)

- mini préstamos digitales
- préstamos sin papeleo perú
- préstamos por internet
- préstamos personales online perú
- préstamos inmediatos perú
- préstamos online aprobación rápida

### Branded (tu marca — deberías ser #1 acá)

- crevo
- crevo préstamos
- crevo perú
- libro de reclamaciones crevo

### Regulatorias / informacionales (alta autoridad temática)

- tarifas crevo
- tea préstamos perú
- ley 27598 cobranzas
- libro de reclamaciones digital
- derechos consumidor financiero perú

### Cómo monitorearlas

GSC → **Performance → Search results** → filtrar por query → ver:
- Impressions (cuántas veces apareciste)
- CTR (qué % de los que vieron, clickearon)
- Average position (posición promedio en SERP)

**Apuntá a CTR > 5%** y **position < 10** (primera página) en al menos las branded primero, después las long-tail, y eventualmente las head.

---

## 5. Checklist por deploy

### Pre-deploy (en local antes de pushear cambios SEO)

- [ ] `yarn build` corre sin errores
- [ ] No hay `<img>` raw — todo usa `next/image` (`grep "<img " src/`)
- [ ] No hay URLs externas hardcodeadas en imágenes (`grep "http" src/ | grep -i "image\|img"`)
- [ ] Cada página nueva tiene `metadata` exportado (o un `layout.tsx` con metadata si la page es `'use client'`)
- [ ] Cada página nueva está en el sitemap (`src/app/sitemap.ts`) **si es indexable**
- [ ] Cada página nueva está NO indexada (`index: false`) **si es transaccional/personal**
- [ ] `npm run lint` (Next ESLint) sin warnings nuevos

### Post-deploy

- [ ] Visitar `https://crevo.pe/robots.txt` y `sitemap.xml` — abren OK
- [ ] Pegar `https://crevo.pe/` en **Rich Results Test** — detecta FinancialService + WebSite + FAQPage
- [ ] Pegar `https://crevo.pe/tarifas` en Rich Results Test — detecta BreadcrumbList
- [ ] **Facebook Sharing Debugger** → "Scrape Again" en URLs que cambiaron (FB cachea hasta 30 días)
- [ ] **LinkedIn Post Inspector** → Inspect en URLs que cambiaron
- [ ] **PageSpeed Insights** → home → Core Web Vitals todos en verde (LCP < 2.5s, INP < 200ms, CLS < 0.1)
- [ ] GSC → Sitemaps → ver que el lastmod refleje el deploy
- [ ] GSC → URL Inspection → "Test Live URL" en cualquier página nueva → "Request Indexing"

---

## 6. Roadmap próximo (opcional, no técnico)

El setup técnico SEO está **completo**. Lo que sigue es estratégico y depende del equipo de marketing/contenido:

### Alto impacto

- **Blog en `/blog`**: crear contenido educativo sobre finanzas personales, préstamos, presupuesto, etc. Cada artículo es una nueva URL indexable que puede rankear para queries informacionales que tu landing nunca podrá atacar (ej: "¿qué es la TEA?", "cómo mejorar mi calificación crediticia"). **Mayor ROI SEO long-term que cualquier otra cosa.**
- **Páginas de producto dedicadas**: `/prestamos-express`, `/prestamos-flex`, etc. — cada producto con su keyword target propio. Hoy todo vive en la home.
- **Páginas de ciudades**: `/prestamos-lima`, `/prestamos-arequipa`, `/prestamos-trujillo` — capta tráfico geo-segmentado. Solo si vas a ofrecer servicio diferenciado por región.

### Medio impacto

- **Reemplazar fotos stock por reales**: testimoniales con clientes reales (con consentimiento + nombre completo + ciudad) levantan trust y CTR.
- **Reemplazar screenshots mockup por de la app real**: cuando esté en producción.
- **Schema `Review` + `AggregateRating`**: si tenés reviews verificadas (Google My Business, Trustpilot, etc.), agregarlas como structured data → estrellas en el SERP.
- **Link building**: conseguir backlinks de medios financieros peruanos (Gestión, Semana Económica, Ojo Público), centros de educación financiera, etc.
- **Listing en Google Business Profile**: si tenés oficina física en Lima, registrarla — aparece en Google Maps + sidebar.

### Bajo impacto / mantenimiento

- **Monitor mensual en GSC**: revisar queries en posición 8-15 (las que están "casi en página 1") y ver si hay quick wins de contenido.
- **Lighthouse audit trimestral**: que Core Web Vitals no se degraden con features nuevas.
- **Refresh del sitemap.lastmod** si cambiás contenido sustancial en una página (ej: subes la TEA en `/tarifas` por nueva regulación).

---

## 7. Troubleshooting

| Síntoma | Causa probable | Fix |
|---|---|---|
| Page no aparece en Google después de 2+ semanas | No fue indexada o tiene noindex por error | GSC → URL Inspection → ver "Coverage" — si dice "Excluded" hay un noindex; si "Discovered - currently not indexed", solicitar indexación manual |
| Preview en Facebook muestra imagen vieja | Cache de FB (hasta 30 días) | Sharing Debugger → "Scrape Again" |
| LinkedIn muestra "No author found" | LinkedIn parsea la página como Article aunque sea website — no se puede arreglar 100% del lado del frontend | Lo cubre el JSON-LD de Organization que ya emitimos. El warning es cosmético. |
| Rich Results Test no detecta FAQPage | El JSON-LD no se está renderizando | Ver page source — debería haber `<script type="application/ld+json">` con `"@type":"FAQPage"`. Si no está, problema de hidratación o el componente FaqSection no se montó. |
| Sitemap muestra fechas viejas (`lastmod`) | El sitemap se genera por request en runtime — pero si Vercel cachea el resultado puede quedar pegado | El sitemap se regenera automáticamente en cada deploy. Si fuerza falta, redeploy manual. |
| Imágenes locales no se sirven | Path mal escrito o archivo no commiteado a `public/` | `ls public/images/` para confirmar; verificar que el path en `<Image src="/images/...">` no tenga typo |

---

**Última actualización:** Fase 5 — cierre del setup técnico SEO.
