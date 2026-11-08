/**
 * Shared style tokens for the auth feature's plain (non-RHF) form inputs.
 *
 * Extracted out of `LoginForm.tsx` so it can be imported by sibling
 * components (`TwoFactorChallenge`, `TwoFactorSetup`) without pulling in the
 * whole `LoginForm` module — importing a component file just for a string
 * constant created a circular import (LoginForm -> TwoFactorChallenge ->
 * LoginForm) that would have become a 3-way cycle once TwoFactorSetup also
 * needed it. This module has no component/React dependency, so it can't be
 * part of any cycle.
 */
export const inputCls =
  'w-full px-5 py-3 rounded-lg border border-gray-200 dark:border-[#334155] bg-white dark:bg-[#0F172A] text-[#0A192F] dark:text-[#F1F5F9] text-[0.95rem] placeholder-gray-400 dark:placeholder-[#64748B] focus:outline-none focus:border-[#0A192F] dark:focus:border-[#D4AF37] focus:ring-[3px] focus:ring-[#0A192F]/10 dark:focus:ring-[#D4AF37]/15 transition-all'
