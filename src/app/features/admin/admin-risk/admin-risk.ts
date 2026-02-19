import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Sidebar } from '../../../shared/sidebar/sidebar';
import { CommonModule } from '@angular/common';
import { Observable, BehaviorSubject, combineLatest, map, shareReplay, tap } from 'rxjs';
import { AdminRiskData, RiskRecord, RiskLevel, RiskDashboardData, RiskSummary } from './admin-risk-data';

@Component({
  standalone: true,
  imports: [Sidebar, CommonModule, FormsModule, ReactiveFormsModule],
  selector: 'app-admin-risk',
  templateUrl: './admin-risk.html',
  styleUrls: ['./admin-risk.css']
})
export class AdminRisk implements OnInit {
  dashboardData$!: Observable<RiskDashboardData>;
  filteredRisks$!: Observable<RiskRecord[]>;
  summary$!: Observable<RiskSummary>;
  pagedRisks$!: Observable<RiskRecord[]>;

  private riskLevelFilter$ = new BehaviorSubject<string>('All');
  private policyTypeFilter$ = new BehaviorSubject<string>('All');

  riskLevelFilter: string = 'All';
  policyTypeFilter: string = 'All';

  private allRisks: RiskRecord[] = [];

  // Pagination
  page = 1;
  pageSize = 10;
  maxPage = 1;
  private page$ = new BehaviorSubject<number>(1);

  constructor(private riskService: AdminRiskData) {}

  ngOnInit(): void {
    this.loadData();
  }

  private loadData(): void {
    this.dashboardData$ = this.riskService.getRiskDashboardData().pipe(
      tap(data => {
        this.allRisks = data.risks;
        console.log('✅ Received:', data.risks.length, 'records');
      }),
      shareReplay(1)
    );

    this.summary$ = this.dashboardData$.pipe(
      map(data => data.summary)
    );

    this.filteredRisks$ = combineLatest([
      this.dashboardData$,
      this.riskLevelFilter$,
      this.policyTypeFilter$
    ]).pipe(
      map(([data, riskLevel, policyType]) => {
        let filtered = [...data.risks];

        if (riskLevel !== 'All') {
          filtered = filtered.filter(r => r.riskLevel === riskLevel);
        }

        if (policyType !== 'All') {
          filtered = filtered.filter(r => r.policyType === policyType);
        }

        this.page = 1;
        this.page$.next(1);
        this.maxPage = Math.max(1, Math.ceil(filtered.length / this.pageSize));

        console.log('👁️ Displaying:', filtered.length, 'records');
        return filtered;
      })
    );

    this.pagedRisks$ = combineLatest([
      this.filteredRisks$,
      this.page$
    ]).pipe(
      map(([rows, page]) => {
        const start = (page - 1) * this.pageSize;
        const end = start + this.pageSize;
        return rows.slice(start, end);
      })
    );
  }

  onRefresh(): void {
    this.loadData();
  }

  onRiskLevelChange(val: string): void {
    this.riskLevelFilter = val;
    this.riskLevelFilter$.next(val);
  }

  onPolicyTypeChange(val: string): void {
    this.policyTypeFilter = val;
    this.policyTypeFilter$.next(val);
  }

  nextPage(): void {
    if (this.page < this.maxPage) {
      this.page++;
      this.page$.next(this.page);
    }
  }

  prevPage(): void {
    if (this.page > 1) {
      this.page--;
      this.page$.next(this.page);
    }
  }

  toggleFlag(record: RiskRecord): void {
    record.flagged = !record.flagged;
    this.riskService.toggleFlag(record.customerId).subscribe({
      next: () => console.log('Flag toggled for', record.customerId),
      error: (err) => console.error('Toggle flag error:', err)
    });
  }

  riskBadgeClass(level: RiskLevel): string {
    switch (level) {
      case 'High': return 'badge-high';
      case 'Medium': return 'badge-medium';
      case 'Low': return 'badge-low';
      default: return '';
    }
  }

  rowClass(record: RiskRecord): any {
    return {
      'row-high': record.riskLevel === 'High',
      'row-flagged': record.flagged
    };
  }
}