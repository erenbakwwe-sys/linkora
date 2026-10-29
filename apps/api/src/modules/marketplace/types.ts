export interface Buyer {
  id: string;
  tenantId: string;
  name: string;
  companyIdentifier: string;
  pingEndpoint?: string;
  postEndpoint?: string;
  signingSecret: string;
  pingEnabled: boolean;
  dailyCap: number;
  monthlyCap: number;
  deliveredToday: number;
  deliveredThisMonth: number;
  returnWindowDays: number;
  maxReturnRatePercent: number;
  totalDelivered: number;
  totalReturned: number;
  isActive: boolean;
}

export interface BuyerCriteria {
  id: string;
  buyerId: string;
  projectId: string;
  projectName: string;
  regions: string[]; // postal code prefixes, e.g. ["80", "81", "82"] or ["*"]
  minScore: number;
  maxScore: number;
  exclusivityRequired: 'EXCLUSIVE' | 'SEMI_EXCLUSIVE' | 'NON_EXCLUSIVE';
  priorityWeight: number; // 1 - 100
  isActive: boolean;
}

export interface AnonymousPingPayload {
  pingId: string;
  projectType: string;
  postalCodePrefix: string;
  region: string;
  scoreBand: 'A' | 'B' | 'C' | 'D';
  score0100: number;
  hasConsentProof: boolean;
  isHomeowner: boolean;
  electricityBillRange: string;
}

export interface PingResponse {
  buyerId: string;
  accepted: boolean;
  bidAmount?: number;
  rejectionReason?: string;
  latencyMs: number;
}

export interface FullPostPayload {
  postId: string;
  leadId: string;
  firstName: string;
  lastName: string;
  phoneE164: string;
  email: string;
  street: string;
  city: string;
  postalCode: string;
  projectType: string;
  answers: Record<string, any>;
  consentProof: {
    optInTimestamp: string;
    consentTextVersion: string;
    source: string;
  };
}

export interface PricingQuote {
  quoteId: string;
  projectId: string;
  scoreBand: 'A' | 'B' | 'C' | 'D';
  basePrice: number;
  productMultiplier: number;
  buyerOverridePrice?: number;
  finalPrice: number;
  currency: string;
  calculatedAt: string;
}

export interface LeadSaleRecord {
  id: string;
  tenantId: string;
  leadId: string;
  buyerId: string;
  buyerName: string;
  salePrice: number;
  currency: string;
  exclusivity: string;
  status: 'COMPLETED' | 'CANCELLED' | 'RETURNED';
  soldAt: string;
  returnStatus: 'NONE' | 'REQUESTED' | 'APPROVED' | 'REJECTED';
  returnWindowExpiresAt: string;
}

export interface ReturnRequest {
  id: string;
  tenantId: string;
  leadSaleId: string;
  buyerId: string;
  reasonCode: 'INVALID_NUMBER' | 'MOVED_OUT' | 'NOT_HOMEOWNER' | 'COMPETITOR_SIGNED' | 'NO_INTEREST';
  reasonDetail?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  refundAmount: number;
  createdAt: string;
}

export interface CreditNoteRecord {
  id: string;
  tenantId: string;
  buyerId: string;
  returnId: string;
  creditNoteNumber: string;
  amount: number;
  currency: string;
  issuedAt: string;
}

export interface WebhookDeliveryLog {
  id: string;
  buyerId: string;
  endpoint: string;
  eventType: string;
  payload: any;
  signature: string;
  timestamp: string;
  statusCode: number;
  status: 'DELIVERED' | 'FAILED' | 'RETRYING' | 'DLQ';
  attempts: number;
  lastAttemptAt: string;
}
