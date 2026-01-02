import { Component, OnInit,OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  AdminService,
  PolicySummary,
  AlertsSummary,
  HighRiskCustomer
} from '../../admin/admin-dashboard/admin-service';
import { Sidebar } from '../../../shared/sidebar/sidebar';
import { RouterLink } from '@angular/router';

type PolicyTypeFilter = 'All' | 'Motor' | 'Health';
type RiskLevelFilter = 'High';

@Component({
  selector: 'app-admin-dashboard',
  imports: [Sidebar,CommonModule,FormsModule,RouterLink],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.css',
})
export class AdminDashboard implements OnInit{
 
  // Header state
  searchQuery: string = '';
  dateRange: 'Last 7 Days' | 'Last 30 Days' | 'This Month' = 'Last 7 Days';

  // Filters
  policyTypeFilter: PolicyTypeFilter = 'All';
  riskLevelFilter: RiskLevelFilter = 'High'; // default High

  // Data
  policySummary!: PolicySummary;
  alertsSummary!: AlertsSummary;
  highRiskCustomersOriginal: HighRiskCustomer[] = [];
  highRiskCustomersFiltered: HighRiskCustomer[] = [];

  constructor(private dashboardService: AdminService) {}

  ngOnInit(): void {
    this.policySummary = this.dashboardService.getPolicySummary();
    this.alertsSummary = this.dashboardService.getAlerts();
    this.highRiskCustomersOriginal = this.dashboardService.getHighRiskCustomers();
    this.applyFilters();
  }

  // ===== UI Actions (Console only) =====
  onViewAllPolicies() { console.log('View All Policies clicked'); }
  onViewMotorPolicies() { console.log('View Motor Policies clicked'); }
  onViewHealthPolicies() { console.log('View Health Policies clicked'); }
  onViewExpiringPolicies() { console.log('View Expiring Policies clicked'); }

  onViewCustomer(row: HighRiskCustomer) {
    console.log('View customer', row.customerId, row.customerName, row.policyId);
  }
  onSendReminder(row: HighRiskCustomer) {
    console.log('Send reminder to', row.customerId, 'for policy', row.policyId);
  }

  onNotificationClick() { console.log('Notifications clicked'); 
    alert('No new notifications');
  }
  onLogout() { console.log('Logout clicked'); }
  onDateRangeChange(value: string) {
    this.dateRange = value as any;
    console.log('Date range changed:', this.dateRange);
  }

  // ===== Filters & Search =====
  onPolicyTypeChange(value: PolicyTypeFilter) {
    this.policyTypeFilter = value;
    this.applyFilters();
  }

  onRiskLevelChange(value: RiskLevelFilter) {
    this.riskLevelFilter = value;
    this.applyFilters();
  }

  onSearchChange() {
    this.applyFilters();
  }

  private applyFilters(): void {
    const query = this.searchQuery.trim().toLowerCase();

    let rows = [...this.highRiskCustomersOriginal];

    // Policy Type filter
    if (this.policyTypeFilter !== 'All') {
      rows = rows.filter(r => r.policyType === this.policyTypeFilter);
    }

    // Risk Level filter (always High here, but kept for extensibility)
    if (this.riskLevelFilter === 'High') {
      rows = rows.filter(r => r.riskLevel === 'High');
    }

    // Global search on Customer ID, Policy ID, Customer Name
    if (query) {
      rows = rows.filter(r =>
        r.customerId.toLowerCase().includes(query) ||
        r.policyId.toLowerCase().includes(query) ||
        r.customerName.toLowerCase().includes(query)
      );
    }

    // Keep top 5–10 only (we already limited service to 10; show top 8 here)
    this.highRiskCustomersFiltered = rows.slice(0, 8);
  }

}
