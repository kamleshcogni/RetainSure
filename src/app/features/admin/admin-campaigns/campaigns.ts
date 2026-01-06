
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Campaign, Status } from './campaign.model';

@Injectable({ providedIn: 'root' })
export class Campaigns {
  /** Optional: app-wide segment catalog */
  private readonly segments: string[] = [
    'High Risk, High Value',
    'High Risk, Mixed Value',
    'Medium Risk, High Value',
    'Medium Risk, Medium Value',
    'Low Risk, High Value',
  ];

  /** In-memory store for campaigns */
  private readonly store$ = new BehaviorSubject<Campaign[]>(this.seed());
  readonly campaigns$: Observable<Campaign[]> = this.store$.asObservable();

  /** Public getters */
  list(): Observable<Campaign[]> {
    return this.campaigns$;
  }

  getSegments(): string[] {
    return this.segments;
  }

  /** Create a "draft" campaign (SCHEDULED) from form value */
  createDraft(formValue: any): void {
    const created = this.createFromForm(formValue, 'SCHEDULED');
    this.insertTop(created);
  }

  /** Launch a campaign (ACTIVE) from form value */
  launch(formValue: any): void {
    const created = this.createFromForm(formValue, 'ACTIVE');
    this.insertTop(created);
  }

  /** Update a campaign by its ID */
  update(campaign_id: string, changes: Partial<Campaign>): void {
    const nowIso = new Date().toISOString();
    const next = this.store$.value.map(c =>
      c.campaign_id === campaign_id ? { ...c, ...changes, modified_at: nowIso } : c
    );
    this.store$.next(next);
  }

  /** Delete a campaign (if needed later) */
  delete(campaign_id: string): void {
    const next = this.store$.value.filter(c => c.campaign_id !== campaign_id);
    this.store$.next(next);
  }

  /** ---------- Helpers ---------- */

  private insertTop(c: Campaign): void {
    this.store$.next([c, ...this.store$.value]);
  }

  private createFromForm(formValue: any, status: Status): Campaign {
    const nowIso = new Date().toISOString();
    return {
      campaign_id: this.nextId(),
      campaign_name: formValue.name!,
      target: formValue.targetSegment!,
      discount: formValue.offerDetails ?? formValue.discount ?? '10% Discount on Renewal',
      start_date: formValue.startDate ? new Date(formValue.startDate).toISOString() : undefined,
      end_date: formValue.endDate ? new Date(formValue.endDate).toISOString() : undefined,
      status,
      created_at: nowIso,
      modified_at: nowIso,

      // Optional extras: keep these if you still want the "Overview" band with metrics
      segmentSize: 0,
    };
  }

  /** Generates next campaign_id like C-006, based on existing max numeric suffix */
  private nextId(): string {
    const ids = this.store$.value.map(c => c.campaign_id);
    const nums = ids
      .map(id => Number(id.replace(/^\D+/, '')))
      .filter(n => Number.isFinite(n));
    const next = (nums.length ? Math.max(...nums) + 1 : 1).toString().padStart(3, '0');
    return `C-${next}`;
  }

  /** Initial seed data (migrated from your hard-coded component) */
  private seed(): Campaign[] {
    return [
      {
        campaign_id: 'C-001',
        campaign_name: 'Win-back 2025 Initiative',
        status: 'ACTIVE',
        target: 'High Risk, High Value',
        discount: '10% Discount on Renewal',
        start_date: undefined,
        end_date: undefined,
        created_at: new Date('2025-06-05').toISOString(),
        modified_at: new Date('2025-06-05').toISOString(),

        // Optional extras
        segmentSize: 1250,
        conversions: 85,
        conversionRate: 6.8,
        roi: 210,
      },
      {
        campaign_id: 'C-002',
        campaign_name: 'October Retention Push',
        status: 'ACTIVE',
        target: 'Medium Risk, Medium Value',
        discount: '10% Discount on Renewal',
        start_date: undefined,
        end_date: undefined,
        created_at: new Date('2025-10-01').toISOString(),
        modified_at: new Date('2025-10-01').toISOString(),

        segmentSize: 840,
        conversions: 142,
        conversionRate: 16.9,
        roi: 450,
      },
      {
        campaign_id: 'C-003',
        campaign_name: 'Loyalty Rewards Alpha',
        status: 'SCHEDULED',
        target: 'Low Risk, High Value',
        discount: '10% Discount on Renewal',
        start_date: undefined,
        end_date: undefined,
        created_at: new Date('2025-11-15').toISOString(),
        modified_at: new Date('2025-11-15').toISOString(),
      },
      {
        campaign_id: 'C-004',
        campaign_name: 'Summer Saver Promo',
        status: 'COMPLETED',
        target: 'High Risk, Mixed Value',
        discount: '10% Discount on Renewal',
        start_date: undefined,
        end_date: undefined,
        created_at: new Date('2025-07-10').toISOString(),
        modified_at: new Date('2025-08-31').toISOString(),

        segmentSize: 5400,
        conversions: 680,
        conversionRate: 12.5,
        roi: 315,
      },
      {
        campaign_id: 'C-005',
        campaign_name: 'Q3 Early Renewal',
        status: 'COMPLETED',
        target: 'Medium Risk, High Value',
        discount: '10% Discount on Renewal',
        start_date: undefined,
        end_date: undefined,
        created_at: new Date('2025-09-01').toISOString(),
        modified_at: new Date('2025-09-20').toISOString(),

        segmentSize: 1100,
        conversions: 95,
        conversionRate: 8.6,
        roi: 180,
      },
    ];
  }
}
