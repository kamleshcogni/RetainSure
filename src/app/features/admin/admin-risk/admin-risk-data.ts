import { Injectable } from '@angular/core';
export type PolicyType = 'Motor' | 'Health';
export type RiskLevel = 'High' | 'Medium' | 'Low';
export type RenewalStatus = 'Pending' | 'Renewed' | 'Expired';
 
export interface RiskRecord {
  customerId: string;
  customerName: string;
  policyId: string;
  policyType: PolicyType;
  riskScore: number;            // 0–100
  riskLevel: RiskLevel;
  renewalProbability: number;   // percentage
  renewalDate: string;          // ISO date
  renewalStatus: RenewalStatus;
  flagged: boolean;             // follow-up flag
}
@Injectable({
  providedIn: 'root',
})
export class AdminRiskData {
  private risks: RiskRecord[] = [
    {
      customerId: 'CUST-2001',
      customerName: 'Anita Sharma',
      policyId: 'POL-70011',
      policyType: 'Motor',
      riskScore: 82,
      riskLevel: 'High',
      renewalProbability: 38,
      renewalDate: '2026-01-09',
      renewalStatus: 'Pending',
      flagged: true
    },
    
    {
      customerId: 'CUST-2002',
      customerName: 'Rahul Verma',
      policyId: 'POL-70012',
      policyType: 'Health',
      riskScore: 66,
      riskLevel: 'Medium',
      renewalProbability: 58,
      renewalDate: '2026-01-12',
      renewalStatus: 'Pending',
      flagged: false
    },
    {
      customerId: 'CUST-2003',
      customerName: 'Neha Gupta',
      policyId: 'POL-70013',
      policyType: 'Motor',
      riskScore: 91,
      riskLevel: 'High',
      renewalProbability: 24,
      renewalDate: '2026-01-06',
      renewalStatus: 'Pending',
      flagged: false
    },
    {
      customerId: 'CUST-2004',
      customerName: 'Suresh Patil',
      policyId: 'POL-70014',
      policyType: 'Health',
      riskScore: 47,
      riskLevel: 'Low',
      renewalProbability: 72,
      renewalDate: '2026-02-01',
      renewalStatus: 'Renewed',
      flagged: false
    },
    {
      customerId: 'CUST-2005',
      customerName: 'Priya Iyer',
      policyId: 'POL-70015',
      policyType: 'Motor',
      riskScore: 70,
      riskLevel: 'Medium',
      renewalProbability: 55,
      renewalDate: '2026-01-20',
      renewalStatus: 'Pending',
      flagged: true
    },
    {
      customerId: 'CUST-2006',
      customerName: 'Arjun Mehta',
      policyId: 'POL-70016',
      policyType: 'Health',
      riskScore: 35,
      riskLevel: 'Low',
      renewalProbability: 80,
      renewalDate: '2026-03-03',
      renewalStatus: 'Renewed',
      flagged: false
    },
    {
      customerId: 'CUST-2007',
      customerName: 'Meera Nair',
      policyId: 'POL-70017',
      policyType: 'Motor',
      riskScore: 88,
      riskLevel: 'High',
      renewalProbability: 32,
      renewalDate: '2026-01-07',
      renewalStatus: 'Pending',
      flagged: false
    },
    {
      customerId: 'CUST-2008',
      customerName: 'Vikram Singh',
      policyId: 'POL-70018',
      policyType: 'Health',
      riskScore: 62,
      riskLevel: 'Medium',
      renewalProbability: 60,
      renewalDate: '2026-02-15',
      renewalStatus: 'Pending',
      flagged: false
    },
    {
      customerId: 'CUST-2009',
      customerName: 'Kavita Rao',
      policyId: 'POL-70019',
      policyType: 'Motor',
      riskScore: 29,
      riskLevel: 'Low',
      renewalProbability: 85,
      renewalDate: '2026-04-10',
      renewalStatus: 'Renewed',
      flagged: false
    },
    {
      customerId: 'CUST-2010',
      customerName: 'Rohan Kulkarni',
      policyId: 'POL-70020',
      policyType: 'Health',
      riskScore: 76,
      riskLevel: 'Medium',
      renewalProbability: 50,
      renewalDate: '2026-01-25',
      renewalStatus: 'Pending',
      flagged: false
    },
    {
      customerId: 'CUST-2011',
      customerName: 'Divya Menon',
      policyId: 'POL-70021',
      policyType: 'Motor',
      riskScore: 95,
      riskLevel: 'High',
      renewalProbability: 20,
      renewalDate: '2026-01-05',
      renewalStatus: 'Expired',
      flagged: true
    },
    {
      customerId: 'CUST-2012',
      customerName: 'Sanjay Kumar',
      policyId: 'POL-70022',
      policyType: 'Health',
      riskScore: 40,
      riskLevel: 'Low',
      renewalProbability: 78,
      renewalDate: '2026-02-22',
      renewalStatus: 'Pending',
      flagged: false
    },
    {
      customerId: 'CUST-2003',
      customerName: 'Logesh',
      policyId: 'POL-70013',
      policyType: 'Motor',
      riskScore: 52,
      riskLevel: 'Low',
      renewalProbability: 36,
      renewalDate: '2026-04-09',
      renewalStatus: 'Pending',
      flagged: true
    }
  ];
 
  // ========= Public API =========
  getAllRisks(): RiskRecord[] {
    // Return a shallow copy to avoid external mutation
    return [...this.risks];
  }
 
  toggleFlag(customerId: string): void {
    const idx = this.risks.findIndex(r => r.customerId === customerId);
    if (idx !== -1) {
      this.risks[idx].flagged = !this.risks[idx].flagged;
    }
  }
 
  filterByRiskLevel(level: RiskLevel): RiskRecord[] {
    return this.risks.filter(r => r.riskLevel === level);
  }
  
}
