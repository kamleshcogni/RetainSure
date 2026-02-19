import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, map } from 'rxjs';
import { environment } from '../../../../environments/environment';

interface RetentionReport {
  reportId: number;
  renewalRate: number;
  churnRate: number;
  campaignEffectiveness: number;
  generatedDate: string;
}

interface RenewalPrediction {
  predictionId: number;
  customerId: number;
  policyId: number;
  renewalProbability: number; // 0..1 (based on initializer)
  riskScore: number;          // 0..100
  predictionDate: string;     // yyyy-mm-dd
}

interface Policy {
  policyId: number;
  customerId: number;
  policyType: 'HEALTH' | 'MOTOR' | string;
  startDate: string;
  endDate: string;
  status: 'ACTIVE' | 'EXPIRED' | string;
}

interface Campaign {
  campaignId: number;
  name: string;
  targetSegment: string;
  startDate: string;
  endDate: string;
  status: 'ACTIVE' | 'SCHEDULED' | 'COMPLETED' | string;
}

interface Reminder {
  reminderId: number;
  customerId: number;
  policyId: number;
  message: string;
  sentDate: string;
  status: 'SENT' | 'RESPONDED' | string;
}

export interface AnalyticsVm {
  renewalRatePct: number;
  churnRatePct: number;
  highRiskCustomers: number;
  predictionsRunToday: number;
  predictionsTotal: number;
  engagementResponseRatePct: number;
  campaignRoiPct: number;
  upcomingExpiries30Days: number;
  averageRiskScore: number;

  months: string[];
  renewalRateSeries: number[];
  churnByPolicyTypeLabels: string[];
  churnByPolicyTypeSeries: number[];
  riskBands: string[];
  riskCounts: number[];
}

@Injectable({ providedIn: 'root' })
export class AdminAnalyticsService {
  private readonly base = `${environment.apiUrl}/api`;

  constructor(private http: HttpClient) {}

  load(): Observable<AnalyticsVm> {
    const today = new Date().toISOString().slice(0, 10);

    return forkJoin({
      reports: this.http.get<RetentionReport[]>(`${this.base}/reports`),
      predictions: this.http.get<RenewalPrediction[]>(`${this.base}/predictions`),
      policies: this.http.get<Policy[]>(`${this.base}/policies`),
      campaigns: this.http.get<Campaign[]>(`${this.base}/campaigns`),
      reminders: this.http.get<Reminder[]>(`${this.base}/reminders`),
    }).pipe(
      map(({ reports, predictions, policies, campaigns, reminders }) => {
        const latestReport = [...reports].sort((a, b) =>
          (b.generatedDate || '').localeCompare(a.generatedDate || '')
        )[0];

        const renewalRatePct = latestReport?.renewalRate ?? 0;
        const churnRatePct = latestReport?.churnRate ?? 0;

        const campaignRoiPct = Math.round(latestReport?.campaignEffectiveness ?? 0);

        const predictionsTotal = predictions.length;
        const predictionsRunToday = predictions.filter(p => p.predictionDate === today).length;

        const averageRiskScore =
          predictionsTotal > 0
            ? Math.round(predictions.reduce((sum, p) => sum + (p.riskScore ?? 0), 0) / predictionsTotal)
            : 0;

        const highRiskCustomers = predictions.filter(p => (p.riskScore ?? 0) >= 70).length;

        const low = predictions.filter(p => (p.riskScore ?? 0) < 40).length;
        const med = predictions.filter(p => (p.riskScore ?? 0) >= 40 && (p.riskScore ?? 0) < 70).length;
        const high = predictions.filter(p => (p.riskScore ?? 0) >= 70).length;

        const now = new Date();
        const upcomingExpiries30Days = policies.filter(p => {
          const end = new Date(p.endDate);
          const days = (end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
          return days >= 0 && days <= 30;
        }).length;

        const byType = (type: string) => policies.filter(p => p.policyType === type);
        const churnPct = (type: string) => {
          const all = byType(type);
          if (!all.length) return 0;
          const expired = all.filter(p => p.status === 'EXPIRED').length;
          return Number(((expired / all.length) * 100).toFixed(1));
        };

        const churnByPolicyTypeLabels = ['Health', 'Motor'];
        const churnByPolicyTypeSeries = [churnPct('HEALTH'), churnPct('MOTOR')];

        const remindersTotal = reminders.length;
        const remindersResponded = reminders.filter(r => r.status === 'RESPONDED').length;
        const engagementResponseRatePct =
          remindersTotal > 0 ? Math.round((remindersResponded / remindersTotal) * 100) : 0;

        const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
        const renewalRateSeries = new Array(12).fill(0);

        for (const r of reports) {
          if (!r.generatedDate) continue;
          const d = new Date(r.generatedDate);
          const m = d.getMonth();
          renewalRateSeries[m] = Math.round(r.renewalRate ?? 0);
        }

        const curMonth = new Date().getMonth();
        if (renewalRateSeries.every(v => v === 0) && latestReport) {
          renewalRateSeries[curMonth] = Math.round(latestReport.renewalRate ?? 0);
        }

        return {
          renewalRatePct: Math.round(renewalRatePct),
          churnRatePct: Math.round(churnRatePct),
          highRiskCustomers,
          predictionsRunToday,
          predictionsTotal,
          engagementResponseRatePct,
          campaignRoiPct,
          upcomingExpiries30Days,
          averageRiskScore,

          months,
          renewalRateSeries,
          churnByPolicyTypeLabels,
          churnByPolicyTypeSeries,
          riskBands: ['Low', 'Medium', 'High'],
          riskCounts: [low, med, high],
        };
      })
    );
  }

  downloadReport(type: 'pdf' | 'excel' | 'csv'): Observable<Blob> {
    return this.http.get(`${this.base}/reports/download/${type}`, {
      responseType: 'blob'
    });
  }
}