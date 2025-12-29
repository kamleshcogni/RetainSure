
// src/app/core/services/mock-data.service.ts
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, delay } from 'rxjs/operators';

/* ============================
 * 1) Domain Models (Interfaces)
 * ============================ */

// Customer entity
export interface Customer {
  cust_id: number;
  policy_id?: number;          // optional link to a primary policy
  name: string;
  email: string;
  phone: string;
  password: string;            // mock only; DO NOT store passwords in frontend for real apps
  created_at: string;          // ISO date string
  modified_at: string;         // ISO date string
}

// Policy entity
export interface Policy {
  policy_id: number;
  cust_id: number;
  category: 'HEALTH' | 'MOTOR' | 'LIFE' | 'TRAVEL';
  policy_name: string;
  amount: number;
  start_date: string;
  end_date: string;
  renewal_date: string;
  status: 'ACTIVE' | 'EXPIRED' | 'RENEWED' | 'CANCELLED';
  created_at: string;
  modified_at: string;
}

// Risk Management entity (dashboard feed)
export interface RiskItem {
  cust_id: number;
  policy_id: number;
  category: Policy['category'];
  cust_name: string;
  risk_score: number;          // 0–100
  renewal_date: string;
  renewal_prob: number;        // 0–100, probability in %
  status: Policy['status'];
}

// Reminder entity
export interface Reminder {
  cust_id: number;
  policy_id: number;
  category: Policy['category'];
  date_sent: string;
  mode: 'EMAIL' | 'SMS' | 'WHATSAPP' | 'CALL';
  trigger: string;             // message content
  status: 'SENT' | 'RESPONDED' | 'FAILED' | 'SCHEDULED';
}

// Campaign entity
export interface Campaign {
  campaign_id: number;
  campaign_name: string;
  target: 'ALL' | 'HIGH_RISK' | 'EXPIRING_SOON' | 'LOYAL';
  discount: number;            // percentage 0–100
  start_date: string;
  end_date: string;
  status: 'PLANNED' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  created_at: string;
  modified_at: string;
  // Optional mapping to customers/policies in mock environment
  targets?: Array<{ cust_id: number; policy_id?: number }>;
}

// Analytics summary (plus three graph series)
export interface AnalyticsSummary {
  renewal_rate: number;             // %
  churn_rate: number;               // %
  high_risk_cust: number;           // count
  predictions: number;              // count of risk items
  engagement_response: number;      // % responded reminders
  campaign_roi: number;             // % ROI (mock)
  upcoming_expiry: number;          // count within X days
  average_risk_score: number;       // 0–100

  // Graphs (3): you can bind these to chart components
  graphs: {
    renewalVsChurnSeries: Array<{ month: string; renewal_rate: number; churn_rate: number }>;
    riskTrendSeries: Array<{ month: string; avg_risk_score: number }>;
    campaignPerformanceSeries: Array<{ campaign_name: string; roi: number; responses: number }>;
  };
}

// Enriched types for UI
export interface PolicyWithCustomer extends Policy {
  customer: Pick<Customer, 'cust_id' | 'name' | 'email' | 'phone'>;
}

export interface RiskItemEnriched extends RiskItem {
  customer_email: string;
  customer_phone: string;
  policy_name: string;
  amount: number;
}

/* ============================
 * 2) Mock Data (Interlinked)
 * ============================ */

@Injectable({ providedIn: 'root' })
export class MockDataService {
  // ---- Customers ----
  private customers: Customer[] = [
    {
      cust_id: 1001, policy_id: 5001, name: 'Aarav Sharma',
      email: 'aarav@example.com', phone: '+91-9000000001', password: 'mockpass',
      created_at: '2025-11-02', modified_at: '2025-12-20'
    },
    {
      cust_id: 1002, policy_id: 5002, name: 'Diya Patel',
      email: 'diya@example.com', phone: '+91-9000000002', password: 'mockpass',
      created_at: '2025-10-15', modified_at: '2025-12-18'
    },
    {
      cust_id: 1003, policy_id: 5004, name: 'Kabir Joshi',
      email: 'kabir@example.com', phone: '+91-9000000003', password: 'mockpass',
      created_at: '2025-09-01', modified_at: '2025-12-10'
    }
  ];

