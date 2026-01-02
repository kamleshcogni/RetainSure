
import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { Sidebar } from '../../../shared/sidebar/sidebar';
import Chart from 'chart.js/auto';

@Component({
  selector: 'app-admin-analytics',
  standalone: true,
  imports: [Sidebar],
  templateUrl: './admin-analytics.html',
  styleUrl: './admin-analytics.css',
})
export class AdminAnalytics implements AfterViewInit, OnDestroy {
  @ViewChild('renewalCanvas') renewalCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('churnCanvas') churnCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('riskCanvas') riskCanvas!: ElementRef<HTMLCanvasElement>;

  private renewalChart?: Chart;
  private churnChart?: Chart;
  private riskChart?: Chart;

  // ---------- Dummy Data ----------
  readonly months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  readonly renewalRate = [82, 84, 79, 85, 88, 86, 87, 89, 90, 88, 91, 92]; // %

  readonly policyTypes = ['Auto', 'Health', 'Home', 'Life', 'Travel'];
  readonly policyChurn = [4.8, 6.1, 3.9, 5.3, 7.0]; // %

  readonly riskBands = ['Low', 'Medium', 'High'];
  readonly riskCounts = [3200, 2100, 950]; // customers in each band

  ngAfterViewInit(): void {
    this.buildRenewalChart();
    this.buildChurnChart();
    this.buildRiskChart();
  }

  ngOnDestroy(): void {
    this.renewalChart?.destroy();
    this.churnChart?.destroy();
    this.riskChart?.destroy();
  }

  private buildRenewalChart(): void {
    const ctx = this.renewalCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    this.renewalChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: this.months,
        datasets: [{
          label: 'Renewal Rate (%)',
          data: this.renewalRate,
          borderColor: '#2a6ebf',
          backgroundColor: 'rgba(42, 110, 191, 0.15)',
          tension: 0.3,
          fill: true,
          pointRadius: 3,
          pointHoverRadius: 5
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: true, position: 'top' },
          tooltip: { mode: 'index', intersect: false }
        },
        scales: {
          y: {
            min: 0,
            max: 100,
            ticks: {
              callback: (value) => value + '%'
            },
            grid: { color: 'rgba(0,0,0,0.06)' }
          },
          x: {
            grid: { display: false }
          }
        }
      }
    });
  }

  private buildChurnChart(): void {
    const ctx = this.churnCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    this.churnChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: this.policyTypes,
        datasets: [{
          label: 'Churn Rate (%)',
          data: this.policyChurn,
          backgroundColor: '#ef4444',
          borderRadius: 6,
          maxBarThickness: 42
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: true, position: 'top' },
          tooltip: { mode: 'index', intersect: false }
        },
        scales: {
          y: {
            beginAtZero: true,
            suggestedMax: 10,
            ticks: {
              callback: (value) => value + '%'
            },
            grid: { color: 'rgba(0,0,0,0.06)' }
          },
          x: {
            grid: { display: false }
          }
        }
      }
    });
  }

  private buildRiskChart(): void {
    const ctx = this.riskCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    this.riskChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: this.riskBands,
        datasets: [{
          label: 'Customers',
          data: this.riskCounts,
          backgroundColor: ['#10b981', '#f59e0b', '#ef4444'],
          hoverOffset: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: true, position: 'bottom' },
          tooltip: { mode: 'nearest', intersect: false }
        },
        cutout: '55%'
      }
    });
  }
}


