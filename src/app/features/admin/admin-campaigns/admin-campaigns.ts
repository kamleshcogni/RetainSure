import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BehaviorSubject, switchMap } from 'rxjs';

import { Sidebar } from '../../../shared/sidebar/sidebar';
import { Campaigns } from './campaigns'; 
import { Campaign, Status } from './campaign.model';

@Component({
  selector: 'app-admin-campaigns',
  standalone: true,
  imports: [Sidebar, CommonModule, ReactiveFormsModule],
  templateUrl: './admin-campaigns.html',
  styleUrl: './admin-campaigns.css',
})
export class AdminCampaigns implements OnInit {
  private fb = inject(FormBuilder);
  private svc = inject(Campaigns);

  // Trigger for refreshing data
  private refreshSignal$ = new BehaviorSubject<void>(undefined);

  form!: FormGroup;
  editingIndex: number | null = null;
  expandedIndex: number | null = null;

  campaigns: Campaign[] = [];
  segments: string[] = [];
  metrics = { activeCampaigns: 0, avgConversionRate: 0, avgROI: 0 };

  constructor() {
    this.initForm();
  }

  ngOnInit(): void {
    this.segments = this.svc.getSegments();
    
    // Reactive Data Loading Pipeline
    this.refreshSignal$.pipe(
      switchMap(() => this.svc.list())
    ).subscribe({
      next: (rows) => {
        this.campaigns = [...rows]; 
        this.recomputeMetrics();
        this.setDefaultSegment();
        console.log(this.campaigns);
      },
      error: (err) => console.error('Failed to load campaigns:', err)
    });
  }

  private initForm(): void {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      offerDetails: ['10% Discount on Renewal', Validators.required],
      targetSegment: ['', Validators.required],
      startDate: [''],
      endDate: [''],
      status: ['ACTIVE' as Status],
    });
  }

  /** Centralized refresh method */
  private refreshData(): void {
    this.refreshSignal$.next();
  }

  private setDefaultSegment(): void {
    if (!this.form.value.targetSegment && this.segments.length) {
      this.form.patchValue({ targetSegment: this.segments[0] });
    }
  }

  /** Create → Save Draft */
  saveDraft(): void {
    if (this.form.invalid || this.isEditing()) {
      this.form.markAllAsTouched();
      return;
    }
    this.svc.createDraft(this.form.value).subscribe({
      next: () => {
        this.resetForm();
        this.refreshData();
      }
    });
  }

  /** Create → Launch */
  launchCampaign(): void {
    if (this.form.invalid || this.isEditing()) {
      this.form.markAllAsTouched();
      return;
    }
    this.svc.launch(this.form.value).subscribe({
      next: () => {
        this.resetForm();
        this.refreshData();
        alert("Campaign launched and notifications queued.");
      }
    });
  }

  /** Edit → Update row */
  saveUpdate(): void {
    if (!this.isEditing() || this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const existing = this.campaigns[this.editingIndex!];
    const v = this.form.value;

    const changes: Partial<Campaign> = {
      campaign_name: v.name,
      discount: v.offerDetails,
      target: v.targetSegment,
      start_date: v.startDate ? new Date(v.startDate).toISOString() : undefined,
      end_date: v.endDate ? new Date(v.endDate).toISOString() : undefined,
      status: v.status as Status,
    };

    this.svc.update(existing.campaign_id!, changes).subscribe({
      next: () => {
        this.resetForm();
        this.refreshData();
      }
    });
  }

  // --- UI & Helper Methods ---

  editCampaign(index: number): void {
    const c = this.campaigns[index];
    this.editingIndex = index;

    this.form.patchValue({
      name: c.campaign_name || '',
      offerDetails: c.discount || '10% Discount on Renewal',
      targetSegment: c.target || this.segments[0],
      startDate: c.start_date ? this.toInputDate(c.start_date) : '',
      endDate: c.end_date ? this.toInputDate(c.end_date) : '',
      status: c.status,
    });

    setTimeout(() => {
      document.querySelector('.rs-create')?.scrollIntoView({ behavior: 'smooth' });
    }, 0);
  }

  detailsbutton(index: number): void {
    this.expandedIndex = this.expandedIndex === index ? null : index;
  }

  cancelEdit(): void {
    this.resetForm();
  }

  isEditing(): boolean {
    return this.editingIndex !== null;
  }

  private recomputeMetrics(): void {
    const active = this.campaigns.filter(c => c.status === 'ACTIVE').length;
    const convRates = this.campaigns.map(c => c.conversionRate).filter((x): x is number => x != null);
    const rois = this.campaigns.map(c => c.roi).filter((x): x is number => x != null);

    const avgConv = convRates.length ? convRates.reduce((a, b) => a + b, 0) / convRates.length : 0;
    const avgRoi  = rois.length ? rois.reduce((a, b) => a + b, 0) / rois.length : 0;

    this.metrics = {
      activeCampaigns: active,
      avgConversionRate: Number(avgConv.toFixed(1)),
      avgROI: Math.round(avgRoi),
    };
  }

  statusClass(s: Status): string {
    const classes: Record<string, string> = { 
      ACTIVE: 'chip-active', 
      SCHEDULED: 'chip-scheduled', 
      COMPLETED: 'chip-completed' 
    };
    return classes[s] || '';
  }

  toInputDate(iso: string): string {
    if (!iso) return '';
    const d = new Date(iso);
    return d.toISOString().split('T')[0];
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