  // ---- Policies ----
  private policies: Policy[] = [
    {
      policy_id: 5001, cust_id: 1001, category: 'HEALTH',
      policy_name: 'Health Secure Plus', amount: 25000,
      start_date: '2025-01-01', end_date: '2025-12-31', renewal_date: '2025-12-31',
      status: 'ACTIVE', created_at: '2025-01-01', modified_at: '2025-12-01'
    },
    {
      policy_id: 5002, cust_id: 1002, category: 'MOTOR',
      policy_name: 'Motor Protect Basic', amount: 12000,
      start_date: '2024-12-01', end_date: '2025-11-30', renewal_date: '2025-11-30',
      status: 'EXPIRED', created_at: '2024-12-01', modified_at: '2025-11-30'
    },
    {
      policy_id: 5003, cust_id: 1002, category: 'LIFE',
      policy_name: 'Life Shield Gold', amount: 40000,
      start_date: '2025-02-15', end_date: '2026-02-14', renewal_date: '2026-02-14',
      status: 'ACTIVE', created_at: '2025-02-15', modified_at: '2025-12-10'
    },
    {
      policy_id: 5004, cust_id: 1003, category: 'TRAVEL',
      policy_name: 'Travel Guard Annual', amount: 8000,
      start_date: '2025-03-01', end_date: '2026-02-28', renewal_date: '2026-02-28',
      status: 'ACTIVE', created_at: '2025-03-01', modified_at: '2025-12-11'
    },
    {
      policy_id: 5005, cust_id: 1001, category: 'MOTOR',
      policy_name: 'Motor Protect Premium', amount: 20000,
      start_date: '2024-12-25', end_date: '2025-12-24', renewal_date: '2025-12-24',
      status: 'RENEWED', created_at: '2024-12-25', modified_at: '2025-12-24'
    }
  ];

  // ---- Risk Management feed ----
  private risks: RiskItem[] = [
    {
      cust_id: 1001, policy_id: 5001, category: 'HEALTH',
      cust_name: 'Aarav Sharma', risk_score: 35, renewal_date: '2025-12-31',
      renewal_prob: 78, status: 'ACTIVE'
    },
    {
      cust_id: 1002, policy_id: 5002, category: 'MOTOR',
      cust_name: 'Diya Patel', risk_score: 72, renewal_date: '2025-11-30',
      renewal_prob: 22, status: 'EXPIRED'
    },
    {
      cust_id: 1002, policy_id: 5003, category: 'LIFE',
      cust_name: 'Diya Patel', risk_score: 28, renewal_date: '2026-02-14',
      renewal_prob: 85, status: 'ACTIVE'
    },
    {
      cust_id: 1003, policy_id: 5004, category: 'TRAVEL',
      cust_name: 'Kabir Joshi', risk_score: 55, renewal_date: '2026-02-28',
      renewal_prob: 60, status: 'ACTIVE'
    },
    {
      cust_id: 1001, policy_id: 5005, category: 'MOTOR',
      cust_name: 'Aarav Sharma', risk_score: 20, renewal_date: '2025-12-24',
      renewal_prob: 93, status: 'RENEWED'
    }
  ];

  // ---- Reminders ----
  private reminders: Reminder[] = [
    {
      cust_id: 1001, policy_id: 5001, category: 'HEALTH',
      date_sent: '2025-12-20', mode: 'EMAIL',
      trigger: 'Your Health policy renews on 31 Dec', status: 'SENT'
    },
    {
      cust_id: 1002, policy_id: 5002, category: 'MOTOR',
      date_sent: '2025-11-25', mode: 'SMS',
      trigger: 'Motor policy renewal reminder', status: 'RESPONDED'
    },
    {
      cust_id: 1003, policy_id: 5004, category: 'TRAVEL',
      date_sent: '2025-12-22', mode: 'WHATSAPP',
      trigger: 'Travel policy upcoming renewal', status: 'SCHEDULED'
    }
  ];

