import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Campaign, Status } from './campaign.model';
import { environment } from '../../../../environments/environment';

interface BackendCampaign {
  campaignId: number;
  campaignCode?: string;
  campaignName: string;
  target: string;
  discountPercent?: number;
  startDate: string;
  endDate: string;
  status: string;
}

@Injectable({ providedIn: 'root' })
export class Campaigns {
  private http = inject(HttpClient);

  // ✅ backend controller is @RequestMapping("/api/campaigns")
  private readonly apiUrl = `${environment.apiUrl}/api/campaigns`;

  private readonly segments: string[] = [
    'High Risk, High Value',
    'High Risk, Mixed Value',
    'Medium Risk, High Value',
    'Medium Risk, Medium Value',
    'Low Risk, High Value',
  ];

  getSegments(): string[] {
    return this.segments;
  }

  // ---------- API ----------
  list(): Observable<Campaign[]> {
    return this.http.get<BackendCampaign[]>(this.apiUrl).pipe(
      map(rows => rows.map(r => this.fromBackend(r)))
    );
  }

  createDraft(formValue: any): Observable<Campaign> {
    const payload = this.mapFormToBackend(formValue, 'SCHEDULED');
    return this.http.post<BackendCampaign>(this.apiUrl, payload).pipe(
      map(r => this.fromBackend(r))
    );
  }

  launch(formValue: any): Observable<Campaign> {
    const payload = this.mapFormToBackend(formValue, 'ACTIVE');
    return this.http.post<BackendCampaign>(this.apiUrl, payload).pipe(
      map(r => this.fromBackend(r))
    );
  }

  update(campaignId: number, changes: Partial<Campaign>): Observable<Campaign> {
    const payload = this.mapChangesToBackend(changes);

    return this.http.put<BackendCampaign>(`${this.apiUrl}/${campaignId}`, payload).pipe(
      map(r => this.fromBackend(r))
    );
  }

  // ---------- Mapping ----------
  private mapFormToBackend(formValue: any, status: Status): Omit<BackendCampaign, 'campaignId'> {
    return {
      campaignName: formValue.name,
      target: formValue.targetSegment,
      discountPercent: this.parseDiscountPercent(formValue.offerDetails),
      startDate: formValue.startDate || '',
      endDate: formValue.endDate || '',
      status: status
    };
  }

  private mapChangesToBackend(changes: Partial<Campaign>): Omit<BackendCampaign, 'campaignId'> {
    return {
      campaignName: changes.campaign_name ?? '',
      target: changes.target ?? '',
      discountPercent: this.parseDiscountPercent(changes.discount ?? ''),
      startDate: changes.start_date ?? '',
      endDate: changes.end_date ?? '',
      status: changes.status ?? 'SCHEDULED'
    };
  }

  private fromBackend(b: BackendCampaign): Campaign {
    return {
      campaign_id: b.campaignId,
      campaign_code: b.campaignCode ?? String(b.campaignId),
      campaign_name: b.campaignName,
      target: b.target,
      start_date: b.startDate,
      end_date: b.endDate,
      status: b.status as Status,
      discount: b.discountPercent != null ? `${b.discountPercent}%` : undefined,

      created_at: undefined,
      modified_at: undefined,
      segmentSize: undefined,
      conversions: undefined,
      conversionRate: undefined,
      roi: undefined
    };
  }

  private parseDiscountPercent(value: string): number {
    if (!value) return 0;
    const match = value.match(/(\d+(\.\d+)?)/);
    return match ? Number(match[1]) : 0;
  }
}
