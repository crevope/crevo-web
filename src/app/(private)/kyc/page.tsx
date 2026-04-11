'use client'
import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import { Loader2, RefreshCw } from 'lucide-react'
import { kycRepository, type KycStatus } from '@/features/upload-kyc'

const cardCls = 'bg-white dark:bg-[#1E293B] border border-gray-100 dark:border-white/6 rounded-lg'

const DOC_FIELDS = [
  { key: 'dniFront' as const, label: 'DNI – Anverso (parte delantera)', hint: 'Sube la parte frontal de tu DNI', icon: 'fa-solid fa-id-card' },
  { key: 'dniBack' as const, label: 'DNI – Reverso (parte trasera)', hint: 'Sube la parte trasera de tu DNI', icon: 'fa-solid fa-id-card-clip' },
  { key: 'selfie' as const, label: 'Selfie sosteniendo el DNI', hint: 'Tómate una foto con tu DNI visible', icon: 'fa-solid fa-camera' },
]

function KycVerified() {
  return (
    <div className={`${cardCls} p-10 text-center`}>
      <div className="w-24 h-24 rounded-full bg-green-50 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-6">
        <i className="fa-solid fa-shield-halved text-4xl text-green-500" />
      </div>
      <h2 className="text-2xl font-semibold text-[#0A192F] dark:text-white mb-3 tracking-tight">¡Identidad Verificada!</h2>
      <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
        Tu cuenta está completamente verificada. Ya puedes solicitar préstamos de hasta S/ 2,000.
      </p>
      <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
        <a
          href="/request-loan"
          className="bg-[#D4AF37] text-[#0A192F] font-semibold px-8 py-3 rounded-lg hover:bg-[#B8941F] transition-colors flex items-center justify-center gap-2"
        >
          <i className="fa-solid fa-hand-holding-dollar" />
          Solicitar préstamo
        </a>
        <a
          href="/dashboard"
          className="bg-white dark:bg-[#0F172A] text-[#0A192F] dark:text-gray-200 font-medium px-8 py-3 rounded-lg border border-gray-100 dark:border-white/6 hover:bg-gray-50 dark:hover:bg-[#334155] transition-colors flex items-center justify-center gap-2"
        >
          <i className="fa-solid fa-house" />
          Ir al dashboard
        </a>
      </div>
    </div>
  )
}

function KycUnderReview({ onRefresh }: { onRefresh: () => void }) {
  return (
    <div className={`${cardCls} p-8 text-center`}>
      <div className="w-20 h-20 rounded-full bg-yellow-50 dark:bg-yellow-900/30 flex items-center justify-center mx-auto mb-5">
        <i className="fa-solid fa-clock text-3xl text-yellow-500" />
      </div>
      <h2 className="text-xl font-semibold text-[#0A192F] dark:text-white mb-2 tracking-tight">Verificando tu identidad</h2>
      <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
        Hemos recibido tus documentos. La verificación suele tardar entre 1 y 5 minutos.
        Te notificaremos cuando esté lista.
      </p>
      <div className="max-w-xs mx-auto text-left space-y-3 mb-6">
        {[
          { done: true, label: 'Documentos subidos correctamente' },
          { done: false, label: 'Verificando DNI contra RENIEC' },
          { done: false, label: 'Validando reconocimiento facial' },
        ].map(step => (
          <div key={step.label} className="flex items-center gap-3">
            {step.done
              ? <div className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-500 shrink-0"><i className="fa-solid fa-check text-xs" /></div>
              : <div className="w-6 h-6 rounded-full bg-gray-100 dark:bg-[#334155] flex items-center justify-center shrink-0"><Loader2 className="h-3 w-3 animate-spin text-gray-400" /></div>
            }
            <span className={`text-sm ${step.done ? 'text-gray-800 dark:text-gray-200' : 'text-gray-500 dark:text-gray-400'}`}>
              {step.label}
            </span>
          </div>
        ))}
      </div>
      <button
        onClick={onRefresh}
        className="flex items-center gap-2 mx-auto px-5 py-2.5 rounded-lg border border-gray-100 dark:border-white/6 text-gray-700 dark:text-gray-300 font-medium text-sm hover:bg-gray-50 dark:hover:bg-[#0F172A] transition-colors"
      >
        <RefreshCw className="h-4 w-4" />
        Verificar estado
      </button>
    </div>
  )
}

