
// src/app/shared/campaigns/campaign.model.ts
export type Status = 'ACTIVE' | 'SCHEDULED' | 'COMPLETED';

export interface Campaign {
  // Module fields (as requested)
  campaign_id: string;
  campaign_name: string;
  target: string;           // e.g., 'High Risk, High Value'
  discount: string;         // e.g., '10% Discount on Renewal'
  start_date?: string;      // ISO string
  end_date?: string;        // ISO string
  status: Status;
  created_at: string;       // ISO
  modified_at: string;      // ISO

  // Optional extras (keep if you still want Overview metrics & prior table values)
  segmentSize?: number;
  conversions?: number;
  conversionRate?: number;
  roi?: number;
}
