
// customer.service.ts
import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';

export type PolicyStatus = 'ACTIVE' | 'EXPIRED';

export interface Policy {
  name: string;
  policyNumber: string;
  status: PolicyStatus;
  renewalDate?: string;
  expiredOn?: string;
  premium: number;
  coverage?: string;
  insuredValue?: number;
  notes?: string;
}

export interface NextRenewal {
  product: string;
  policyNumber: string;
  renewalDate: string;
  status: 'Active' | 'Expired';
}

export interface Offer {
  title: string;        
  chip: string;           
  description: string;    
  conditions: string;    
}

export interface DashboardCustomer {
  nextRenewal: NextRenewal;
  policies: Policy[];
  offers: Offer[];       
}

@Injectable({ providedIn: 'root' })
export class CustomerService {

  private readonly mock: DashboardCustomer = {
    nextRenewal: {
      product: 'Car Insurance',
      policyNumber: 'RS-982341',
      renewalDate: '2025-08-15',
      status: 'Active'
    },
    policies: [
      {
        name: 'Car Insurance',
        policyNumber: 'RS-982341',
        status: 'ACTIVE',
        renewalDate: '2025-08-15',
        premium: 780,
        coverage: 'Comprehensive',
        insuredValue: 25000,
        notes: 'Includes own damage, third‑party liability, and roadside assistance. Excess: $300 per claim.'
      },
      {
        name: 'Home Insurance',
        policyNumber: 'RS-771204',
        status: 'ACTIVE',
        renewalDate: '2025-12-02',
        premium: 1420,
        coverage: 'Building + Contents',
        insuredValue: 300000,
        notes: 'Includes fire, theft, natural calamities.'
      },
      {
        name: 'Travel Cover',
        policyNumber: 'RS-558910',
        status: 'EXPIRED',
        expiredOn: '2025-01-05',
        premium: 170,
        coverage: 'International Travel',
        insuredValue: 50000,
        notes: 'Medical emergencies, baggage loss, trip cancellation.'
      }
    ],
    // ✅ Hardcoded offers
    offers: [
      {
        title: 'Safe Driver Discount',
        chip: 'Save 10%',
        description: 'No claims in the last 24 months. Applied automatically when you renew.',
        conditions: 'Conditions: Maintain valid license; no major violations.'
      },
      {
        title: 'Multi‑Policy Bundle',
        chip: 'Up to 15%',
        description: 'Bundle your car and home insurance to unlock additional savings.',
        conditions: 'Conditions: Active home policy with RetainSure at time of renewal.'
      },
      {
        title: 'Early Renewal Bonus',
        chip: 'Flat credit',
        description: 'Renew at least 14 days before your due date to receive a renewal credit.',
        conditions: 'Conditions: Credit applies to your next premium payment.'
      }
    ]
  };

  getDashboard(): Observable<DashboardCustomer> {
    return of(this.mock);
  }

  getPolicies(): Observable<Policy[]> {
    return of(this.mock.policies);
  }

  getNextRenewal(): Observable<NextRenewal> {
    return of(this.mock.nextRenewal);
  }
}
