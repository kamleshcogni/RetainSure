export type Status = 'ACTIVE' | 'SCHEDULED' | 'COMPLETED';

export interface Campaign {
  campaign_id?: number; // ✅ numeric backend ID
  campaign_code: string;
  campaign_name: string;
  target?: string;
  start_date?: string;
  end_date?: string;
  status: Status;
  discount?: string;

  created_at?: string;
  modified_at?: string;
  segmentSize?: number;
  conversions?: number;
  conversionRate?: number;
  roi?: number;
}