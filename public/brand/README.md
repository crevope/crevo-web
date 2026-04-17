# Crevo brand assets

All variants of the **Forward-Arrow C** logo, ready to embed in
emails, partner sites, presentations, etc.

For in-app rendering use the React component `src/shared/ui/Logo.tsx`
instead — it inherits color via CSS so it adapts to light/dark themes
automatically.

## Mark only (square, 64×64 viewBox)

| File | Color | When to use |
|---|---|---|
| `mark-navy.svg` | `#0A192F` | Default. Light backgrounds. |
| `mark-white.svg` | `#FFFFFF` | Dark backgrounds (navy, slate, black). |
| `mark-gold.svg` | `#D4AF37` | Premium contexts. Pair with light/cream backgrounds. |
| `mark-cyan.svg` | `#00E5FF` | High-contrast tech / event materials. Use sparingly. |

## Wordmark (mark + "revo", 160×64 viewBox)

The mark IS the "C" of "Crevo" — no double-C redundancy.

**Proportion intent:** the mark visually dominates (visible height 40 vs
"revo" cap-height ~31, ratio ~1.3:1). The arrow tip sits exactly where
the "r" begins — they read as a single word, not "icon + label".

| File | Mark color | "revo" color | When to use |
|---|---|---|---|
| `wordmark-navy.svg` | navy | navy | Default. Light backgrounds. |
| `wordmark-white.svg` | white | white | Dark backgrounds. |
| `wordmark-gold.svg` | gold | gold | Premium / luxury feel. |
| `wordmark-duo-gold.svg` | navy | gold | **Primary duo-tone.** Premium credit + speed. |
| `wordmark-duo-cyan.svg` | navy | cyan | Tech/digital emphasis. |
| `wordmark-on-dark.svg` | white | gold | For dark navy backgrounds (sidebars, hero panels). |

## Construction reference

ViewBox 64×64 for the mark:

- Implicit circle centered at (24, 32), outer radius 20, inner radius 10
- Opening at angle ±53.13° (cos = 3/5, sin = 4/5 → integer coordinates)
- Arrow tip at (60, 32) — pure horizontal forward vector
- Single filled path:
  ```
  M 36 16 A 20 20 0 1 0 36 48 L 60 32 L 30 40 A 10 10 0 1 1 30 24 Z
  ```

Wordmark: mark at (0, 0)–(64, 64), "revo" text at x=60 with font-size 44
(cap-height ≈ 31 — smaller than the mark's visible height of 40 so the
mark visually dominates). Baseline at y=52 matches the mark's bottom.

Typography: Plus Jakarta Sans Bold, letter-spacing -0.025em.
