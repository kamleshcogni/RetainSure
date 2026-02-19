
import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
 
export interface Policy {
  name: string;
  policyNumber: string;
  status: 'ACTIVE' | 'EXPIRED';
  renewalDate?: string;
  expiredOn?: string;
  premium: number;
  coverage: string;
  insuredValue: number;
  notes: string;
}
 
export interface Reminder {
  reminderId: number;
  policyId: number;
  message: string;
  sentDate: string;
  status: string;
  category: string;
  riskScore: number;
}
 
export interface DashboardCustomer {
  nextRenewal: {
    product: string;
    policyNumber: string;
    renewalDate: string;
    status: string;
  };
  policies: Policy[];
  offers: any[];
  reminders: Reminder[];
}
 
@Injectable({ providedIn: 'root' })
export class CustomerService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/api/customer';
 
  getDashboard(): Observable<DashboardCustomer> {
    return this.http.get<DashboardCustomer>(`${this.apiUrl}/dashboard`);
  }
 
  respondToReminder(reminderId: number): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/reminders/${reminderId}/respond`, {});
  }
}
 