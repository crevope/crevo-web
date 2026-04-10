'use client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Loader2, ArrowRight } from 'lucide-react'
import { useEffect, useState, useCallback } from 'react'
import { useLoanStore } from '../model/useLoanStore'
import { loanRepository, type SimulationResult } from '../api/loanRepository'
import { bankAccountRepository, type BankAccount } from '../api/bankAccountRepository'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/shared/ui/form'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/shared/ui/dialog'
import { InfoTooltip } from '@/shared/ui/info-tooltip'
import { formatCurrency } from '@/shared/lib/utils'

interface Props {
  open: boolean
  onClose: () => void
}

const PRODUCT_OPTIONS = [
  { value: 'EXPRESS', label: 'Express', sublabel: '1 cuota' },
  { value: 'FLEX', label: 'Flex', sublabel: '2 cuotas' },
]

const TOOLTIPS = {
  techFee: 'Cubre los costos de la plataforma digital, verificación de identidad y procesamiento de tu solicitud.',
  disbursementFee: 'Cubre la transferencia del dinero a tu cuenta. Se descuenta del monto que recibes.',
  maintenanceFee: 'Cubre la administración de tu cuenta durante la vigencia del préstamo. Se cobra por cada cuota.',
  igv: 'Impuesto General a las Ventas (18%) aplicado sobre las comisiones. Los intereses están exonerados de IGV según Ley N° 28194.',
  tcea: 'Tasa de Costo Efectivo Anual. Refleja el costo total del préstamo incluyendo intereses y comisiones.',
}

const requestLoanSchema = z.object({
  amount: z
    .number({ invalid_type_error: 'Ingresa un monto válido' })
    .min(200, 'El monto mínimo es S/ 200')
    .max(2000, 'El monto máximo es S/ 2,000'),
  productType: z.enum(['EXPRESS', 'FLEX']),
})
type RequestLoanInput = z.infer<typeof requestLoanSchema>

