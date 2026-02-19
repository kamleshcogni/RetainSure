import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, NgZone, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Sidebar } from '../../../shared/sidebar/sidebar';
import Chart from 'chart.js/auto';
import { AdminAnalyticsService, AnalyticsVm } from './analytics.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-admin-analytics',
  standalone: true,
  imports: [CommonModule, Sidebar],
  templateUrl: './admin-analytics.html',
  styleUrl: './admin-analytics.css',
})
export class AdminAnalytics implements AfterViewInit, OnDestroy {
  @ViewChild('renewalCanvas') renewalCanvas?: ElementRef<HTMLCanvasElement>;
  @ViewChild('churnCanvas') churnCanvas?: ElementRef<HTMLCanvasElement>;
  @ViewChild('riskCanvas') riskCanvas?: ElementRef<HTMLCanvasElement>;

  private renewalChart?: Chart;
  private churnChart?: Chart;
  private riskChart?: Chart;

  private sub?: Subscription;

  vm: AnalyticsVm | null = null;
  loading = true;

  constructor(
    private analytics: AdminAnalyticsService,
    private zone: NgZone,
    private cdr: ChangeDetectorRef
  ) {}

  ngAfterViewInit(): void {
    this.sub = this.analytics.load().subscribe({
      next: (vm) => {
        this.zone.run(() => {
          this.vm = vm;
          this.loading = false;

          this.cdr.detectChanges();
          this.renderCharts();
        });
      },
      error: (err) => {
        this.zone.run(() => {
          console.error('Analytics load failed:', err);
          this.loading = false;
          this.cdr.detectChanges();
        });
      }
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
    this.destroyCharts();
  }

  download(type: 'pdf' | 'excel' | 'csv'): void {
    this.analytics.downloadReport(type).subscribe({
      next: (blob) => {
        const fileName =
          type === 'pdf' ? 'retention-report.pdf' :
          type === 'excel' ? 'retention-report.xlsx' :
          'retention-report.csv';

        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: (err) => console.error('Download failed:', err)
    });
  }

  private renderCharts(): void {
    if (!this.vm) return;
    if (!this.renewalCanvas?.nativeElement || !this.churnCanvas?.nativeElement || !this.riskCanvas?.nativeElement) {
      setTimeout(() => this.renderCharts(), 0);
      return;
    }

    this.destroyCharts();
    this.buildRenewalChart(this.vm.months, this.vm.renewalRateSeries);
    this.buildChurnChart(this.vm.churnByPolicyTypeLabels, this.vm.churnByPolicyTypeSeries);
    this.buildRiskChart(this.vm.riskBands, this.vm.riskCounts);
  }

  private destroyCharts(): void {
    this.renewalChart?.destroy();
    this.churnChart?.destroy();
    this.riskChart?.destroy();
    this.renewalChart = undefined;
    this.churnChart = undefined;
    this.riskChart = undefined;
  }

  private buildRenewalChart(labels: string[], series: number[]): void {
    const ctx = this.renewalCanvas!.nativeElement.getContext('2d');
    if (!ctx) return;

    this.renewalChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: 'Renewal Rate (%)',
          data: series,
          borderColor: '#2a6ebf',
          backgroundColor: 'rgba(42, 110, 191, 0.15)',
          tension: 0.3,
          fill: true,
          pointRadius: 3,
          pointHoverRadius: 5
        }]
      },
      options: { responsive: true, maintainAspectRatio: false }
    });
  }

  private buildChurnChart(labels: string[], series: number[]): void {
    const ctx = this.churnCanvas!.nativeElement.getContext('2d');
    if (!ctx) return;

    this.churnChart = new Chart(ctx, {
      type: 'bar',
      data: { labels, datasets: [{ label: 'Churn Rate (%)', data: series, backgroundColor: '#ef4444' }] },
      options: { responsive: true, maintainAspectRatio: false }
    });
  }

  private buildRiskChart(labels: string[], series: number[]): void {
    const ctx = this.riskCanvas!.nativeElement.getContext('2d');
    if (!ctx) return;

    this.riskChart = new Chart(ctx, {
      type: 'doughnut',
      data: { labels, datasets: [{ label: 'Customers', data: series, backgroundColor: ['#10b981', '#f59e0b', '#ef4444'] }] },
      options: { responsive: true, maintainAspectRatio: false, cutout: '55%' }
    });
  }
}