export interface Policy {
  policyId?: number;
 
  policyName: string;
  policyNumber: string;
 
  category: 'HEALTH' | 'MOTOR';
 
  coverage: string;
  premium: number;
 
  status: 'ACTIVE' | 'EXPIRED';
 
  startDate: string;
  endDate: string;
  renewalDate: string;
 
  notes?: string;
}