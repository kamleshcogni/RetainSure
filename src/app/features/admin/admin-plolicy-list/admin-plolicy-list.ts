import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AdminPolicyData } from './admin-policy-data';
import { Policy } from './policy.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-admin-plolicy-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './admin-plolicy-list.html',
  styleUrl: './admin-plolicy-list.css',
})
export class AdminPlolicyList implements OnInit {
  policies: Policy[] = [];
  displayedPolicies: Policy[] = [];
  
  showForm = false;
  isEditMode = false;
  policyForm!: Policy;
  currentFilter: string = 'All';

  constructor(
    private policyService: AdminPolicyData,
    private cdr: ChangeDetectorRef,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    // Listen for route changes (e.g. switching from Motor to Health)
    this.route.data.subscribe(data => {
      this.currentFilter = data['policyType'] || 'All';
      this.loadPolicies();
    });
  }

  loadPolicies() {
    this.policyService.getAll().subscribe(p => {
      this.policies = p;
      this.applyFilter();
      this.cdr.markForCheck();
    });
  }

applyFilter() {
    const today = new Date();
    // Set hours to 0 to compare only the date part
    today.setHours(0, 0, 0, 0);

    if (this.currentFilter === 'All') {
      this.displayedPolicies = [...this.policies];
    } 
    else if (this.currentFilter === 'Expired') {
      this.displayedPolicies = this.policies.filter(p => {
        if (!p.endDate) return false;
        const end = new Date(p.endDate);
        // If the end date is strictly before today, it is expired
        return end < today;
      });
    } 
    else {
      this.displayedPolicies = this.policies.filter(
        p => p.category.toUpperCase() === this.currentFilter.toUpperCase()
      );
    }
  }
  // --- CRUD Operations ---
  openAddForm() {
    this.isEditMode = false;
    this.policyForm = this.emptyPolicy();
    this.showForm = true;
  }

  editPolicy(p: Policy) {
    this.isEditMode = true;
    this.policyForm = { ...p };
    this.showForm = true;
  }

  savePolicy() {
    const request = (this.isEditMode && this.policyForm.policyId)
      ? this.policyService.update(this.policyForm.policyId, this.policyForm)
      : this.policyService.create(this.policyForm);

    request.subscribe(() => {
      this.loadPolicies();
      this.closeForm();
    });
  }

  deletePolicy(id?: number) {
    if (id && confirm('Delete this policy?')) {
      this.policyService.delete(id).subscribe(() => this.loadPolicies());
    }
  }

  closeForm() { this.showForm = false; }
  
  trackByPolicyId(_: number, p: Policy) { return p.policyId; }

  private emptyPolicy(): Policy {
    return { policyName: '', policyNumber: '', category: 'HEALTH', coverage: '', premium: 0, status: 'ACTIVE', startDate: '', endDate: '', renewalDate: '', notes: '' };
  }
}