  // ---- Campaigns ----
  private campaigns: Campaign[] = [
    {
      campaign_id: 3001, campaign_name: 'Year-End Health Offer',
      target: 'EXPIRING_SOON', discount: 15,
      start_date: '2025-12-15', end_date: '2026-01-15',
      status: 'ACTIVE', created_at: '2025-12-10', modified_at: '2025-12-20',
      targets: [{ cust_id: 1001, policy_id: 5001 }]
    },
    {
      campaign_id: 3002, campaign_name: 'Motor Comeback',
      target: 'HIGH_RISK', discount: 10,
      start_date: '2025-11-01', end_date: '2025-12-31',
      status: 'COMPLETED', created_at: '2025-10-25', modified_at: '2025-12-01',
      targets: [{ cust_id: 1002, policy_id: 5002 }]
    },
    {
      campaign_id: 3003, campaign_name: 'Travel New Year Promo',
      target: 'ALL', discount: 5,
      start_date: '2025-12-20', end_date: '2026-01-20',
      status: 'PLANNED', created_at: '2025-12-18', modified_at: '2025-12-23',
      targets: [{ cust_id: 1003, policy_id: 5004 }]
    }
  ];

  /* ============================
   * 3) Public API (Observables)
   * ============================ */

  // --- Customers & Policies ---
  listCustomers(): Observable<Customer[]> {
    return of(this.customers).pipe(delay(250));
  }

  getCustomer(custId: number): Observable<Customer | undefined> {
    return of(this.customers.find(c => c.cust_id === custId)).pipe(delay(150));
  }

  listPolicies(): Observable<Policy[]> {
    return of(this.policies).pipe(delay(250));
  }

  listPoliciesByCustomer(custId: number): Observable<Policy[]> {
    return of(this.policies.filter(p => p.cust_id === custId)).pipe(delay(200));
  }

  getPolicyWithCustomer(policyId: number): Observable<PolicyWithCustomer | undefined> {
    return of(policyId).pipe(
      map(id => {
        const p = this.policies.find(x => x.policy_id === id);
        if (!p) return undefined;
        const c = this.customers.find(x => x.cust_id === p.cust_id)!;
        return { ...p, customer: { cust_id: c.cust_id, name: c.name, email: c.email, phone: c.phone } };
      }),
      delay(150)
    );
  }

  // --- Risk Dashboard (enriched join) ---
  listRiskDashboard(): Observable<RiskItemEnriched[]> {
    return of(this.risks).pipe(
      map(items =>
        items.map(r => {
          const c = this.customers.find(x => x.cust_id === r.cust_id)!;
          const p = this.policies.find(x => x.policy_id === r.policy_id)!;
          return {
            ...r,
            customer_email: c.email,
            customer_phone: c.phone,
            policy_name: p.policy_name,
            amount: p.amount
          };
        }).sort((a, b) => b.risk_score - a.risk_score)
      ),
      delay(300)
    );
  }

  // --- Reminders ---
  listReminders(): Observable<Reminder[]> {
    return of(this.reminders).pipe(delay(200));
  }

  listRemindersByCustomer(custId: number): Observable<Reminder[]> {
    return of(this.reminders.filter(r => r.cust_id === custId)).pipe(delay(150));
  }

  // --- Campaigns ---
  listCampaigns(): Observable<Campaign[]> {
    return of(this.campaigns).pipe(delay(200));
  }

  listCampaignsForCustomer(custId: number): Observable<Campaign[]> {
    return of(
      this.campaigns.filter(c => (c.targets ?? []).some(t => t.cust_id === custId))
    ).pipe(delay(150));
  }

