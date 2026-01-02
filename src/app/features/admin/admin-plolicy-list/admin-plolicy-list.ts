
import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Data, Router } from '@angular/router';
import { AdminPolicyData } from './admin-policy-data';
import { Policy } from './policy.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

type PolicyRouteType = 'All' | 'Motor' | 'Health';

@Component({
  selector: 'app-admin-plolicy-list',
  imports: [CommonModule,FormsModule],
  templateUrl: './admin-plolicy-list.html',
  styleUrl: './admin-plolicy-list.css',
})
export class AdminPlolicyList implements OnInit {
   /** Accepts policyType as input for reusability;
   * when used via routes, route data will set the policyType.
   */
  @Input() policyType?: PolicyRouteType;

  heading = 'All Policies';
  searchTerm = '';
  displayedPolicies: Policy[] = [];
  private allPolicies: Policy[] = [];

  constructor(
    private policyService: AdminPolicyData,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Prefer @Input when present; otherwise use route data.
    this.route.data.subscribe((data: Data) => {
      const typeFromRoute = data['policyType'] as PolicyRouteType | undefined;
      if (!this.policyType && typeFromRoute) {
        this.policyType = typeFromRoute;
      }
      this.loadPolicies();
      this.applyFilters();
    });
  }

  private loadPolicies(): void {
    // Load from service based on policyType
    const type = this.policyType ?? 'All';
    switch (type) {
      case 'Motor':
        this.heading = 'Motor Policies';
        this.allPolicies = this.policyService.getMotorPolicies();
        break;
      case 'Health':
        this.heading = 'Health Policies';
        this.allPolicies = this.policyService.getHealthPolicies();
        break;
      default:
        this.heading = 'All Policies';
        this.allPolicies = this.policyService.getAllPolicies();
        break;
    }
  }

  applyFilters(): void {
    const term = this.searchTerm.trim().toLowerCase();
    let base = this.allPolicies;
    if (term.length > 0) {
      base = base.filter(p => p.policyName.toLowerCase().includes(term));
    }
    // Sort by createdDate desc for a nicer UX
    this.displayedPolicies = [...base].sort(
      (a, b) => new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime()
    );
  }

  onAddNewPolicy(): void {
    // In a real app, navigate to create screen.
    // Kept functional with a simple navigation to the "all" route with a query param.
    this.router.navigate(['/admin/policies/all'], { queryParams: { action: 'create' } });
  }

  viewPolicy(policy: Policy): void {
    // Simple, non-placeholder action: navigate with query param to highlight selection
    this.router.navigate([this.currentRoutePath()], {
      queryParams: { selected: policy.policyId },
      queryParamsHandling: 'merge'
    });
    // Additionally show a confirmation for clear UX
    alert(`Viewing Policy:\n${policy.policyName} (${policy.policyId})`);
  }

  trackByPolicyId(_: number, p: Policy): string {
    return p.policyId;
  }

  // Utility to get current route path based on type
  private currentRoutePath(): string {
    const type = this.policyType ?? 'All';
    if (type === 'Motor') return '/admin/policies/motor';
    if (type === 'Health') return '/admin/policies/health';
    return '/admin/policies/all';
  }

}