function KycRejected({ onRetry }: { onRetry: () => void }) {
  return (
    <div className={`${cardCls} p-8 text-center border-l-2 border-l-red-400`}>
      <div className="w-20 h-20 rounded-full bg-red-50 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-5">
        <i className="fa-solid fa-circle-xmark text-3xl text-red-500" />
      </div>
      <h2 className="text-xl font-semibold text-[#0A192F] dark:text-white mb-2 tracking-tight">Verificación no aprobada</h2>
      <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
        No pudimos verificar tu identidad. Asegúrate de que las fotos sean nítidas y vuelve a intentarlo.
      </p>
      <div className="max-w-xs mx-auto text-left mb-6 p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50">
        <p className="text-sm font-semibold text-red-700 dark:text-red-400 mb-2">Consejos para el reintento:</p>
        <ul className="space-y-1.5 text-xs text-red-600 dark:text-red-400">
          <li><i className="fa-solid fa-circle mr-1 text-[4px] relative -top-1" />Foto del DNI en ambiente bien iluminado, sin reflejos</li>
          <li><i className="fa-solid fa-circle mr-1 text-[4px] relative -top-1" />Toda la información debe ser legible</li>
          <li><i className="fa-solid fa-circle mr-1 text-[4px] relative -top-1" />En la selfie, sostén el DNI de forma visible</li>
        </ul>
      </div>
      <button
        onClick={onRetry}
        className="w-full max-w-xs mx-auto bg-[#0A192F] dark:bg-[#D4AF37] text-white dark:text-[#0A192F] font-semibold py-3 rounded-lg flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
      >
        <RefreshCw className="h-4 w-4" />
        Volver a intentar
      </button>
    </div>
  )
}

