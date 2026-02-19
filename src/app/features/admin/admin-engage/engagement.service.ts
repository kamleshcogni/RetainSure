import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, tap } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface Reminder {
  id?: number;
  cust_id: number;
  policy_id: number;
  category: 'HEALTH' | 'MOTOR'| null;
  date_sent: string;
  trigger: string;
  status: 'SENT' | 'RESPONDED';
  riskScore?: number;
}

export interface BulkCreatePayload {
  riskThreshold: number;
  dateSent: string;
  triggerMsg: string;
  category: string;    // "HEALTH", "MOTOR", "ANY" — used to FILTER, not store
}

interface BackendReminder {
  reminderId: number;
  customerId: number;
  policyId: number;
  message: string;
  sentDate: string;
  status: 'SENT' | 'RESPONDED';
  category: 'HEALTH' | 'MOTOR'| null;
  riskScore: number | null;
  createdAt: string | null;
  modifiedAt: string | null;
}

interface BackendReminderCreate {
  customerId: number;
  policyId: number;
  message: string;
  sentDate: string;
  status: 'SENT' | 'RESPONDED';
}

@Injectable({ providedIn: 'root' })
export class EngagementService {
  private readonly apiUrl = `${environment.apiUrl}/api/reminders`;

  constructor(private http: HttpClient) {}

  private fromBackend(r: BackendReminder): Reminder {
    return {
      id: r.reminderId,
      cust_id: r.customerId,
      policy_id: r.policyId,
      category: r.category,
      date_sent: r.sentDate,
      trigger: r.message,
      status: r.status,
      riskScore: r.riskScore ?? undefined
    };
  }

  private toBackend(r: Reminder): BackendReminderCreate {
    return {
      customerId: r.cust_id,
      policyId: r.policy_id,
      message: r.trigger,
      sentDate: r.date_sent,
      status: r.status
    };
  }

  listReminders(): Observable<Reminder[]> {
    return this.http.get<BackendReminder[]>(this.apiUrl).pipe(
      tap(raw => console.log('[EngagementService] listReminders — count:', raw.length)),
      map(items => items.map(r => this.fromBackend(r)))
    );
  }

  listRemindersByCustomer(custId: number): Observable<Reminder[]> {
    return this.http.get<BackendReminder[]>(`${this.apiUrl}/customer/${custId}`).pipe(
      tap(raw => console.log('[EngagementService] listRemindersByCustomer — count:', raw.length)),
      map(items => items.map(r => this.fromBackend(r)))
    );
  }


  bulkCreate(payload: BulkCreatePayload): Observable<Reminder[]> {
    return this.http.post<BackendReminder[]>(`${this.apiUrl}/bulk`, payload).pipe(
      tap(raw => console.log('[EngagementService] bulkCreate — count:', raw.length)),
      map(items => items.map(r => this.fromBackend(r)))
    );
  }
}