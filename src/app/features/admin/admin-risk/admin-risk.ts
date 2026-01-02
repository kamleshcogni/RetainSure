
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Sidebar } from '../../../shared/sidebar/sidebar';
import { CommonModule } from '@angular/common';
 
import {
  AdminRiskData,
  RiskRecord,
  RiskLevel,
  PolicyType
} from './admin-risk-data';

type RiskLevelFilter = 'All' | RiskLevel;
type PolicyTypeFilter = 'All' | PolicyType;

 
@Component({
  imports:[Sidebar, CommonModule, FormsModule, ReactiveFormsModule],
  selector: 'app-admin-risk',
  templateUrl: './admin-risk.html',
  styleUrls: ['./admin-risk.css']
})
export class AdminRisk  {
   allRisks: RiskRecord[] = [];
  filteredRisks: RiskRecord[] = [];
 
  // ===== Summary =====
  totalHigh = 0;
  totalMedium = 0;
  totalLow = 0;
 
  // ===== Filters =====
  riskLevelFilter: RiskLevelFilter = 'All';
  policyTypeFilter: PolicyTypeFilter = 'All';
 
  constructor(private riskService: AdminRiskData) {}

  ngOnInit(): void {
    this.loadData();
  }
 
  private loadData(): void {
    this.allRisks = this.riskService.getAllRisks();
    this.computeSummary();
    this.applyFilters();
  }
 
  private computeSummary(): void {
    this.totalHigh   = this.allRisks.filter(r => r.riskLevel === 'High').length;
    this.totalMedium = this.allRisks.filter(r => r.riskLevel === 'Medium').length;
    this.totalLow    = this.allRisks.filter(r => r.riskLevel === 'Low').length;
  }
 
  // ===== UI Actions =====
  onRiskLevelChange(value: RiskLevelFilter): void {
    this.riskLevelFilter = value;
    this.applyFilters();
  }
 
  onPolicyTypeChange(value: PolicyTypeFilter): void {
    this.policyTypeFilter = value;
    this.applyFilters();
  }
 
  toggleFlag(record: RiskRecord): void {
    this.riskService.toggleFlag(record.customerId);
    // Refresh local data (simulates real-world state update)
    this.loadData();
    console.log('Flag toggled for', record.customerId);
  }
 
  // ===== Filtering =====
  private applyFilters(): void {
    let rows = [...this.allRisks];
 
    if (this.riskLevelFilter !== 'All') {
      rows = rows.filter(r => r.riskLevel === this.riskLevelFilter);
    }
 
    if (this.policyTypeFilter !== 'All') {
      rows = rows.filter(r => r.policyType === this.policyTypeFilter);
    }
 
    // Default sort: High risk first, then by descending riskScore
    const rank = { High: 3, Medium: 2, Low: 1 };
    rows.sort((a, b) => {
      const levelDiff = rank[b.riskLevel] - rank[a.riskLevel];
      if (levelDiff !== 0) return levelDiff;
      return b.riskScore - a.riskScore;
    });
 
    this.filteredRisks = rows;
  }
 
  // ===== Helpers for UI =====
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
      'row-flagged': record.flagged === true
    };
  }
}
 
 