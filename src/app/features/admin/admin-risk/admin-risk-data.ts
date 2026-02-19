import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, map } from 'rxjs';
import { environment } from '../../../../environments/environment';

export type RiskLevel = 'High' | 'Medium' | 'Low';
export type PolicyType = 'Motor' | 'Health';

export interface RiskRecord {
  customerId: string;
  customerName: string;
  policyId: string;
  policyType: PolicyType;
  riskScore: number;
  riskLevel: RiskLevel;
  renewalProbability: number;
  renewalDate: string;
  renewalStatus: 'Pending' | 'Renewed' | 'Expired';
  flagged: boolean;
}

export interface RiskSummary {
  totalHigh: number;
  totalMedium: number;
  totalLow: number;
}

export interface RiskDashboardData {
  risks: RiskRecord[];
  summary: RiskSummary;
}

// Backend interfaces
interface BackendCustomer {
  customerId: number;
  name: string;
  contactInfo: string;
  email: string;
  riskCategory: string;
}

interface BackendPolicy {
  policyId: number;
  customerId: number;
  policyType: string;
  startDate: string;
  endDate: string;
  status: string;
}

interface BackendPrediction {
  predictionId: number;
  customerId: number;
  policyId: number;
  renewalProbability: number;
  riskScore: number;
  predictionDate: string;
}

@Injectable({ providedIn: 'root' })
export class AdminRiskData {
  private readonly base = `${environment.apiUrl}/api`;

  constructor(private http: HttpClient) {}

  /**
   * Returns just the risk records (for backward compatibility)
   */
  getAllRisks(): Observable<RiskRecord[]> {
    return this.getRiskDashboardData().pipe(
      map(data => data.risks)
    );
  }

  /**
   * Returns full dashboard data including risks and summary
   */
  getRiskDashboardData(): Observable<RiskDashboardData> {
    return forkJoin({
      customers: this.http.get<BackendCustomer[]>(`${this.base}/customers`),
      policies: this.http.get<BackendPolicy[]>(`${this.base}/policies`),
      predictions: this.http.get<BackendPrediction[]>(`${this.base}/predictions`)
    }).pipe(
      map(({ customers, policies, predictions }) => {
        const customerMap = new Map(customers.map(c => [c.customerId, c]));
        const policyMap = new Map(policies.map(p => [p.policyId, p]));

        const risks: RiskRecord[] = predictions.map(pred => {
          const customer = customerMap.get(pred.customerId);
          const policy = policyMap.get(pred.policyId);

          // Determine risk level based on risk score
          let riskLevel: RiskLevel = 'Low';
          if (pred.riskScore >= 70) {
            riskLevel = 'High';
          } else if (pred.riskScore >= 40) {
            riskLevel = 'Medium';
          }

          // Determine renewal status based on policy status
          let renewalStatus: 'Pending' | 'Renewed' | 'Expired' = 'Pending';
          if (policy?.status === 'EXPIRED') {
            renewalStatus = 'Expired';
          } else if (policy?.status === 'RENEWED' || policy?.status === 'ACTIVE') {
            renewalStatus = 'Renewed';
          }

          return {
            customerId: `CUST-${pred.customerId}`,
            customerName: customer?.name ?? 'Unknown',
            policyId: `POL-${pred.policyId}`,
            policyType: (policy?.policyType === 'MOTOR' ? 'Motor' : 'Health') as PolicyType,
            riskScore: pred.riskScore,
            riskLevel: riskLevel,
            renewalProbability: Math.round((pred.renewalProbability ?? 0) * 100),
            renewalDate: policy?.endDate ?? pred.predictionDate,
            renewalStatus: renewalStatus,
            flagged: false
          };
        });

        // Compute summary
        const summary: RiskSummary = {
          totalHigh: risks.filter(r => r.riskLevel === 'High').length,
          totalMedium: risks.filter(r => r.riskLevel === 'Medium').length,
          totalLow: risks.filter(r => r.riskLevel === 'Low').length
        };

        return { risks, summary };
      })
    );
  }

  toggleFlag(customerId: string): Observable<any> {
    return this.http.patch(`${this.base}/admin/analytics/toggle-flag/${customerId}`, {});
  }
}