export default function KycPage() {
  const [kycStatus, setKycStatus] = useState<KycStatus | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [files, setFiles] = useState<{ dniFront?: File; dniBack?: File; selfie?: File }>({})
  const refs = {
    dniFront: useRef<HTMLInputElement>(null),
    dniBack: useRef<HTMLInputElement>(null),
    selfie: useRef<HTMLInputElement>(null),
  }

  const loadStatus = () => {
    kycRepository.getStatus()
      .then(setKycStatus)
      .catch(() => setKycStatus({ status: 'PENDING_VERIFICATION', isIdentityVerified: false }))
  }

  useEffect(() => { loadStatus() }, [])

  const handleUpload = async () => {
    if (!files.dniFront || !files.dniBack || !files.selfie) {
      toast.error('Debes subir los tres documentos')
      return
    }
    setIsUploading(true)
    try {
      const result = await kycRepository.upload({ dniFront: files.dniFront, dniBack: files.dniBack, selfie: files.selfie })
      setKycStatus(result)
      setShowForm(false)
      if (result.isIdentityVerified) {
        toast.success('¡Identidad verificada correctamente!')
      } else {
        toast.success('Documentos recibidos. Verificando en instantes...')
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Error al subir documentos')
    } finally {
      setIsUploading(false)
    }
  }

  const allSelected = !!files.dniFront && !!files.dniBack && !!files.selfie

  const showUploadForm =
    !kycStatus ||
    kycStatus.status === 'PENDING_VERIFICATION' ||
    showForm

  if (!kycStatus) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-10 w-10 animate-spin text-[#0A192F] dark:text-[#D4AF37]" />
      </div>
    )
  }

  return (
    <div className="space-y-8 max-w-2xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-[#0A192F] dark:text-white mb-1 tracking-tight">Verificación de Identidad</h1>
        <p className="text-gray-500 dark:text-gray-400">Requerida para solicitar préstamos en Solvo</p>
      </div>

      {/* Progress indicator */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { step: 1, label: 'Sube documentos', done: !showUploadForm || kycStatus.status !== 'PENDING_VERIFICATION', active: showUploadForm },
          { step: 2, label: 'En revisión', done: kycStatus.isIdentityVerified, active: kycStatus.status === 'KYC_UNDER_REVIEW' },
          { step: 3, label: 'Verificado', done: kycStatus.isIdentityVerified, active: false },
        ].map(s => (
          <div key={s.step} className={`p-4 rounded-lg text-center border transition-colors ${s.done
            ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800/50'
            : s.active
              ? 'bg-[#D4AF37]/10 dark:bg-[#D4AF37]/10 border-[#D4AF37]/30'
              : 'bg-gray-50 dark:bg-[#0F172A] border-gray-100 dark:border-white/6'
            }`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-2 text-sm font-bold ${s.done ? 'bg-green-500 text-white' : s.active ? 'bg-[#D4AF37] text-[#0A192F]' : 'bg-gray-200 dark:bg-[#334155] text-gray-500 dark:text-gray-400'
              }`}>
              {s.done ? <i className="fa-solid fa-check text-xs" /> : s.step}
            </div>
            <p className={`text-xs font-medium ${s.done ? 'text-green-700 dark:text-green-400' : s.active ? 'text-[#0A192F] dark:text-[#D4AF37]' : 'text-gray-500 dark:text-gray-400'}`}>
              {s.label}
            </p>
          </div>
        ))}
      </div>

      {/* Status views */}
      {kycStatus.isIdentityVerified && <KycVerified />}
      {!kycStatus.isIdentityVerified && kycStatus.status === 'KYC_UNDER_REVIEW' && (
        <KycUnderReview onRefresh={loadStatus} />
      )}
      {!kycStatus.isIdentityVerified && kycStatus.status === 'KYC_REJECTED' && !showForm && (
        <KycRejected onRetry={() => { setFiles({}); setShowForm(true) }} />
      )}

      {/* Upload form */}
      {showUploadForm && (
        <div className={cardCls}>
          <div className="p-6 border-b border-gray-100 dark:border-white/6">
            <h2 className="text-lg font-semibold text-[#0A192F] dark:text-white">Documentos Requeridos</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              DNI (anverso y reverso) + selfie sosteniéndolo · JPG o PNG · Máx. 5 MB
            </p>
          </div>

          <div className="p-6 space-y-4">
            {DOC_FIELDS.map(({ key, label, hint, icon }) => (
              <div key={key}>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{label}</p>
                <div
                  className={`flex items-center gap-4 rounded-lg border-2 border-dashed p-4 cursor-pointer transition-all
                    ${files[key]
                      ? 'border-green-400 bg-green-50 dark:bg-green-900/20'
                      : 'border-gray-100 dark:border-white/6 hover:border-[#00E5FF] hover:bg-[#00E5FF]/5'
                    }`}
                  onClick={() => refs[key].current?.click()}
                >
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center shrink-0 ${files[key] ? 'bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400' : 'bg-gray-100 dark:bg-[#0F172A] text-gray-400 dark:text-gray-500'
                    }`}>
                    <i className={`${files[key] ? 'fa-solid fa-circle-check' : icon} text-xl`} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className={`text-sm font-medium truncate ${files[key] ? 'text-green-700 dark:text-green-400' : 'text-gray-600 dark:text-gray-400'}`}>
                      {files[key] ? files[key]!.name : hint}
                    </p>
                    {files[key] ? (
                      <p className="text-xs text-gray-400 dark:text-gray-500">
                        {(files[key]!.size / 1024).toFixed(0)} KB · Listo para subir
                      </p>
                    ) : (
                      <p className="text-xs text-gray-400 dark:text-gray-500">Toca para seleccionar</p>
                    )}
                  </div>
                  {!files[key] && (
                    <i className="fa-solid fa-upload text-gray-300 dark:text-gray-600 text-lg shrink-0" />
                  )}
                </div>
                <input
                  ref={refs[key]}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png"
                  className="hidden"
                  onChange={e => setFiles(prev => ({ ...prev, [key]: e.target.files?.[0] }))}
                />
              </div>
            ))}

            <div className="mt-2">
              <button
                onClick={handleUpload}
                disabled={isUploading || !allSelected}
                className="w-full bg-[#0A192F] dark:bg-[#D4AF37] text-white dark:text-[#0A192F] font-semibold py-4 rounded-lg flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUploading
                  ? <><Loader2 className="h-5 w-5 animate-spin" />Enviando documentos...</>
                  : <><i className="fa-solid fa-cloud-arrow-up" />Enviar documentos</>}
              </button>
            </div>

            <p className="text-center text-xs text-gray-400 dark:text-gray-500">
              <i className="fa-solid fa-lock mr-1" />
              Tus datos se transmiten de forma segura conforme a la Ley N° 29733
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
