import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, forkJoin, map, of, tap } from 'rxjs';
import { environment } from '../../../../environments/environment';

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
  renewalProbability: number;
  riskLevel: 'High';
  expiryDate: string;
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
  private readonly base = `${environment.apiUrl}/api`;

  constructor(private http: HttpClient) {}

  getPolicySummary(): Observable<PolicySummary> {
    return this.http.get<any[]>(`${this.base}/policies`).pipe(
      map((policies) => ({
        totalPolicies: policies.length,
        motorPolicies: policies.filter(p => p.policyType === 'MOTOR').length,
        healthPolicies: policies.filter(p => p.policyType === 'HEALTH').length,
        expiringSoonPolicies: policies.filter(p => p.status === 'EXPIRED').length
      }))
    );
  }

  // Fetch single customer for the View page
  // getCustomerById(id: string): Observable<any> {
  //   return this.http.get<any>(`${this.base}/customers/${id}`);
  // }

  getAlerts(): Observable<AlertsSummary> {
    return forkJoin({
      policies: this.http.get<any[]>(`${this.base}/policies`),
      predictions: this.http.get<any[]>(`${this.base}/predictions`),
      reminders: this.http.get<any[]>(`${this.base}/reminders`)
    }).pipe(
      map(({ policies, predictions, reminders }) => {
        const expiringIn7 = policies.filter(p => {
          const end = new Date(p.endDate).getTime();
          const now = Date.now();
          const days = (end - now) / (1000 * 60 * 60 * 24);
          return days >= 0 && days <= 7;
        }).length;

        return {
          expiringIn7DaysCount: expiringIn7,
          highRiskPendingContactCount: predictions.filter(p => p.riskScore >= 70).length,
          failedRemindersCount: reminders.filter(r => r.status === 'FAILED').length
        };
      })
    );
  }
  private getOptions() {
    return {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        // If using JWT, add Authorization header here or use an Interceptor
      }),
      withCredentials: true // Required if using cookies/sessions
    };
  }
getCustomerById(id: string): Observable<any> {
    console.log(`Service calling: ${this.base}/customers/${id}`);
    return this.http.get<any>(`${this.base}/customers/${id}`, this.getOptions()).pipe(
      tap(data => console.log('Successfully fetched customer:', data)),
      catchError(err => {
        console.error('API Error details:', err);
        // If 401/403, the issue is Security/Auth
        if (err.status === 403 || err.status === 401) {
          console.warn('Authentication/Permission issue detected.');
        }
        return of(null); 
      })
    );
  }

  getHighRiskCustomers(): Observable<HighRiskCustomer[]> {
    return forkJoin({
      customers: this.http.get<any[]>(`${this.base}/customers`),
      policies: this.http.get<any[]>(`${this.base}/policies`),
      predictions: this.http.get<any[]>(`${this.base}/predictions`)
    }).pipe(
      map(({ customers, policies, predictions }) => {
        const customerMap = new Map(customers.map(c => [c.customerId, c]));
        const policyMap = new Map(policies.map(p => [p.policyId, p]));

        return predictions
          .filter(p => p.riskScore >= 70)
          .map(p => {
            const customer = customerMap.get(p.customerId);
            const policy = policyMap.get(p.policyId);
            return {
              customerId: `${p.customerId}`, // Keep as raw ID for routing
              customerName: customer?.name ?? 'Unknown',
              policyId: `POL-${p.policyId}`,
              policyType: policy?.policyType === 'MOTOR' ? 'Motor' : 'Health',
              renewalProbability: Math.round((p.renewalProbability ?? 0) * 100),
              riskLevel: 'High',
              expiryDate: policy?.endDate ?? p.predictionDate
            } as HighRiskCustomer;
          });
      })
    );
  }
}