export function RequestLoanModal({ open, onClose }: Props) {
  const { requestLoan } = useLoanStore()
  const [simulation, setSimulation] = useState<SimulationResult | null>(null)
  const [simLoading, setSimLoading] = useState(false)
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([])
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null)

  const form = useForm<RequestLoanInput>({
    resolver: zodResolver(requestLoanSchema),
    defaultValues: { amount: 500, productType: 'EXPRESS' },
  })

  const amount = form.watch('amount')
  const productType = form.watch('productType')

  const runSimulation = useCallback(async (amt: number, prod: string) => {
    if (!amt || amt < 200 || amt > 2000) { setSimulation(null); return }
    setSimLoading(true)
    try {
      const result = await loanRepository.simulate({
        amount: amt,
        productType: prod,
        paymentFrequency: 'MENSUAL',
        numInstallments: prod === 'FLEX' ? 2 : 1,
      })
      setSimulation(result)
    } catch {
      setSimulation(null)
    } finally {
      setSimLoading(false)
    }
  }, [])

  useEffect(() => {
    const timeout = setTimeout(() => {
      runSimulation(amount, productType)
    }, 400)
    return () => clearTimeout(timeout)
  }, [amount, productType, runSimulation])

  useEffect(() => {
    if (!open) return
    bankAccountRepository.getMyAccounts()
      .then(result => {
        setBankAccounts(result.accounts)
        const defaultAccount = result.accounts.find(a => a.isDefault)
        setSelectedAccountId(defaultAccount?.id ?? result.accounts[0]?.id ?? null)
      })
      .catch(() => setBankAccounts([]))
  }, [open])

  const onSubmit = async (values: RequestLoanInput) => {
    try {
      await requestLoan({
        amount: values.amount,
        productType: values.productType,
        paymentFrequency: 'MENSUAL',
        numInstallments: values.productType === 'FLEX' ? 2 : 1,
        bankAccountId: selectedAccountId ?? undefined,
      })
      toast.success('¡Solicitud enviada! Te notificaremos cuando sea aprobada.')
      form.reset()
      onClose()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Error al solicitar préstamo')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Solicitar préstamo</DialogTitle>
          <DialogDescription>
            De S/ 200 a S/ 2,000. Aprobación en minutos.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

            {/* Monto */}
            <FormField control={form.control} name="amount" render={({ field }) => (
              <FormItem>
                <FormLabel>Monto (S/)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="500"
                    {...field}
                    onChange={e => field.onChange(e.target.valueAsNumber)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            {/* Producto */}
            <FormField control={form.control} name="productType" render={({ field }) => (
              <FormItem>
                <FormLabel>Modalidad de pago</FormLabel>
                <FormControl>
                  <div className="flex gap-2">
                    {PRODUCT_OPTIONS.map(opt => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => field.onChange(opt.value)}
                        className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-colors text-left
                          ${field.value === opt.value
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-input bg-background hover:bg-accent text-foreground'
                          }`}
                      >
                        <span className="block font-semibold">{opt.label}</span>
                        <span className="block text-xs opacity-70">{opt.sublabel}</span>
                      </button>
                    ))}
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            {/* Desglose de costos */}
            <div className="rounded-xl border border-border/60 bg-card overflow-hidden">
              <div className="px-4 py-2.5 border-b border-border/40 bg-muted/30">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Desglose de costos
                </p>
              </div>

              {simLoading ? (
                <div className="flex items-center justify-center gap-2 py-6 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Calculando...
                </div>
              ) : simulation ? (
                <div className="px-4 py-3 space-y-2.5 text-sm">

                  {/* Monto solicitado */}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Monto solicitado</span>
                    <span className="font-medium">{formatCurrency(simulation.amount)}</span>
                  </div>

                  {/* Interés */}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Interés (TEA {simulation.teaPercent}%)
                    </span>
                    <span>{formatCurrency(simulation.totalInterest)}</span>
                  </div>

                  {/* Com. mantenimiento */}
                  <div className="flex justify-between">
                    <span className="flex items-center gap-1.5 text-muted-foreground">
                      Com. mantenimiento
                      <InfoTooltip text={TOOLTIPS.maintenanceFee} />
                    </span>
                    <span>
                      {formatCurrency(simulation.maintenanceFeeTotal)}
                      {simulation.numInstallments > 1 && (
                        <span className="text-xs text-muted-foreground ml-1">
                          ({formatCurrency(simulation.maintenanceFee)} × {simulation.numInstallments})
                        </span>
                      )}
                    </span>
                  </div>

                  {/* Total a pagar = suma exacta de cuotas */}
                  <div className="flex justify-between font-semibold border-t border-border/40 pt-2.5">
                    <span>Total a devolver</span>
                    <span className="text-primary">{formatCurrency(simulation.totalAmount)}</span>
                  </div>

                  {/* Cuota */}
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{simulation.numInstallments === 1 ? 'Cuota única' : `${simulation.numInstallments} cuotas de`}</span>
                    <span>{formatCurrency(simulation.installmentAmount)}</span>
                  </div>

                  {/* Com. desembolso → reduce monto recibido */}
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      Com. desembolso
                      <InfoTooltip text={TOOLTIPS.disbursementFee} />
                    </span>
                    <span className="text-amber-500">− {formatCurrency(simulation.disbursementFee)}</span>
                  </div>

                  {/* Monto que recibes */}
                  <div className="flex items-center justify-between rounded-lg bg-primary/5 border border-primary/20 px-3 py-2">
                    <span className="text-xs font-medium flex items-center gap-1">
                      <ArrowRight className="h-3 w-3 text-primary" />
                      Recibes en tu cuenta
                    </span>
                    <span className="text-sm font-bold text-primary">
                      {formatCurrency(simulation.netDisbursed)}
                    </span>
                  </div>

                  {/* Costos del crédito */}
                  <div className="rounded-lg bg-muted/30 px-2.5 py-2 space-y-1 text-xs text-muted-foreground">
                    <p className="font-semibold text-[10px] uppercase tracking-wide text-foreground/50 mb-1">Comisiones distribuidas en cuotas</p>
                    <div className="flex justify-between">
                      <span className="flex items-center gap-1">Com. tecnología <InfoTooltip text={TOOLTIPS.techFee} /></span>
                      <span>{formatCurrency(simulation.techFee)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="flex items-center gap-1">IGV (18%) <InfoTooltip text={TOOLTIPS.igv} /></span>
                      <span>{formatCurrency(simulation.igvAmount)}</span>
                    </div>
                    <div className="flex justify-between border-t border-border/30 pt-1 font-medium text-foreground/70">
                      <span className="flex items-center gap-1">TCEA <InfoTooltip text={TOOLTIPS.tcea} /></span>
                      <span>{simulation.tceaPercent}% anual</span>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="px-4 py-6 text-center text-xs text-muted-foreground">
                  Ingresa un monto para ver el desglose
                </p>
              )}
            </div>

            {/* Selección de cuenta bancaria */}
            {bankAccounts.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-foreground">¿A qué cuenta quieres recibir el préstamo?</p>
                <div className="space-y-2">
                  {bankAccounts.map(account => (
                    <button
                      key={account.id}
                      type="button"
                      onClick={() => setSelectedAccountId(account.id)}
                      className={`w-full flex items-center justify-between rounded-lg border px-3 py-2.5 text-sm text-left transition-colors
                        ${selectedAccountId === account.id
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-input bg-background hover:bg-accent text-foreground'
                        }`}
                    >
                      <div>
                        <span className="font-semibold block">{account.bankName}</span>
                        <span className="text-xs opacity-70">
                          ****{account.cci.slice(-4)}
                          {account.alias ? ` · ${account.alias}` : ''}
                        </span>
                      </div>
                      {account.isDefault && (
                        <span className="text-[10px] font-semibold uppercase tracking-wide opacity-60">Predeterminada</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <Button type="submit" className="w-full" disabled={form.formState.isSubmitting || !simulation}>
              {form.formState.isSubmitting
                ? <><Loader2 className="h-4 w-4 animate-spin" /> Enviando solicitud...</>
                : 'Solicitar préstamo'}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
