import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Observable, forkJoin, map, shareReplay, tap } from 'rxjs';
import {
  AdminService,
  PolicySummary,
  AlertsSummary,
  HighRiskCustomer
} from '../../admin/admin-dashboard/admin-service';
import { Sidebar } from '../../../shared/sidebar/sidebar';
import { RouterLink } from '@angular/router';
import { Router } from '@angular/router';

type PolicyTypeFilter = 'All' | 'Motor' | 'Health';
type RiskLevelFilter = 'High';

interface DashboardData {
  policySummary: PolicySummary;
  alertsSummary: AlertsSummary;
  highRiskCustomers: HighRiskCustomer[];
}

@Component({
  selector: 'app-admin-dashboard',
  imports: [Sidebar, CommonModule, FormsModule],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.css',
})
export class AdminDashboard implements OnInit {

  searchQuery: string = '';
  dateRange: 'Last 7 Days' | 'Last 30 Days' | 'This Month' = 'Last 7 Days';

  policyTypeFilter: PolicyTypeFilter = 'All';
  riskLevelFilter: RiskLevelFilter = 'High';

  // Use Observable with async pipe
  dashboardData$!: Observable<DashboardData>;
  
  // For filtered data
  highRiskCustomersOriginal: HighRiskCustomer[] = [];
  highRiskCustomersFiltered: HighRiskCustomer[] = [];

  constructor(private dashboardService: AdminService,private router: Router) {}

  ngOnInit(): void {
    this.loadDashboard();
  }

  private loadDashboard(): void {
    this.dashboardData$ = forkJoin({
      policySummary: this.dashboardService.getPolicySummary(),
      alertsSummary: this.dashboardService.getAlerts(),
      highRiskCustomers: this.dashboardService.getHighRiskCustomers()
    }).pipe(
      tap((data) => {
        this.highRiskCustomersOriginal = data.highRiskCustomers;
        this.applyFilters();
      }),
      shareReplay(1)
    );
  }

  onRefresh(): void {
    this.loadDashboard();
  }

  onViewAllPolicies(): void {
    this.router.navigate(['/admin/policies/all']);
    console.log('View All Policies clicked');
  }
 

  onViewMotorPolicies(): void {
    this.router.navigate(['/admin/policies/motor']);
    console.log('View Motor Policies clicked');
  }

  onViewHealthPolicies(): void {
    this.router.navigate(['/admin/policies/health']);
    console.log('View Health Policies clicked');
  }

  onViewExpiringPolicies(): void {
     this.router.navigate(['/admin/policies/expiring']);
    console.log('View Expiring Policies clicked');
  }

onViewCustomer(row: HighRiskCustomer): void {
  this.router.navigate(['/admin/customers', row.customerId]);
}

  onSendReminder(row: HighRiskCustomer): void {
    console.log('Send reminder to', row.customerId, 'for policy', row.policyId);
  }

  onNotificationClick(): void {
    console.log('Notifications clicked');
    alert('No new notifications');
  }

  onLogout(): void {
    console.log('Logout clicked');
  }

  onDateRangeChange(value: string): void {
    this.dateRange = value as 'Last 7 Days' | 'Last 30 Days' | 'This Month';
  }

  onPolicyTypeChange(value: PolicyTypeFilter): void {
    this.policyTypeFilter = value;
    this.applyFilters();
  }

  onRiskLevelChange(value: RiskLevelFilter): void {
    this.riskLevelFilter = value;
    this.applyFilters();
  }

  onSearchChange(): void {
    this.applyFilters();
  }

  private applyFilters(): void {
    const query = this.searchQuery.trim().toLowerCase();

    let rows = [...this.highRiskCustomersOriginal];

    if (this.policyTypeFilter !== 'All') {
      rows = rows.filter(r => r.policyType === this.policyTypeFilter);
    }

    if (this.riskLevelFilter === 'High') {
      rows = rows.filter(r => r.riskLevel === 'High');
    }

    if (query) {
      rows = rows.filter(r =>
        r.customerId.toLowerCase().includes(query) ||
        r.policyId.toLowerCase().includes(query) ||
        r.customerName.toLowerCase().includes(query)
      );
    }

    this.highRiskCustomersFiltered = rows.slice(0, 8);
  }
}