  // --- Upcoming Expiries (within N days) ---
  listUpcomingExpiries(days: number): Observable<PolicyWithCustomer[]> {
    const today = new Date('2025-12-26'); // fixed for consistent mock; replace with new Date()
    const threshold = new Date(today);
    threshold.setDate(today.getDate() + days);

    const result = this.policies
      .filter(p => new Date(p.renewal_date) >= today && new Date(p.renewal_date) <= threshold)
      .map(p => {
        const c = this.customers.find(x => x.cust_id === p.cust_id)!;
        return { ...p, customer: { cust_id: c.cust_id, name: c.name, email: c.email, phone: c.phone } };
      });

    return of(result).pipe(delay(200));
  }

  // --- Analytics (summary + 3 graphs) ---
  getAnalyticsSummary(): Observable<AnalyticsSummary> {
    const totalActiveOrExpired = this.policies.filter(p => p.status === 'ACTIVE' || p.status === 'EXPIRED').length;
    const renewed = this.policies.filter(p => p.status === 'RENEWED').length;
    const expired = this.policies.filter(p => p.status === 'EXPIRED').length;

    const renewal_rate = this.percent(renewed, (renewed + totalActiveOrExpired));
    const churn_rate = this.percent(expired, (expired + totalActiveOrExpired));
    const high_risk_cust = new Set(
      this.risks.filter(r => r.risk_score >= 60).map(r => r.cust_id)
    ).size;
    const predictions = this.risks.length;

    const responded = this.reminders.filter(r => r.status === 'RESPONDED').length;
    const engagement_response = this.percent(responded, this.reminders.length);

    const upcoming_expiry = this.policies.filter(p => {
      const d = new Date(p.renewal_date);
      const today = new Date('2025-12-26');
      const within = (d.getTime() - today.getTime()) / (1000 * 3600 * 24);
      return within >= 0 && within <= 30;
    }).length;

    const average_risk_score =
      Math.round((this.risks.reduce((sum, r) => sum + r.risk_score, 0) / this.risks.length) * 100) / 100;

    // mock campaign "ROI": responded reminders tied to campaigns vs targets
    const campaign_roi = 48; // keep simple in mock

    // Graph 1: Renewal vs Churn trend (mocked months)
    const renewalVsChurnSeries = [
      { month: 'Sep', renewal_rate: 66, churn_rate: 11 },
      { month: 'Oct', renewal_rate: 70, churn_rate: 9 },
      { month: 'Nov', renewal_rate: 68, churn_rate: 12 },
      { month: 'Dec', renewal_rate: 72, churn_rate: 8 },
    ];

    // Graph 2: Risk trend (avg risk per month)
    const riskTrendSeries = [
      { month: 'Sep', avg_risk_score: 52 },
      { month: 'Oct', avg_risk_score: 50 },
      { month: 'Nov', avg_risk_score: 49 },
      { month: 'Dec', avg_risk_score: average_risk_score },
    ];

    // Graph 3: Campaign performance
    const campaignPerformanceSeries = this.campaigns.map(c => ({
      campaign_name: c.campaign_name,
      roi: c.status === 'COMPLETED' ? 62 : (c.status === 'ACTIVE' ? 45 : 30),
      responses: (c.targets?.length ?? 0) * (c.status === 'COMPLETED' ? 0.6 : 0.3)
    }));

    const summary: AnalyticsSummary = {
      renewal_rate,
      churn_rate,
      high_risk_cust,
      predictions,
      engagement_response,
      campaign_roi,
      upcoming_expiry,
      average_risk_score,
      graphs: {
        renewalVsChurnSeries,
        riskTrendSeries,
        campaignPerformanceSeries
      }
    };

    return of(summary).pipe(delay(300));
  }

  /* ============================
   * 4) Helpers
   * ============================ */

  private percent(part: number, total: number): number {
    if (!total) return 0;
    return Math.round((part / total) * 100);
  }
}
``
