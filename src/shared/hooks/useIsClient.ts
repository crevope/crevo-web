'use client'
import { useSyncExternalStore } from 'react'

/**
 * Returns `false` on the server and during the first client render, then
 * `true` once the component has hydrated.
 *
 * Use this whenever you need to gate UI on something that only exists in
 * the browser (`window`, `localStorage`, `next-themes` resolved theme,
 * Zustand stores rehydrating from `localStorage`, auth state, etc.).
 *
 * Why `useSyncExternalStore` instead of the classic
 * `useEffect(() => setMounted(true), [])` mounted-guard pattern:
 *
 *   - The classic pattern triggers React 19's `react-hooks/set-state-in-effect`
 *     compiler warning on every component that uses it. The Compiler can't
 *     prove the setState is idempotent so it has to bail out of memoization.
 *   - `useSyncExternalStore` is the React-blessed primitive for "subscribe
 *     to a value that differs between server and client" — the third
 *     argument (`getServerSnapshot`) explicitly returns the SSR value.
 *     React Compiler understands the contract and doesn't warn.
 *   - The `subscribe` callback returns a no-op unsubscribe because the
 *     value never changes after the first client render — we don't need
 *     to react to anything, we just need a stable hook that gives the
 *     correct server vs. client answer.
 *
 * Hydration-safety: the server renders with `false`, the first client
 * render also returns `false` (the snapshots match), and React then
 * updates to `true` on the next tick — same hydration contract as the
 * classic pattern, just without the Compiler bail-out.
 */
export function useIsClient(): boolean {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  )
}
