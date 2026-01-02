export interface Policy {
    
policyId: string;
  policyName: string;
  policyType: 'Motor' | 'Health';
  policyCategory: string;
  coverageAmount: number;
  premiumAmount: number;
  durationYears: number;
  description: string;
  status: 'Active' | 'Inactive';
  createdDate: string;

}
