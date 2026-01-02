import { Injectable } from '@angular/core';


export interface PolicySummary {
  totalPolicies: number;
  motorPolicies: number;
  healthPolicies: number;
  expiringSoonPolicies: number;
}

export interface HighRiskCustomer {
  customerId: string;
  customerName: string;
  policyId: string;
  policyType: 'Motor' | 'Health';
  renewalProbability: number; // percentage 0-100
  riskLevel: 'High';
  expiryDate: string; // ISO date string e.g., '2026-01-10'
}

export interface AlertsSummary {
  expiringIn7DaysCount: number;
  highRiskPendingContactCount: number;
  failedRemindersCount: number;
}

@Injectable({
  providedIn: 'root',
})
export class AdminService {
  // ===== Dummy Static Data =====
  private policySummary: PolicySummary = {
    totalPolicies: 12450,
    motorPolicies: 6800,
    healthPolicies: 5650,
    expiringSoonPolicies: 340
  };

  private alertsSummary: AlertsSummary = {
    expiringIn7DaysCount: 56,
    highRiskPendingContactCount: 12,
    failedRemindersCount: 7
  };

  private highRiskCustomers: HighRiskCustomer[] = [
    {
      customerId: 'CUST-1001',
      customerName: 'Anita Sharma',
      policyId: 'POL-90011',
      policyType: 'Motor',
      renewalProbability: 42,
      riskLevel: 'High',
      expiryDate: '2026-01-08'
    },
    {
      customerId: 'CUST-1002',
      customerName: 'Rahul Verma',
      policyId: 'POL-90012',
      policyType: 'Health',
      renewalProbability: 35,
      riskLevel: 'High',
      expiryDate: '2026-01-06'
    },
    {
      customerId: 'CUST-1003',
      customerName: 'Neha Gupta',
      policyId: 'POL-90013',
      policyType: 'Motor',
      renewalProbability: 28,
      riskLevel: 'High',
      expiryDate: '2026-01-10'
    },
    {
      customerId: 'CUST-1004',
      customerName: 'Suresh Patil',
      policyId: 'POL-90014',
      policyType: 'Health',
      renewalProbability: 31,
      riskLevel: 'High',
      expiryDate: '2026-01-05'
    },
    {
      customerId: 'CUST-1005',
      customerName: 'Priya Iyer',
      policyId: 'POL-90015',
      policyType: 'Motor',
      renewalProbability: 24,
      riskLevel: 'High',
      expiryDate: '2026-01-09'
    },
    {
      customerId: 'CUST-1006',
      customerName: 'Arjun Mehta',
      policyId: 'POL-90016',
      policyType: 'Health',
      renewalProbability: 27,
      riskLevel: 'High',
      expiryDate: '2026-01-07'
    },
    {
      customerId: 'CUST-1007',
      customerName: 'Meera Nair',
      policyId: 'POL-90017',
      policyType: 'Motor',
      renewalProbability: 33,
      riskLevel: 'High',
      expiryDate: '2026-01-06'
    },
    {
      customerId: 'CUST-1008',
      customerName: 'Vikram Singh',
      policyId: 'POL-90018',
      policyType: 'Health',
      renewalProbability: 22,
      riskLevel: 'High',
      expiryDate: '2026-01-11'
    },
    {
      customerId: 'CUST-1009',
      customerName: 'Kavita Rao',
      policyId: 'POL-90019',
      policyType: 'Motor',
      renewalProbability: 30,
      riskLevel: 'High',
      expiryDate: '2026-01-07'
    },
    {
      customerId: 'CUST-1010',
      customerName: 'Rohan Kulkarni',
      policyId: 'POL-90020',
      policyType: 'Health',
      renewalProbability: 26,
      riskLevel: 'High',
      expiryDate: '2026-01-08'
    }
  ];

  // ===== Public API =====
  getPolicySummary(): PolicySummary {
    return this.policySummary;
  }

  getAlerts(): AlertsSummary {
    return this.alertsSummary;
  }

  /**
   * Returns only the top 10 high-risk customers sorted by lowest renewalProbability.
   */
  getHighRiskCustomers(): HighRiskCustomer[] {
    return [...this.highRiskCustomers]
      .sort((a, b) => a.renewalProbability - b.renewalProbability)
      .slice(0, 10);
  }
  
}
