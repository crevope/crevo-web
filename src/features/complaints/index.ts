// Public API for the complaints feature.

// UI
export { FileComplaintForm } from './ui/FileComplaintForm'
export { ComplaintFiledReceiptCard } from './ui/ComplaintFiledReceipt'
export { ConsultComplaintForm } from './ui/ConsultComplaintForm'
export { ComplaintDetailCard } from './ui/ComplaintDetailCard'

// API / types
export { complaintsRepository } from './api/complaintsRepository'
export type {
  FileComplaintDTO,
  FiledComplaintReceipt,
  PublicComplaintView,
  ComplaintView,
} from './api/complaintsRepository'

// Constants / labels
export {
  CLAIM_TYPES,
  CLAIM_TYPE_LABELS,
  CLAIM_TYPE_DESCRIPTIONS,
  COMPLAINT_STATUS,
  COMPLAINT_STATUS_LABELS,
  CONSUMER_DOCUMENT_TYPES,
  DOCUMENT_TYPE_LABELS,
  PRODUCT_TYPES,
  PRODUCT_TYPE_LABELS,
} from './lib/complaintsConstants'
export type {
  ClaimType,
  ComplaintSource,
  ComplaintStatus,
  ConsumerDocumentType,
  ProductType,
} from './lib/complaintsConstants'

// Schemas
export { fileComplaintSchema, consultComplaintSchema } from './lib/complaintsSchemas'
export type { FileComplaintInput, ConsultComplaintInput } from './lib/complaintsSchemas'
