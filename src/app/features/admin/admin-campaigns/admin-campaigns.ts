
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

import { Sidebar } from '../../../shared/sidebar/sidebar';
import { Campaigns } from './campaigns';
import { Campaign, Status } from './campaign.model';

@Component({
  selector: 'app-admin-campaigns',
  imports: [Sidebar, CommonModule, ReactiveFormsModule],
  templateUrl: './admin-campaigns.html',
  styleUrl: './admin-campaigns.css',
})
export class AdminCampaigns {
  private fb = inject(FormBuilder);
  private svc = inject(Campaigns);

  form!: FormGroup;
  editingIndex: number | null = null;

  /** Track which campaign row is expanded for "Details" */
  expandedIndex: number | null = null;

  // Local cache synchronized from service for easy indexing/edit operations
  campaigns: Campaign[] = [];
  segments: string[] = [];

  metrics = { activeCampaigns: 0, avgConversionRate: 0, avgROI: 0 };

  constructor() {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      // renamed: offerDetails -> discount (but we support both when creating)
      offerDetails: ['10% Discount on Renewal', Validators.required],
      targetSegment: ['', Validators.required],
      startDate: [''],
      endDate: [''],
      status: ['ACTIVE' as Status], // shown only in edit mode
    });

    // Pull segments from the service
    this.segments = this.svc.getSegments();
    if (!this.form.value.targetSegment) {
      this.form.patchValue({ targetSegment: this.segments[0] });
    }

    // Subscribe to campaigns stream
    this.svc.list().subscribe((rows) => {
      this.campaigns = rows;
      this.recomputeMetrics();

      // If the expanded item shifts due to list changes, close details safely
      if (this.expandedIndex !== null && this.expandedIndex >= this.campaigns.length) {
        this.expandedIndex = null;
      }
    });
  }

  /** Create → Save Draft (SCHEDULED) */
  saveDraft(): void {
    if (this.form.invalid || this.isEditing()) {
      this.form.markAllAsTouched();
      return;
    }
    this.svc.createDraft(this.form.value);
    this.resetForm();
  }

  /** Create → Launch (ACTIVE) */
  launchCampaign(): void {
    if (this.form.invalid || this.isEditing()) {
      this.form.markAllAsTouched();
      return;
    }
    this.svc.launch(this.form.value);
    this.resetForm();
    alert("Campaign notifications sent");
  }

  /** Table → Edit row */
  editCampaign(index: number): void {
    const c = this.campaigns[index];
    this.editingIndex = index;

    this.form.setValue({
      name: c.campaign_name || '',
      offerDetails: c.discount || '10% Discount on Renewal',
      targetSegment: c.target || this.segments[0],
      startDate: c.start_date ? this.toInputDate(c.start_date) : '',
      endDate: c.end_date ? this.toInputDate(c.end_date) : '',
      status: c.status,
    });

    setTimeout(() => document.querySelector('.rs-create')?.scrollIntoView({ behavior: 'smooth' }), 0);
  }

  /** Details → toggle expansion for a given row */
  detailsbutton(index: number): void {
    this.expandedIndex = this.expandedIndex === index ? null : index;
  }

  /** Edit → Update row */
  saveUpdate(): void {
    if (!this.isEditing() || this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const i = this.editingIndex!;
    const v = this.form.value;
    const existing = this.campaigns[i];

    const changes: Partial<Campaign> = {
      campaign_name: v.name!,
      discount: v.offerDetails!,
      target: v.targetSegment!,
      start_date: v.startDate ? new Date(v.startDate).toISOString() : undefined,
      end_date: v.endDate ? new Date(v.endDate).toISOString() : undefined,
      status: v.status as Status,
    };

    this.svc.update(existing.campaign_id, changes);
    this.resetForm();
  }

  /** Edit → Cancel */
  cancelEdit(): void {
    this.resetForm();
  }

  isEditing(): boolean {
    return this.editingIndex !== null;
  }

  /** Helpers */
  private recomputeMetrics(): void {
    const active = this.campaigns.filter(c => c.status === 'ACTIVE').length;

    const convRates = this.campaigns
      .map(c => c.conversionRate)
      .filter((x): x is number => typeof x === 'number');

    const rois = this.campaigns
      .map(c => c.roi)
      .filter((x): x is number => typeof x === 'number');

    const avgConv = convRates.length ? convRates.reduce((a, b) => a + b, 0) / convRates.length : 0;
    const avgRoi  = rois.length ? rois.reduce((a, b) => a + b, 0) / rois.length : 0;

    this.metrics = {
      activeCampaigns: active,
      avgConversionRate: Number(avgConv.toFixed(1)),
      avgROI: Math.round(avgRoi),
    };
  }

  statusClass(s: Status): string {
    return { ACTIVE: 'chip-active', SCHEDULED: 'chip-scheduled', COMPLETED: 'chip-completed' }[s];
  }

  toInputDate(iso: string): string {
    const d = new Date(iso);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  private resetForm(): void {
    this.editingIndex = null;
    this.form.reset({
      offerDetails: '10% Discount on Renewal',
      targetSegment: this.segments[0],
      startDate: '',
      endDate: '',
      name: '',
      status: 'ACTIVE',
    });
  }
}
