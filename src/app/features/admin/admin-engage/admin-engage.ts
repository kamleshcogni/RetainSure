import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Sidebar } from '../../../shared/sidebar/sidebar';
import { EngagementService, Reminder, BulkCreatePayload } from './engagement.service';
import { AdminRiskData, RiskRecord } from '../admin-risk/admin-risk-data';


@Component({
  selector: 'app-admin-engage',
  standalone: true,
  imports: [CommonModule, FormsModule, Sidebar],
  templateUrl: './admin-engage.html',
  styleUrls: ['./admin-engage.css']
})
export class AdminEngage implements OnInit {
  customersRiskMap = new Map<number, number>();

  page = 1;
  pageSize = 10;
  maxPage = 1;
  isLoading = true;

  allReminders: Reminder[] = [];
  pagedReminders: Reminder[] = [];

  // Search
  custIdFilter = '';
  isSearching = false;
  searchedCustomerId: number | null = null;

  bulkForm = {
    riskThreshold: 70, category: 'ANY', date_sent: '',
    trigger: 'Your policy is expiring soon. Renew now to stay protected!'
  };

  creating = false;
  bulkCreating = false;
  lastBulkCreatedCount: number | null = null;
  isLoadingRisk = true;
  sidebarOpen = false;

  constructor(
    private svc: EngagementService,
    private riskSvc: AdminRiskData,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.bulkForm.date_sent = this.todayISO();
    this.loadAll();
    this.loadRisk();
  }

  // ===== LOAD =====

  loadAll(): void {
    this.isLoading = true;
    this.svc.listReminders().subscribe({
      next: items => {
        this.allReminders = items;
        this.page = 1;
        this.paginate();
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => { this.isLoading = false; this.cdr.detectChanges(); }
    });
  }

  private loadRisk(): void {
    this.riskSvc.getAllRisks().subscribe({
      next: (risks: RiskRecord[]) => {
        risks.forEach((r: RiskRecord) => {
          const id = typeof r.customerId === 'string'
            ? parseInt(r.customerId.replace('CUST-', ''), 10) : Number(r.customerId);
          this.customersRiskMap.set(id, r.riskScore);
        });
        this.isLoadingRisk = false;
        this.cdr.detectChanges();
      },
      error: () => { this.isLoadingRisk = false; this.cdr.detectChanges(); }
    });
  }

  // ===== SEARCH (3 methods only) =====

  searchByCustomer(): void {
    const raw = (this.custIdFilter ?? '').toString().trim();
    const custId = Number(raw);

    if (!raw || !Number.isFinite(custId) || custId <= 0) {
      this.clearSearch();
      return;
    }

    this.isSearching = true;
    this.searchedCustomerId = custId;
    this.isLoading = true;

    this.svc.listRemindersByCustomer(custId).subscribe({
      next: items => {
        this.allReminders = items;
        this.page = 1;
        this.paginate();
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.allReminders = [];
        this.page = 1;
        this.paginate();
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  clearSearch(): void {
    this.custIdFilter = '';
    this.isSearching = false;
    this.searchedCustomerId = null;
    this.loadAll();
  }


  bulkCreateByRiskScore(): void {
    this.bulkForm.date_sent = this.todayISO();
    if (!this.bulkForm.trigger) { alert('Fill the message.'); return; }

    this.bulkCreating = true;
    const p: BulkCreatePayload = {
      riskThreshold: this.bulkForm.riskThreshold,
      dateSent: this.bulkForm.date_sent,
      triggerMsg: this.bulkForm.trigger,
      category: this.bulkForm.category
    };
    this.svc.bulkCreate(p).subscribe({
      next: (c: Reminder[]) => {
        this.bulkCreating = false;
        this.lastBulkCreatedCount = c.length;
        this.clearSearch();
        alert(`Created ${c.length} reminders.`);
      },
      error: () => { this.bulkCreating = false; alert('Failed.'); }
    });
  }

  // ===== PAGINATION =====

  paginate(): void {
    const s = (this.page - 1) * this.pageSize;
    this.pagedReminders = this.allReminders.slice(s, s + this.pageSize);
    this.maxPage = Math.max(1, Math.ceil(this.allReminders.length / this.pageSize));
  }

  nextPage(): void { if (this.page < this.maxPage) { this.page++; this.paginate(); } }
  prevPage(): void { if (this.page > 1) { this.page--; this.paginate(); } }

  // ===== HELPERS =====

  getRiskForCust(id: number): number | undefined { return this.customersRiskMap.get(id); }

 
  todayISO(): string { return new Date().toISOString().split('T')[0]; }

  isPastDate(d: string): boolean {
    if (!d) return false;
    const s = new Date(d), n = new Date();
    s.setHours(0, 0, 0, 0); n.setHours(0, 0, 0, 0);
    return s < n;
  }
}